# 🧭 DataCompass Frontend - Kubernetes Ready

Interface web moderna para a plataforma DataCompass - Sistema de análise e gerenciamento de dados do WhatsApp Business, **otimizada para deploy em Kubernetes**.

## 🚀 Quick Start

### Deploy Rápido no Kubernetes

```bash
# 1. Configurar registry
export DOCKER_REGISTRY=your-registry.com

# 2. Build e deploy
make full-deploy ENVIRONMENT=staging

# 3. Verificar status
make k8s-status

# 4. Acessar aplicação
kubectl get ingress datacompass-frontend-ingress
```

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env.local

# Executar em modo desenvolvimento
pnpm run dev
```

## 📁 Estrutura do Projeto

```
dataCompass-frontend/
├── src/                          # Código fonte React
│   ├── components/              # Componentes React
│   ├── hooks/                   # Hooks customizados (incluindo API)
│   ├── lib/                     # Utilitários (API, WebSocket)
│   └── assets/                  # Recursos estáticos
├── k8s/                         # Manifestos Kubernetes
│   ├── base/                    # Configuração base
│   └── overlays/                # Configurações por ambiente
│       ├── staging/             # Ambiente de staging
│       └── production/          # Ambiente de produção
├── Dockerfile                   # Multi-stage build otimizado
├── nginx.conf                   # Configuração Nginx com proxy API
├── Makefile                     # Automação de build e deploy
└── KUBERNETES_DEPLOY_GUIDE.md   # Guia completo de deploy
```

## 🛠️ Tecnologias

### Frontend
- **React 19** - Framework frontend moderno
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Sistema de design
- **Recharts** - Gráficos e visualizações

### Infraestrutura
- **Docker** - Containerização
- **Kubernetes** - Orquestração
- **Nginx** - Servidor web e proxy
- **Kustomize** - Gerenciamento de configurações K8s

## 🔗 Comunicação com Backend

### Configuração Automática
O frontend está configurado para se comunicar automaticamente com o backend DataCompass no Kubernetes:

```yaml
# URL interna do cluster
http://whatsapp-analytics-api-service.default.svc.cluster.local
```

### Proxy Nginx
Todas as chamadas `/api/*` são automaticamente redirecionadas para o backend:

```nginx
location /api/ {
    proxy_pass http://whatsapp-analytics-api-service.default.svc.cluster.local/;
    # ... configurações de proxy
}
```

### WebSocket
Suporte a comunicação em tempo real via WebSocket para:
- Notificações em tempo real
- Atualizações de estatísticas
- Status de mensagens

## 🚀 Deploy no Kubernetes

### Pré-requisitos
- Cluster Kubernetes com backend DataCompass já rodando
- Docker registry configurado
- kubectl e kustomize instalados

### Ambientes Disponíveis

#### Staging
```bash
make deploy-staging
```
- **URL:** `https://staging-datacompass.yourdomain.com`
- **Replicas:** 1
- **Resources:** Limitados para economia

#### Production
```bash
make deploy-production
```
- **URL:** `https://datacompass.yourdomain.com`
- **Replicas:** 3 (auto-scaling 2-10)
- **Resources:** Otimizados para performance

### Comandos Úteis

```bash
# Build da imagem Docker
make docker-build

# Deploy completo (build + push + deploy)
make full-deploy

# Verificar status
make k8s-status

# Ver logs em tempo real
make k8s-logs

# Port forward para desenvolvimento
make k8s-port-forward

# Atualizar versão
make update-image VERSION=v1.1.0

# Rollback
kubectl rollout undo deployment/datacompass-frontend
```

## 📊 Funcionalidades

### Dashboard Principal
- Estatísticas em tempo real de usuários e mensagens
- Gráficos interativos de atividade
- Indicadores de performance do sistema

### Gerenciamento de Usuários
- Lista completa de usuários registrados via WhatsApp
- Filtros avançados e busca em tempo real
- Histórico de atividades

### Mensagens WhatsApp
- Histórico completo de conversas
- Filtros por tipo de mensagem e período
- Status de entrega e resposta

### Analytics & Relatórios
- Gráficos de registros e conversões
- Análise de tipos de mensagem
- Atividade por horário do dia
- Exportação de dados

### Configurações
- Configuração da API WhatsApp Business
- Configurações do banco de dados
- Respostas automáticas personalizáveis
- Status do sistema em tempo real

## 🔧 Configuração

### Variáveis de Ambiente

```bash
# API Configuration
VITE_API_URL=https://api.datacompass.yourdomain.com/api
VITE_WS_URL=wss://api.datacompass.yourdomain.com

# Application Settings
VITE_APP_NAME=DataCompass
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Authentication
VITE_JWT_STORAGE_KEY=datacompass_token
```

### Configuração por Ambiente

As configurações são gerenciadas via Kustomize:

- **Base:** Configurações comuns em `k8s/base/`
- **Staging:** Sobrescritas em `k8s/overlays/staging/`
- **Production:** Sobrescritas em `k8s/overlays/production/`

## 🔒 Segurança

### Container Security
- Execução como usuário não-root
- Filesystem read-only
- Capabilities mínimas
- Security context restritivo

### Network Security
- Comunicação interna via DNS do cluster
- HTTPS obrigatório via Ingress
- Headers de segurança configurados no Nginx

### Resource Limits
- CPU e memória limitados
- Auto-scaling configurado
- Health checks implementados

## 📈 Monitoramento

### Health Checks
- **Liveness Probe:** `/health` (porta 8080)
- **Readiness Probe:** `/health` (porta 8080)
- **Startup Probe:** Configurado para inicialização

### Logs
```bash
# Logs da aplicação
kubectl logs -l app=datacompass-frontend -f

# Logs do Nginx
kubectl exec -it deployment/datacompass-frontend -- tail -f /var/log/nginx/access.log
```

### Métricas
- HPA configurado para CPU e memória
- Métricas expostas via Kubernetes

## 🛠️ Desenvolvimento

### Setup Local
```bash
# Instalar dependências
pnpm install

# Configurar ambiente
cp .env.example .env.local

# Executar desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview da build
pnpm run preview
```

### Integração com Backend Local
```bash
# No .env.local para desenvolvimento
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=ws://localhost:3000
```

## 📚 Documentação

- **[Guia de Deploy Kubernetes](KUBERNETES_DEPLOY_GUIDE.md)** - Instruções completas de deploy
- **[Documentação da API](src/lib/api.js)** - Configuração e uso da API
- **[Hooks Customizados](src/hooks/)** - Hooks para API e WebSocket

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

Para problemas relacionados ao deploy no Kubernetes:

1. Consulte o [Guia de Deploy](KUBERNETES_DEPLOY_GUIDE.md)
2. Verifique os logs: `make k8s-logs`
3. Verifique o status: `make k8s-status`
4. Consulte a seção de troubleshooting no guia

---

**🧭 DataCompass - Navegando pelos seus dados do WhatsApp no Kubernetes** 📱✨🚀

