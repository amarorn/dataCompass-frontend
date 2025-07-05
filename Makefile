# Makefile para DataCompass Frontend

# Variáveis
DOCKER_REGISTRY ?= your-registry.com
IMAGE_NAME ?= datacompass-frontend
VERSION ?= latest
NAMESPACE ?= default
ENVIRONMENT ?= staging

# Cores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

.PHONY: help install build test docker-build docker-push deploy clean

help: ## Mostrar esta ajuda
	@echo "DataCompass Frontend - Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Instalar dependências
	@echo "$(YELLOW)Instalando dependências...$(NC)"
	pnpm install

build: ## Build da aplicação
	@echo "$(YELLOW)Fazendo build da aplicação...$(NC)"
	pnpm run build
	@echo "$(GREEN)Build concluído!$(NC)"

test: ## Executar testes
	@echo "$(YELLOW)Executando testes...$(NC)"
	pnpm run test

lint: ## Executar linting
	@echo "$(YELLOW)Executando linting...$(NC)"
	pnpm run lint

lint-fix: ## Corrigir problemas de linting
	@echo "$(YELLOW)Corrigindo problemas de linting...$(NC)"
	pnpm run lint --fix

dev: ## Executar em modo desenvolvimento
	@echo "$(YELLOW)Iniciando servidor de desenvolvimento...$(NC)"
	pnpm run dev

preview: ## Preview da build de produção
	@echo "$(YELLOW)Iniciando preview da build...$(NC)"
	pnpm run preview

docker-build: ## Build da imagem Docker
	@echo "$(YELLOW)Fazendo build da imagem Docker...$(NC)"
	docker build -t $(IMAGE_NAME):$(VERSION) .
	docker tag $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):latest
	@echo "$(GREEN)Imagem Docker criada: $(IMAGE_NAME):$(VERSION)$(NC)"

docker-push: ## Push da imagem Docker para registry
	@echo "$(YELLOW)Fazendo push da imagem para $(DOCKER_REGISTRY)...$(NC)"
	docker tag $(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION)
	docker tag $(IMAGE_NAME):$(VERSION) $(DOCKER_REGISTRY)/$(IMAGE_NAME):latest
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):latest
	@echo "$(GREEN)Push concluído!$(NC)"

docker-run: ## Executar container Docker localmente
	@echo "$(YELLOW)Executando container Docker...$(NC)"
	docker run -p 8080:8080 --name datacompass-frontend-local $(IMAGE_NAME):$(VERSION)

docker-stop: ## Parar container Docker local
	@echo "$(YELLOW)Parando container Docker...$(NC)"
	docker stop datacompass-frontend-local || true
	docker rm datacompass-frontend-local || true

k8s-validate: ## Validar manifestos Kubernetes
	@echo "$(YELLOW)Validando manifestos Kubernetes...$(NC)"
	kubectl kustomize k8s/overlays/$(ENVIRONMENT) > /tmp/k8s-manifest.yaml
	kubectl apply --dry-run=client -f /tmp/k8s-manifest.yaml
	@echo "$(GREEN)Manifestos válidos!$(NC)"

k8s-deploy: ## Deploy no Kubernetes
	@echo "$(YELLOW)Fazendo deploy no Kubernetes ($(ENVIRONMENT))...$(NC)"
	kubectl apply -k k8s/overlays/$(ENVIRONMENT)
	kubectl rollout status deployment/datacompass-frontend -n $(NAMESPACE)
	@echo "$(GREEN)Deploy concluído!$(NC)"

k8s-undeploy: ## Remover do Kubernetes
	@echo "$(YELLOW)Removendo do Kubernetes ($(ENVIRONMENT))...$(NC)"
	kubectl delete -k k8s/overlays/$(ENVIRONMENT)
	@echo "$(GREEN)Remoção concluída!$(NC)"

k8s-logs: ## Ver logs do Kubernetes
	@echo "$(YELLOW)Mostrando logs do Kubernetes...$(NC)"
	kubectl logs -l app=datacompass-frontend -n $(NAMESPACE) --tail=100 -f

k8s-status: ## Ver status no Kubernetes
	@echo "$(YELLOW)Status no Kubernetes:$(NC)"
	kubectl get pods,svc,ingress -l app=datacompass-frontend -n $(NAMESPACE)

k8s-describe: ## Descrever recursos no Kubernetes
	@echo "$(YELLOW)Descrevendo recursos no Kubernetes...$(NC)"
	kubectl describe deployment/datacompass-frontend -n $(NAMESPACE)

k8s-port-forward: ## Port forward para desenvolvimento
	@echo "$(YELLOW)Fazendo port forward para localhost:8080...$(NC)"
	kubectl port-forward svc/datacompass-frontend-service 8080:80 -n $(NAMESPACE)

update-image: ## Atualizar imagem no Kubernetes
	@echo "$(YELLOW)Atualizando imagem no Kubernetes...$(NC)"
	kubectl set image deployment/datacompass-frontend datacompass-frontend=$(DOCKER_REGISTRY)/$(IMAGE_NAME):$(VERSION) -n $(NAMESPACE)
	kubectl rollout status deployment/datacompass-frontend -n $(NAMESPACE)
	@echo "$(GREEN)Imagem atualizada!$(NC)"

clean: ## Limpar arquivos temporários
	@echo "$(YELLOW)Limpando arquivos temporários...$(NC)"
	rm -rf dist/
	rm -rf node_modules/.cache/
	docker system prune -f
	@echo "$(GREEN)Limpeza concluída!$(NC)"

setup-env: ## Configurar ambiente de desenvolvimento
	@echo "$(YELLOW)Configurando ambiente de desenvolvimento...$(NC)"
	cp .env.example .env.local
	@echo "$(GREEN)Arquivo .env.local criado! Edite as variáveis conforme necessário.$(NC)"

full-deploy: docker-build docker-push k8s-deploy ## Build, push e deploy completo
	@echo "$(GREEN)Deploy completo realizado!$(NC)"

# Comandos para diferentes ambientes
deploy-staging: ## Deploy para staging
	$(MAKE) k8s-deploy ENVIRONMENT=staging NAMESPACE=staging

deploy-production: ## Deploy para production
	$(MAKE) k8s-deploy ENVIRONMENT=production NAMESPACE=production

# Comandos de monitoramento
monitor: ## Monitorar aplicação
	@echo "$(YELLOW)Monitorando aplicação...$(NC)"
	watch kubectl get pods,svc -l app=datacompass-frontend -n $(NAMESPACE)

health-check: ## Verificar saúde da aplicação
	@echo "$(YELLOW)Verificando saúde da aplicação...$(NC)"
	kubectl exec -it deployment/datacompass-frontend -n $(NAMESPACE) -- curl -f http://localhost:8080/health

# Comandos de backup e restore
backup-config: ## Backup das configurações
	@echo "$(YELLOW)Fazendo backup das configurações...$(NC)"
	kubectl get configmap datacompass-frontend-config -n $(NAMESPACE) -o yaml > backup-config-$(shell date +%Y%m%d-%H%M%S).yaml

# Informações do sistema
info: ## Mostrar informações do sistema
	@echo "$(YELLOW)Informações do sistema:$(NC)"
	@echo "Docker Registry: $(DOCKER_REGISTRY)"
	@echo "Image Name: $(IMAGE_NAME)"
	@echo "Version: $(VERSION)"
	@echo "Namespace: $(NAMESPACE)"
	@echo "Environment: $(ENVIRONMENT)"

