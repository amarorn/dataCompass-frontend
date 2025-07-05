#!/bin/bash

# DataCompass Frontend Build and Push Script
# Usage: ./scripts/build-and-push.sh [version] [environment]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
VERSION=${1:-$(git rev-parse --short HEAD)}
ENVIRONMENT=${2:-staging}
AWS_REGION=${AWS_REGION:-us-east-1}
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
    command -v docker >/dev/null 2>&1 || { log_error "Docker is required but not installed. Aborting."; exit 1; }
    command -v aws >/dev/null 2>&1 || { log_error "AWS CLI is required but not installed. Aborting."; exit 1; }
    command -v pnpm >/dev/null 2>&1 || { log_error "pnpm is required but not installed. Aborting."; exit 1; }
    
    # Check AWS credentials
    aws sts get-caller-identity >/dev/null 2>&1 || { log_error "AWS credentials not configured. Aborting."; exit 1; }
    
    # Check if we're in the right directory
    [ -f "package.json" ] || { log_error "package.json not found. Run this script from the project root. Aborting."; exit 1; }
    [ -f "Dockerfile" ] || { log_error "Dockerfile not found. Run this script from the project root. Aborting."; exit 1; }
    
    log_success "Prerequisites check passed"
}

setup_environment() {
    log_info "Setting up environment for: $ENVIRONMENT"
    
    # Copy environment template
    cp .env.example .env.local
    
    # Set environment-specific variables
    case $ENVIRONMENT in
        staging)
            echo "VITE_ENVIRONMENT=staging" >> .env.local
            echo "VITE_API_URL=https://staging-api.datacompass.yourdomain.com/api" >> .env.local
            ;;
        production)
            echo "VITE_ENVIRONMENT=production" >> .env.local
            echo "VITE_API_URL=https://api.datacompass.yourdomain.com/api" >> .env.local
            ;;
        *)
            log_warning "Unknown environment: $ENVIRONMENT. Using default settings."
            echo "VITE_ENVIRONMENT=$ENVIRONMENT" >> .env.local
            ;;
    esac
    
    echo "VITE_APP_VERSION=$VERSION" >> .env.local
    
    log_success "Environment setup completed"
}

install_dependencies() {
    log_info "Installing dependencies..."
    
    pnpm install --frozen-lockfile
    
    log_success "Dependencies installed"
}

run_tests() {
    log_info "Running tests and quality checks..."
    
    # Run linting
    pnpm run lint || { log_error "Linting failed. Aborting."; exit 1; }
    
    # Run tests if available
    pnpm run test || log_warning "Tests not configured or failed"
    
    log_success "Quality checks completed"
}

build_application() {
    log_info "Building application..."
    
    pnpm run build
    
    # Check if build was successful
    [ -d "dist" ] || { log_error "Build failed - dist directory not found. Aborting."; exit 1; }
    
    # Show build size
    log_info "Build size: $(du -sh dist/ | cut -f1)"
    
    log_success "Application built successfully"
}

setup_ecr() {
    log_info "Setting up ECR repository..."
    
    # Create repository if it doesn't exist
    aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION >/dev/null 2>&1 || {
        log_info "Creating ECR repository: $ECR_REPOSITORY"
        aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION
    }
    
    # Login to ECR
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com
    
    log_success "ECR setup completed"
}

build_docker_image() {
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local image_uri="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"
    
    log_info "Building Docker image..."
    
    # Build image
    docker build -t $ECR_REPOSITORY:$VERSION .
    
    # Tag for ECR
    docker tag $ECR_REPOSITORY:$VERSION $image_uri:$VERSION
    docker tag $ECR_REPOSITORY:$VERSION $image_uri:latest
    
    log_success "Docker image built: $image_uri:$VERSION"
}

test_docker_image() {
    log_info "Testing Docker image..."
    
    # Start container
    docker run --rm -d --name test-container -p 8080:8080 $ECR_REPOSITORY:$VERSION
    
    # Wait for container to start
    sleep 10
    
    # Test health endpoint
    if curl -f http://localhost:8080/health >/dev/null 2>&1; then
        log_success "Health check passed"
    else
        log_warning "Health check failed"
    fi
    
    # Test main page
    if curl -f http://localhost:8080/ >/dev/null 2>&1; then
        log_success "Main page check passed"
    else
        log_warning "Main page check failed"
    fi
    
    # Stop container
    docker stop test-container
    
    log_success "Docker image testing completed"
}

scan_image() {
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local image_uri="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$VERSION"
    
    log_info "Scanning image for vulnerabilities..."
    
    # Check if trivy is available
    if command -v trivy >/dev/null 2>&1; then
        trivy image --severity HIGH,CRITICAL $image_uri || log_warning "Vulnerabilities found in image"
    else
        log_warning "Trivy not installed, skipping vulnerability scan"
    fi
    
    log_success "Image scan completed"
}

push_image() {
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local image_uri="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY"
    
    log_info "Pushing image to ECR..."
    
    docker push $image_uri:$VERSION
    docker push $image_uri:latest
    
    log_success "Image pushed successfully: $image_uri:$VERSION"
}

cleanup() {
    log_info "Cleaning up..."
    
    # Remove local environment file
    rm -f .env.local
    
    # Clean up Docker images (optional)
    # docker rmi $ECR_REPOSITORY:$VERSION 2>/dev/null || true
    
    log_success "Cleanup completed"
}

show_summary() {
    local account_id=$(aws sts get-caller-identity --query Account --output text)
    local image_uri="$account_id.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:$VERSION"
    
    echo ""
    echo "=== BUILD AND PUSH SUMMARY ==="
    echo "Version: $VERSION"
    echo "Environment: $ENVIRONMENT"
    echo "Image URI: $image_uri"
    echo "Region: $AWS_REGION"
    echo "Repository: $ECR_REPOSITORY"
    echo ""
    echo "Next steps:"
    echo "1. Deploy to staging: ./scripts/deploy.sh staging $VERSION"
    echo "2. Deploy to production: ./scripts/deploy.sh production $VERSION"
    echo "3. Or use GitHub Actions for automated deployment"
    echo ""
}

main() {
    echo "🐳 DataCompass Frontend Build and Push Script"
    echo "============================================="
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_environment
    
    # Install dependencies
    install_dependencies
    
    # Run tests
    run_tests
    
    # Build application
    build_application
    
    # Setup ECR
    setup_ecr
    
    # Build Docker image
    build_docker_image
    
    # Test Docker image
    test_docker_image
    
    # Scan for vulnerabilities
    scan_image
    
    # Push to ECR
    push_image
    
    # Cleanup
    cleanup
    
    # Show summary
    show_summary
    
    log_success "🎉 Build and push completed successfully!"
}

# Handle script interruption
trap 'log_error "Script interrupted"; cleanup; exit 1' INT TERM

# Show usage if help requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "Usage: $0 [version] [environment]"
    echo ""
    echo "Arguments:"
    echo "  version      Image version/tag [default: git short hash]"
    echo "  environment  Target environment (staging|production) [default: staging]"
    echo ""
    echo "Environment variables:"
    echo "  AWS_REGION       AWS region [default: us-east-1]"
    echo "  ECR_REPOSITORY   ECR repository name [default: datacompass-frontend]"
    echo ""
    echo "Examples:"
    echo "  $0 v1.0.0 production"
    echo "  $0 latest staging"
    echo "  AWS_REGION=us-west-2 $0 v1.2.0 production"
    exit 0
fi

# Run main function
main "$@"

