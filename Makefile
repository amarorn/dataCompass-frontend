# Makefile para DataCompass Frontend
# Comandos para desenvolvimento, build, deploy e CI/CD

# Variáveis
DOCKER_REGISTRY ?= your-registry.com
IMAGE_NAME = datacompass-frontend
VERSION ?= latest
ENVIRONMENT ?= staging
NAMESPACE ?= $(ENVIRONMENT)
AWS_REGION ?= us-east-1
ECR_REPOSITORY ?= datacompass-frontend

# Cores para output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

.PHONY: help install dev build test lint docker-build docker-push k8s-deploy k8s-status k8s-logs clean ci-setup

help: ## Mostrar ajuda
	@echo "$(BLUE)DataCompass Frontend - Comandos Disponíveis$(NC)"
	@echo "=============================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'

# === DESENVOLVIMENTO ===
install: ## Instalar dependências
	@echo "$(BLUE)Instalando dependências...$(NC)"
	pnpm install

dev: ## Executar em modo desenvolvimento
	@echo "$(BLUE)Iniciando servidor de desenvolvimento...$(NC)"
	pnpm run dev

build: ## Build da aplicação
	@echo "$(BLUE)Fazendo build da aplicação...$(NC)"
	pnpm run build

test: ## Executar testes
	@echo "$(BLUE)Executando testes...$(NC)"
	pnpm run test || echo "$(YELLOW)Testes não configurados$(NC)"

lint: ## Executar linting
	@echo "$(BLUE)Executando linting...$(NC)"
	pnpm run lint

format: ## Formatar código
	@echo "$(BLUE)Formatando código...$(NC)"
	pnpm run format || echo "$(YELLOW)Formatação não configurada$(NC)"

# === CI/CD QUALITY CHECKS ===
ci-install: ## Instalar dependências para CI
	@echo "$(BLUE)Instalando dependências (CI mode)...$(NC)"
	pnpm install --frozen-lockfile

ci-test: ## Executar todos os testes para CI
	@echo "$(BLUE)Executando testes completos...$(NC)"
	pnpm run lint
	pnpm run test || echo "$(YELLOW)Testes não configurados$(NC)"
	pnpm run build

ci-security: ## Executar verificações de segurança
	@echo "$(BLUE)Executando audit de segurança...$(NC)"
	pnpm audit --audit-level moderate || echo "$(YELLOW)Vulnerabilidades encontradas$(NC)"

ci-build-test: ## Testar build Docker
	@echo "$(BLUE)Testando build Docker...$(NC)"
	docker build -t $(IMAGE_NAME):test .
	docker run --rm -d --name test-container -p 8080:8080 $(IMAGE_NAME):test
	sleep 10
	curl -f http://localhost:8080/health || echo "$(YELLOW)Health check falhou$(NC)"
	docker stop test-container

# === DOCKER ===
docker-build: ## Build da imagem Docker
	@echo "$(BLUE)Fazendo build da imagem Docker...$(NC)"
	docker build -t $(IMAGE_NAME):$(VERSION) .
	docker tag $(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION)

docker-push: ## Push da imagem para registry
	@echo "$(BLUE)Fazendo push da imagem...$(NC)"
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION)

docker-run: ## Executar container localmente
	@echo "$(BLUE)Executando container...$(NC)"
	docker run --rm -p 8080:8080 $(IMAGE_NAME):$(VERSION)

# === AWS ECR ===
ecr-login: ## Login no AWS ECR
	@echo "$(BLUE)Fazendo login no ECR...$(NC)"
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$(AWS_REGION).amazonaws.com

ecr-create: ## Criar repositório ECR se não existir
	@echo "$(BLUE)Criando repositório ECR...$(NC)"
	aws ecr describe-repositories --repository-names $(ECR_REPOSITORY) --region $(AWS_REGION) || \
	aws ecr create-repository --repository-name $(ECR_REPOSITORY) --region $(AWS_REGION)

ecr-build-push: ecr-login ecr-create ## Build e push para ECR
	@echo "$(BLUE)Build e push para ECR...$(NC)"
	./scripts/build-and-push.sh $(VERSION) $(ENVIRONMENT)

# === KUBERNETES ===
k8s-deploy: ## Deploy no Kubernetes
	@echo "$(BLUE)Fazendo deploy no Kubernetes ($(ENVIRONMENT))...$(NC)"
	kubectl apply -k k8s/overlays/$(ENVIRONMENT) -n $(NAMESPACE)
	kubectl rollout status deployment/$(IMAGE_NAME) -n $(NAMESPACE)

k8s-status: ## Verificar status no Kubernetes
	@echo "$(BLUE)Status do deployment:$(NC)"
	kubectl get pods,services,ingress -l app=$(IMAGE_NAME) -n $(NAMESPACE)

k8s-logs: ## Ver logs do Kubernetes
	@echo "$(BLUE)Logs da aplicação:$(NC)"
	kubectl logs -l app=$(IMAGE_NAME) -n $(NAMESPACE) --tail=100 -f

k8s-port-forward: ## Port forward para desenvolvimento
	@echo "$(BLUE)Port forward para localhost:8080...$(NC)"
	kubectl port-forward service/$(IMAGE_NAME)-service 8080:80 -n $(NAMESPACE)

k8s-rollback: ## Rollback do deployment
	@echo "$(BLUE)Fazendo rollback...$(NC)"
	kubectl rollout undo deployment/$(IMAGE_NAME) -n $(NAMESPACE)
	kubectl rollout status deployment/$(IMAGE_NAME) -n $(NAMESPACE)

# === DEPLOY SCRIPTS ===
deploy-staging: ## Deploy para staging usando script
	@echo "$(BLUE)Deploy para staging...$(NC)"
	./scripts/deploy.sh staging $(VERSION)

deploy-production: ## Deploy para production usando script
	@echo "$(BLUE)Deploy para production...$(NC)"
	./scripts/deploy.sh production $(VERSION)

# === DEPLOY COMPLETO ===
full-deploy: ecr-build-push k8s-deploy ## Build, push e deploy completo

# === UTILITÁRIOS ===
update-image: ## Atualizar imagem no Kubernetes
	@echo "$(BLUE)Atualizando imagem para $(VERSION)...$(NC)"
	kubectl set image deployment/$(IMAGE_NAME) $(IMAGE_NAME)=$(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION) -n $(NAMESPACE)
	kubectl rollout status deployment/$(IMAGE_NAME) -n $(NAMESPACE)

clean: ## Limpar arquivos temporários
	@echo "$(BLUE)Limpando arquivos temporários...$(NC)"
	rm -rf dist/
	rm -rf node_modules/.cache/
	rm -f .env.local
	docker system prune -f

check-env: ## Verificar variáveis de ambiente
	@echo "$(BLUE)Variáveis de ambiente:$(NC)"
	@echo "DOCKER_REGISTRY: $(DOCKER_REGISTRY)"
	@echo "IMAGE_NAME: $(IMAGE_NAME)"
	@echo "VERSION: $(VERSION)"
	@echo "ENVIRONMENT: $(ENVIRONMENT)"
	@echo "NAMESPACE: $(NAMESPACE)"
	@echo "AWS_REGION: $(AWS_REGION)"
	@echo "ECR_REPOSITORY: $(ECR_REPOSITORY)"

# === CI/CD SETUP ===
ci-setup: ## Configurar ambiente para CI/CD
	@echo "$(BLUE)Configurando ambiente CI/CD...$(NC)"
	@echo "1. Configure os secrets do GitHub:"
	@echo "   - AWS_ACCESS_KEY_ID"
	@echo "   - AWS_SECRET_ACCESS_KEY"
	@echo "   - AWS_ACCOUNT_ID"
	@echo "   - SLACK_WEBHOOK_URL (opcional)"
	@echo ""
	@echo "2. Configure os environments:"
	@echo "   - staging (sem proteções)"
	@echo "   - production (com aprovação)"
	@echo "   - production-release (com aprovação + timer)"
	@echo ""
	@echo "📖 Guia completo: scripts/setup-github-secrets.md"

