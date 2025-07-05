#!/bin/bash

# DataCompass Frontend Deploy Script
# Usage: ./scripts/deploy.sh [environment] [version]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
AWS_REGION=${AWS_REGION:-us-east-1}
EKS_CLUSTER_NAME=${EKS_CLUSTER_NAME:-whatsapp-analytics-production}
ECR_REPOSITORY=${ECR_REPOSITORY:-datacompass-frontend}

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v kubectl >/dev/null 2>&1 || { log_error "kubectl is required but not installed. Aborting."; exit 1; }
    command -v aws >/dev/null 2>&1 || { log_error "AWS CLI is required but not installed. Aborting."; exit 1; }
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    
    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || { log_error "AWS credentials not configured. Aborting."; exit 1; }
    
    log_success "Prerequisites check passed"
}

validate_environment() {
    log_info "Validating environment: $ENVIRONMENT"
    
    case $ENVIRONMENT in
        staging|production)
            log_success "Environment '$ENVIRONMENT' is valid"
            ;;
        *)
            log_error "Invalid environment: $ENVIRONMENT. Must be 'staging' or 'production'"
            exit 1
            ;;
    esac
}

setup_kubeconfig() {
    log_info "Setting up kubeconfig for cluster: $EKS_CLUSTER_NAME"
    
    aws eks update-kubeconfig --region $AWS_REGION --name $EKS_CLUSTER_NAME
    
    # Test connection
    kubectl cluster-info >/dev/null 2>&1 || { log_error "Failed to connect to Kubernetes cluster. Aborting."; exit 1; }
    
    log_success "Kubeconfig setup completed"
}

create_namespace() {
    log_info "Creating namespace if not exists: $ENVIRONMENT"
    
    kubectl create namespace $ENVIRONMENT --dry-run=client -o yaml | kubectl apply -f -
    
    log_success "Namespace '$ENVIRONMENT' is ready"
}

get_image_uri() {
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    echo "$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$VERSION"
}

check_image_exists() {
    local image_uri=$(get_image_uri)
    log_info "Checking if image exists: $image_uri"
    
    aws ecr describe-images --repository-name $ECR_REPOSITORY --image-ids imageTag=$VERSION --region $AWS_REGION >/dev/null 2>&1 || {
        log_error "Image not found: $image_uri"
        log_info "Available tags:"
        aws ecr describe-images --repository-name $ECR_REPOSITORY --region $AWS_REGION --query 'imageDetails[*].imageTags[0]' --output table || echo "No images found"
        exit 1
    }
    
    log_success "Image exists: $image_uri"
}

deploy_application() {
    local image_uri=$(get_image_uri)
    log_info "Deploying application to $ENVIRONMENT with image: $image_uri"
    
    # Update image in kustomization
    cd k8s/overlays/$ENVIRONMENT
    
    # Backup original kustomization
    cp kustomization.yaml kustomization.yaml.bak
    
    # Update image tag
    kustomize edit set image datacompass-frontend=$image_uri
    
    # Apply manifests
    kubectl apply -k . -n $ENVIRONMENT
    
    # Restore original kustomization
    mv kustomization.yaml.bak kustomization.yaml
    
    log_success "Manifests applied successfully"
}

wait_for_deployment() {
    log_info "Waiting for deployment to complete..."
    
    kubectl rollout status deployment/datacompass-frontend -n $ENVIRONMENT --timeout=600s || {
        log_error "Deployment failed or timed out"
        log_info "Recent events:"
        kubectl get events -n $ENVIRONMENT --sort-by=.metadata.creationTimestamp | tail -10
        exit 1
    }
    
    log_success "Deployment completed successfully"
}

run_health_checks() {
    log_info "Running health checks..."
    
    # Wait for pods to be ready
    kubectl wait --for=condition=ready pod -l app=datacompass-frontend -n $ENVIRONMENT --timeout=300s || {
        log_warning "Pods not ready within timeout"
    }
    
    # Get service URL
    local service_url=$(kubectl get service datacompass-frontend-service -n $ENVIRONMENT -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "")
    
    if [ -z "$service_url" ]; then
        log_warning "Load balancer not ready, using port-forward for testing"
        kubectl port-forward service/datacompass-frontend-service 8080:80 -n $ENVIRONMENT &
        local port_forward_pid=$!
        sleep 10
        service_url="localhost:8080"
    fi
    
    # Run health checks
    log_info "Testing health endpoint..."
    curl -f http://$service_url/health >/dev/null 2>&1 && log_success "Health check passed" || log_warning "Health check failed"
    
    log_info "Testing main page..."
    curl -f http://$service_url/ >/dev/null 2>&1 && log_success "Main page check passed" || log_warning "Main page check failed"
    
    # Clean up port-forward if used
    if [ ! -z "$port_forward_pid" ]; then
        kill $port_forward_pid 2>/dev/null || true
    fi
}

get_deployment_info() {
    log_info "Getting deployment information..."
    
    echo ""
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "Environment: $ENVIRONMENT"
    echo "Version: $VERSION"
    echo "Image: $(get_image_uri)"
    echo "Cluster: $EKS_CLUSTER_NAME"
    echo "Region: $AWS_REGION"
    echo ""
    
    echo "=== PODS ==="
    kubectl get pods -l app=datacompass-frontend -n $ENVIRONMENT
    echo ""
    
    echo "=== SERVICES ==="
    kubectl get services -l app=datacompass-frontend -n $ENVIRONMENT
    echo ""
    
    echo "=== INGRESS ==="
    kubectl get ingress -l app=datacompass-frontend -n $ENVIRONMENT
    echo ""
    
    # Get external URL if available
    local ingress_url=$(kubectl get ingress datacompass-frontend-ingress -n $ENVIRONMENT -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || echo "Not available yet")
    echo "External URL: http://$ingress_url"
    echo ""
}

rollback_deployment() {
    log_warning "Rolling back deployment..."
    
    kubectl rollout undo deployment/datacompass-frontend -n $ENVIRONMENT
    kubectl rollout status deployment/datacompass-frontend -n $ENVIRONMENT --timeout=300s
    
    log_success "Rollback completed"
}

main() {
    echo "🚀 DataCompass Frontend Deployment Script"
    echo "=========================================="
    echo ""
    
    # Validate inputs
    validate_environment
    
    # Check prerequisites
    check_prerequisites
    
    # Setup Kubernetes
    setup_kubeconfig
    create_namespace
    
    # Check image
    check_image_exists
    
    # Deploy
    deploy_application
    wait_for_deployment
    
    # Verify
    run_health_checks
    get_deployment_info
    
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Next steps:"
    echo "- Monitor the application: kubectl logs -l app=datacompass-frontend -n $ENVIRONMENT -f"
    echo "- Check metrics: kubectl top pods -l app=datacompass-frontend -n $ENVIRONMENT"
    echo "- Rollback if needed: kubectl rollout undo deployment/datacompass-frontend -n $ENVIRONMENT"
}

# Handle script interruption
trap 'log_error "Script interrupted"; exit 1' INT TERM

# Show usage if help requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "Usage: $0 [environment] [version]"
    echo ""
    echo "Arguments:"
    echo "  environment  Target environment (staging|production) [default: staging]"
    echo "  version      Image version/tag to deploy [default: latest]"
    echo ""
    echo "Environment variables:"
    echo "  AWS_REGION           AWS region [default: us-east-1]"
    echo "  EKS_CLUSTER_NAME     EKS cluster name [default: whatsapp-analytics-production]"
    echo "  ECR_REPOSITORY       ECR repository name [default: datacompass-frontend]"
    echo ""
    echo "Examples:"
    echo "  $0 staging latest"
    echo "  $0 production v1.0.0"
    echo "  AWS_REGION=us-west-2 $0 production v1.2.0"
    exit 0
fi

# Run main function
main "$@"

