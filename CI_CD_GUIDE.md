# 🚀 DataCompass Frontend - CI/CD Guide

Guia completo para Continuous Integration e Continuous Deployment do frontend DataCompass usando GitHub Actions e AWS.

## 📋 Visão Geral

Este projeto implementa um pipeline completo de CI/CD que automatiza:

- ✅ **Testes e qualidade de código**
- ✅ **Build e containerização**
- ✅ **Deploy automático para staging e production**
- ✅ **Releases versionadas**
- ✅ **Monitoramento e notificações**

### 🏗️ Arquitetura do Pipeline

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Developer     │    │   GitHub        │    │      AWS        │
│                 │    │                 │    │                 │
│ git push main   │───▶│ GitHub Actions  │───▶│ EKS + ECR       │
│                 │    │                 │    │                 │
│ create tag      │    │ Workflows:      │    │ Environments:   │
│                 │    │ • CI            │    │ • Staging       │
│ create PR       │    │ • Deploy        │    │ • Production    │
│                 │    │ • Release       │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---


## 🔄 Workflows Disponíveis

### 1. Continuous Integration (`.github/workflows/ci.yml`)

**Trigger**: Pull Requests e pushes para `develop`

**Funcionalidades**:
- 🔍 **Lint e Format Check**: ESLint e verificação de formatação
- 🧪 **Testes**: Unit tests, integration tests, coverage
- 📦 **Build**: Build da aplicação e verificação de tamanho
- 🔒 **Security Audit**: npm audit e verificação de vulnerabilidades
- 🐳 **Docker Build Test**: Build e teste da imagem Docker
- ♿ **Accessibility Test**: Testes de acessibilidade com axe-core
- ⚡ **Performance Test**: Lighthouse CI para métricas de performance
- 💬 **PR Comments**: Comentários automáticos com resultados

**Jobs**:
```yaml
lint-and-format → test → build → security-audit
                              ↓
                    docker-build-test → accessibility-test
                              ↓
                    performance-test → pr-comment
```

### 2. Deploy to AWS (`.github/workflows/deploy-aws.yml`)

**Trigger**: Push para `main` e workflow manual

**Funcionalidades**:
- 🧪 **Quality Checks**: Testes e linting
- 🔒 **Security Scan**: Trivy para vulnerabilidades
- 🐳 **Build & Push**: Build da imagem Docker e push para ECR
- 🚀 **Deploy Staging**: Deploy automático para ambiente de staging
- 🎯 **Deploy Production**: Deploy para produção com aprovação manual
- 📊 **Health Checks**: Verificações de saúde pós-deploy
- 📢 **Notifications**: Notificações Slack de sucesso/falha

**Environments**:
- **Staging**: Deploy automático, sem aprovação
- **Production**: Requer aprovação manual

### 3. Release and Tag (`.github/workflows/release.yml`)

**Trigger**: Tags `v*` e workflow manual

**Funcionalidades**:
- ✅ **Validate Release**: Validação do formato da versão
- 📦 **Build Release**: Build otimizado para produção
- 🐳 **Release Image**: Build e push da imagem com tag de versão
- 📝 **GitHub Release**: Criação automática de release no GitHub
- 🚀 **Production Deploy**: Deploy automático para produção (apenas releases estáveis)
- 📢 **Notifications**: Notificações de release

**Tipos de Release**:
- **Stable**: `v1.0.0` - Deploy automático para produção
- **Prerelease**: `v1.0.0-alpha` - Apenas build, sem deploy

---

## ⚙️ Configuração Inicial

### 1. Secrets do GitHub

Configure os seguintes secrets no repositório:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_ACCOUNT_ID=123456789012

# Notifications (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

📖 **Guia detalhado**: [scripts/setup-github-secrets.md](scripts/setup-github-secrets.md)

### 2. Environments do GitHub

Configure os environments com proteções:

#### Staging
- **Proteções**: Nenhuma (deploy automático)
- **Secrets**: Pode usar os mesmos do repositório

#### Production
- **Proteções**: 
  - Required reviewers: 1-2 pessoas
  - Deployment branches: `main` only
- **Secrets**: Específicos para produção se necessário

#### Production Release
- **Proteções**:
  - Required reviewers: 2+ pessoas
  - Wait timer: 5 minutos
  - Deployment branches: `main` only

### 3. AWS Infrastructure

Certifique-se de que a infraestrutura AWS está configurada:

- ✅ **EKS Cluster**: `whatsapp-analytics-production`
- ✅ **ECR Repository**: `datacompass-frontend`
- ✅ **IAM Permissions**: Acesso ao EKS e ECR
- ✅ **Load Balancer**: Para exposição externa

---

## 🚀 Fluxos de Trabalho

### Desenvolvimento Diário

```bash
# 1. Criar feature branch
git checkout -b feature/nova-funcionalidade

# 2. Desenvolver e commitar
git add .
git commit -m "feat: adicionar nova funcionalidade"

# 3. Push e criar PR
git push origin feature/nova-funcionalidade
# Criar PR no GitHub

# 4. CI automático executa
# - Testes, linting, build, security scan
# - Comentário automático no PR com resultados

# 5. Merge após aprovação
# - CI executa novamente
# - Deploy automático para staging se merge em main
```

### Deploy para Staging

**Automático** quando há push para `main`:

```bash
git checkout main
git pull origin main
git push origin main
# Deploy automático para staging
```

### Deploy para Production

**Opção 1: Via workflow manual**
```bash
# No GitHub: Actions → Deploy to AWS → Run workflow
# Selecionar branch main
# Aguardar aprovação manual
```

**Opção 2: Via release**
```bash
# Criar tag de versão
git tag v1.0.0
git push origin v1.0.0
# Release automático + deploy para produção
```

### Releases Versionadas

```bash
# Release estável (deploy automático)
git tag v1.0.0
git push origin v1.0.0

# Prerelease (apenas build)
git tag v1.1.0-alpha
git push origin v1.1.0-alpha

# Release candidate
git tag v1.1.0-rc1
git push origin v1.1.0-rc1
```

---


## 🛠️ Scripts de Automação

### Build e Push Manual

```bash
# Build e push para staging
./scripts/build-and-push.sh latest staging

# Build e push para production
./scripts/build-and-push.sh v1.0.0 production
```

### Deploy Manual

```bash
# Deploy para staging
./scripts/deploy.sh staging latest

# Deploy para production
./scripts/deploy.sh production v1.0.0
```

### Comandos Úteis

```bash
# Verificar status do deployment
kubectl get pods -l app=datacompass-frontend -n production

# Ver logs em tempo real
kubectl logs -l app=datacompass-frontend -n production -f

# Rollback se necessário
kubectl rollout undo deployment/datacompass-frontend -n production

# Verificar histórico de deployments
kubectl rollout history deployment/datacompass-frontend -n production
```

---

## 📊 Monitoramento e Observabilidade

### GitHub Actions

**Dashboards disponíveis**:
- **Actions**: Histórico de execuções e status
- **Environments**: Status dos ambientes e deployments
- **Releases**: Histórico de releases e artifacts

**Métricas importantes**:
- ⏱️ **Tempo de build**: ~5-10 minutos
- ⏱️ **Tempo de deploy**: ~3-5 minutos
- 📈 **Taxa de sucesso**: >95%
- 🔄 **Frequência de deploy**: Múltiplos por dia

### Kubernetes

**Comandos de monitoramento**:

```bash
# Status geral
kubectl get all -l app=datacompass-frontend -n production

# Métricas de recursos
kubectl top pods -l app=datacompass-frontend -n production

# Eventos recentes
kubectl get events -n production --sort-by=.metadata.creationTimestamp

# Health checks
kubectl describe deployment datacompass-frontend -n production
```

### Logs e Debugging

```bash
# Logs da aplicação
kubectl logs -l app=datacompass-frontend -n production --tail=100

# Logs do Nginx
kubectl exec -it deployment/datacompass-frontend -n production -- tail -f /var/log/nginx/access.log

# Debug de conectividade
kubectl exec -it deployment/datacompass-frontend -n production -- curl -v http://whatsapp-analytics-api-service.default.svc.cluster.local/health
```

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Build Falha

**Sintomas**: CI falha na etapa de build
**Soluções**:
```bash
# Verificar localmente
pnpm install
pnpm run build

# Verificar logs do GitHub Actions
# Verificar dependências e versões
```

#### 2. Deploy Falha

**Sintomas**: Deploy falha ou pods não iniciam
**Soluções**:
```bash
# Verificar status dos pods
kubectl describe pod <pod-name> -n production

# Verificar logs
kubectl logs <pod-name> -n production

# Verificar imagem
docker pull <image-uri>
docker run --rm -it <image-uri> /bin/sh
```

#### 3. Health Check Falha

**Sintomas**: Health checks falham após deploy
**Soluções**:
```bash
# Testar health endpoint diretamente
kubectl port-forward service/datacompass-frontend-service 8080:80 -n production
curl http://localhost:8080/health

# Verificar configuração do Nginx
kubectl exec -it deployment/datacompass-frontend -n production -- cat /etc/nginx/conf.d/default.conf
```

#### 4. Problemas de Conectividade com Backend

**Sintomas**: Frontend não consegue acessar API
**Soluções**:
```bash
# Testar conectividade interna
kubectl exec -it deployment/datacompass-frontend -n production -- curl -v http://whatsapp-analytics-api-service.default.svc.cluster.local/health

# Verificar DNS interno
kubectl exec -it deployment/datacompass-frontend -n production -- nslookup whatsapp-analytics-api-service.default.svc.cluster.local

# Verificar configuração do proxy
kubectl exec -it deployment/datacompass-frontend -n production -- nginx -t
```

### Rollback de Emergência

```bash
# Rollback automático
kubectl rollout undo deployment/datacompass-frontend -n production

# Rollback para versão específica
kubectl rollout undo deployment/datacompass-frontend -n production --to-revision=2

# Verificar status do rollback
kubectl rollout status deployment/datacompass-frontend -n production
```

---

## 🔒 Segurança e Compliance

### Scans de Segurança

**Automáticos em cada build**:
- 🔍 **npm audit**: Vulnerabilidades em dependências
- 🔍 **Trivy**: Vulnerabilidades em imagem Docker
- 🔍 **ESLint**: Problemas de código e segurança

**Configuração de segurança**:
```yaml
# Container security
securityContext:
  allowPrivilegeEscalation: false
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
```

### Melhores Práticas

1. **Secrets Management**:
   - Nunca commitar secrets no código
   - Usar GitHub Secrets para credenciais
   - Rotacionar credenciais regularmente

2. **Image Security**:
   - Usar imagens base mínimas (nginx:alpine)
   - Scan automático de vulnerabilidades
   - Executar como usuário não-root

3. **Network Security**:
   - Comunicação interna via DNS do cluster
   - HTTPS obrigatório via Ingress
   - Headers de segurança configurados

4. **Access Control**:
   - Environments com aprovação obrigatória
   - Princípio do menor privilégio
   - Auditoria de acessos

---

## 📈 Métricas e KPIs

### Deployment Metrics

- **Deployment Frequency**: Múltiplos deploys por dia
- **Lead Time**: < 30 minutos (commit → production)
- **MTTR** (Mean Time to Recovery): < 15 minutos
- **Change Failure Rate**: < 5%

### Quality Metrics

- **Test Coverage**: > 80%
- **Build Success Rate**: > 95%
- **Security Scan Pass Rate**: 100%
- **Performance Score**: > 90 (Lighthouse)

### Monitoring Dashboards

```bash
# GitHub Actions insights
https://github.com/amarorn/dataCompass-frontend/actions

# Kubernetes dashboard
kubectl proxy
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/

# AWS CloudWatch
https://console.aws.amazon.com/cloudwatch/
```

---

## 🔄 Processo de Melhoria Contínua

### Reviews Regulares

**Semanalmente**:
- Review de métricas de deployment
- Análise de falhas e melhorias
- Atualização de dependências

**Mensalmente**:
- Review de segurança e compliance
- Otimização de performance
- Atualização de documentação

**Trimestralmente**:
- Review da arquitetura de CI/CD
- Avaliação de novas ferramentas
- Training da equipe

### Roadmap de Melhorias

**Próximas implementações**:
- [ ] Testes E2E automatizados
- [ ] Deployment canário
- [ ] Monitoring com Prometheus/Grafana
- [ ] Backup automático de configurações
- [ ] Multi-region deployment

---

## 📚 Referências e Links Úteis

### Documentação
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

### Ferramentas
- [Trivy Security Scanner](https://trivy.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [axe-core Accessibility](https://github.com/dequelabs/axe-core)
- [Kustomize](https://kustomize.io/)

### Monitoramento
- [AWS CloudWatch](https://aws.amazon.com/cloudwatch/)
- [Kubernetes Dashboard](https://kubernetes.io/docs/tasks/access-application-cluster/web-ui-dashboard/)
- [GitHub Actions Insights](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows)

---

## 🆘 Suporte e Contato

Para problemas relacionados ao CI/CD:

1. **Verificar logs** dos workflows no GitHub Actions
2. **Consultar documentação** específica da ferramenta
3. **Verificar issues** conhecidos no repositório
4. **Contatar equipe** de DevOps/SRE

**Canais de comunicação**:
- 💬 Slack: `#deployments` e `#devops`
- 📧 Email: devops@datacompass.com
- 🎫 Issues: GitHub Issues do repositório

---

**🚀 Happy Deploying!** 

Este pipeline de CI/CD foi projetado para ser robusto, seguro e eficiente. Mantenha a documentação atualizada e continue melhorando o processo! 🎉

