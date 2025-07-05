# 🚀 Guia de Deploy do DataCompass Frontend no Kubernetes

Este guia fornece instruções completas para fazer o deploy do frontend DataCompass no Kubernetes e configurar a comunicação com o backend existente.

## 📋 Pré-requisitos

### Ferramentas Necessárias
- **Docker** (versão 20.10+)
- **kubectl** (versão 1.20+)
- **kustomize** (incluído no kubectl 1.14+)
- **pnpm** (versão 8.0+)
- **Make** (opcional, para automação)

### Acesso ao Cluster
- Acesso ao cluster Kubernetes onde o backend já está rodando
- Permissões para criar recursos nos namespaces necessários
- Registry Docker configurado (AWS ECR, Docker Hub, etc.)

---

## 🏗️ Arquitetura da Solução

### Componentes do Frontend
```
┌─────────────────────────────────────────────────────────────┐
│                    Internet/Load Balancer                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Ingress Controller                        │
│              (AWS ALB / Nginx Ingress)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                Frontend Service (ClusterIP)                │
│                    Port 80 → 8080                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Frontend Pods (2-10 replicas)                 │
│                React App + Nginx                           │
│                   Port 8080                                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ API Calls
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend Service                              │
│          whatsapp-analytics-api-service                     │
│                   Port 80                                   │
└─────────────────────────────────────────────────────────────┘
```

### Comunicação Frontend ↔ Backend
- **Interna (Cluster):** `http://whatsapp-analytics-api-service.default.svc.cluster.local`
- **Externa (Desenvolvimento):** Configurável via variáveis de ambiente
- **WebSocket:** Para atualizações em tempo real
- **Proxy Nginx:** Para roteamento de API calls

---


## ⚙️ Configuração Inicial

### 1. Preparar Variáveis de Ambiente

Copie o arquivo de exemplo e configure as variáveis:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas configurações:

```bash
# Configurações da API (ajustar conforme ambiente)
VITE_API_URL=https://api.datacompass.yourdomain.com/api
VITE_WS_URL=wss://api.datacompass.yourdomain.com

# Configurações da aplicação
VITE_APP_NAME=DataCompass
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production

# Configurações de autenticação
VITE_JWT_STORAGE_KEY=datacompass_token

# Configurações de debug (desabilitar em produção)
VITE_DEBUG=false
VITE_LOG_LEVEL=error
```

### 2. Configurar Registry Docker

Configure o acesso ao seu registry Docker:

```bash
# Para AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Para Docker Hub
docker login -u your-username

# Para registry privado
docker login your-registry.com -u your-username
```

### 3. Verificar Conectividade com Backend

Verifique se o backend está rodando no cluster:

```bash
# Verificar pods do backend
kubectl get pods -l app=whatsapp-analytics-api

# Verificar service do backend
kubectl get svc whatsapp-analytics-api-service

# Testar conectividade
kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never -- curl -f http://whatsapp-analytics-api-service.default.svc.cluster.local/health
```

---

## 🔧 Build e Deploy

### Método 1: Deploy Automático com Makefile

O método mais simples usando o Makefile fornecido:

```bash
# 1. Configurar variáveis (editar Makefile se necessário)
export DOCKER_REGISTRY=your-registry.com
export VERSION=v1.0.0
export ENVIRONMENT=staging

# 2. Deploy completo (build + push + deploy)
make full-deploy

# 3. Verificar status
make k8s-status
```

### Método 2: Deploy Manual Passo a Passo

#### Passo 1: Build da Aplicação

```bash
# Instalar dependências
pnpm install

# Build da aplicação
pnpm run build

# Verificar se o build foi criado
ls -la dist/
```

#### Passo 2: Build da Imagem Docker

```bash
# Build da imagem
docker build -t datacompass-frontend:v1.0.0 .

# Tag para registry
docker tag datacompass-frontend:v1.0.0 your-registry.com/datacompass-frontend:v1.0.0

# Push para registry
docker push your-registry.com/datacompass-frontend:v1.0.0
```

#### Passo 3: Configurar Manifestos Kubernetes

Edite os arquivos de configuração conforme seu ambiente:

**Para Staging:**
```bash
# Editar k8s/overlays/staging/kustomization.yaml
# Ajustar a URL da imagem e configurações específicas

# Editar k8s/overlays/staging/ingress-patch.yaml
# Configurar o domínio correto
```

**Para Production:**
```bash
# Editar k8s/overlays/production/kustomization.yaml
# Ajustar a URL da imagem e configurações específicas

# Editar k8s/overlays/production/ingress-patch.yaml
# Configurar o domínio correto
```

#### Passo 4: Deploy no Kubernetes

```bash
# Para staging
kubectl apply -k k8s/overlays/staging

# Para production
kubectl apply -k k8s/overlays/production

# Verificar rollout
kubectl rollout status deployment/datacompass-frontend -n staging
```

---


## 🔗 Configuração da Comunicação Frontend ↔ Backend

### 1. Configuração de DNS Interno

O frontend se comunica com o backend através do DNS interno do Kubernetes:

```yaml
# URL interna do backend
http://whatsapp-analytics-api-service.default.svc.cluster.local

# Se o backend estiver em namespace diferente:
http://whatsapp-analytics-api-service.production.svc.cluster.local
```

### 2. Configuração do Nginx Proxy

O arquivo `nginx.conf` já está configurado para fazer proxy das chamadas de API:

```nginx
# Proxy para API
location /api/ {
    proxy_pass http://whatsapp-analytics-api-service.default.svc.cluster.local/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    proxy_read_timeout 86400;
}
```

### 3. Configuração de CORS no Backend

Certifique-se de que o backend está configurado para aceitar requisições do frontend:

```javascript
// No backend, configurar CORS para aceitar o domínio do frontend
const corsOptions = {
  origin: [
    'https://datacompass.yourdomain.com',
    'https://staging-datacompass.yourdomain.com',
    'http://localhost:3000' // Para desenvolvimento
  ],
  credentials: true,
  optionsSuccessStatus: 200
}
```

### 4. Configuração de WebSocket

Para comunicação em tempo real, configure o WebSocket:

```yaml
# No ConfigMap do frontend
apiVersion: v1
kind: ConfigMap
metadata:
  name: datacompass-frontend-config
data:
  api-url: "http://whatsapp-analytics-api-service.default.svc.cluster.local"
  ws-url: "ws://whatsapp-analytics-api-service.default.svc.cluster.local"
```

### 5. Teste de Conectividade

Após o deploy, teste a comunicação:

```bash
# 1. Verificar se o frontend está rodando
kubectl get pods -l app=datacompass-frontend

# 2. Verificar logs do frontend
kubectl logs -l app=datacompass-frontend --tail=50

# 3. Testar conectividade interna
kubectl exec -it deployment/datacompass-frontend -- curl -f http://whatsapp-analytics-api-service.default.svc.cluster.local/health

# 4. Testar através do ingress
curl -f https://datacompass.yourdomain.com/health
```

---

## 📊 Monitoramento e Logs

### 1. Verificar Status dos Recursos

```bash
# Status geral
kubectl get all -l app=datacompass-frontend

# Detalhes do deployment
kubectl describe deployment datacompass-frontend

# Status do ingress
kubectl get ingress datacompass-frontend-ingress

# Verificar HPA
kubectl get hpa datacompass-frontend-hpa
```

### 2. Visualizar Logs

```bash
# Logs em tempo real
kubectl logs -l app=datacompass-frontend -f

# Logs de um pod específico
kubectl logs datacompass-frontend-xxxxx-xxxxx

# Logs do nginx (dentro do container)
kubectl exec -it datacompass-frontend-xxxxx-xxxxx -- tail -f /var/log/nginx/access.log
```

### 3. Debug de Problemas

```bash
# Entrar no container para debug
kubectl exec -it deployment/datacompass-frontend -- /bin/sh

# Verificar configuração do nginx
kubectl exec -it deployment/datacompass-frontend -- cat /etc/nginx/conf.d/default.conf

# Testar conectividade interna
kubectl exec -it deployment/datacompass-frontend -- curl -v http://whatsapp-analytics-api-service.default.svc.cluster.local/health

# Verificar variáveis de ambiente
kubectl exec -it deployment/datacompass-frontend -- env | grep VITE
```

### 4. Health Checks

O frontend possui health checks configurados:

```bash
# Verificar health check local
kubectl exec -it deployment/datacompass-frontend -- curl -f http://localhost:8080/health

# Verificar através do service
kubectl run test-pod --image=curlimages/curl --rm -it --restart=Never -- curl -f http://datacompass-frontend-service.default.svc.cluster.local/health
```

---


## 🔄 Atualizações e Rollbacks

### 1. Atualizar Versão

```bash
# Método 1: Usando Makefile
make update-image VERSION=v1.1.0

# Método 2: Manual
kubectl set image deployment/datacompass-frontend datacompass-frontend=your-registry.com/datacompass-frontend:v1.1.0

# Verificar rollout
kubectl rollout status deployment/datacompass-frontend
```

### 2. Rollback

```bash
# Ver histórico de rollouts
kubectl rollout history deployment/datacompass-frontend

# Rollback para versão anterior
kubectl rollout undo deployment/datacompass-frontend

# Rollback para versão específica
kubectl rollout undo deployment/datacompass-frontend --to-revision=2
```

### 3. Rolling Update

```bash
# Configurar estratégia de rolling update
kubectl patch deployment datacompass-frontend -p '{"spec":{"strategy":{"rollingUpdate":{"maxSurge":1,"maxUnavailable":0}}}}'

# Pausar rollout
kubectl rollout pause deployment/datacompass-frontend

# Retomar rollout
kubectl rollout resume deployment/datacompass-frontend
```

---

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Pod não inicia (ImagePullBackOff)

```bash
# Verificar eventos
kubectl describe pod datacompass-frontend-xxxxx-xxxxx

# Soluções:
# - Verificar se a imagem existe no registry
# - Verificar credenciais do registry
# - Verificar se o nome da imagem está correto
```

#### 2. Erro 502/503 no Ingress

```bash
# Verificar se o service está funcionando
kubectl get endpoints datacompass-frontend-service

# Testar conectividade direta ao pod
kubectl port-forward pod/datacompass-frontend-xxxxx-xxxxx 8080:8080

# Verificar configuração do ingress
kubectl describe ingress datacompass-frontend-ingress
```

#### 3. Frontend não consegue conectar com Backend

```bash
# 1. Verificar se o backend está rodando
kubectl get pods -l app=whatsapp-analytics-api

# 2. Testar conectividade do frontend para backend
kubectl exec -it deployment/datacompass-frontend -- curl -v http://whatsapp-analytics-api-service.default.svc.cluster.local/health

# 3. Verificar configuração do nginx
kubectl exec -it deployment/datacompass-frontend -- cat /etc/nginx/conf.d/default.conf

# 4. Verificar logs do nginx
kubectl exec -it deployment/datacompass-frontend -- tail -f /var/log/nginx/error.log
```

#### 4. Problemas de CORS

```bash
# Verificar headers nas requisições
kubectl exec -it deployment/datacompass-frontend -- curl -v -H "Origin: https://datacompass.yourdomain.com" http://whatsapp-analytics-api-service.default.svc.cluster.local/api/health

# Verificar configuração do backend
# O backend deve aceitar o domínio do frontend nas configurações de CORS
```

#### 5. Problemas de Performance

```bash
# Verificar uso de recursos
kubectl top pods -l app=datacompass-frontend

# Verificar HPA
kubectl describe hpa datacompass-frontend-hpa

# Ajustar recursos se necessário
kubectl patch deployment datacompass-frontend -p '{"spec":{"template":{"spec":{"containers":[{"name":"datacompass-frontend","resources":{"requests":{"memory":"256Mi","cpu":"200m"},"limits":{"memory":"512Mi","cpu":"400m"}}}]}}}}'
```

### Comandos de Debug Úteis

```bash
# Verificar todos os recursos relacionados
kubectl get all,configmap,secret,ingress -l app=datacompass-frontend

# Verificar eventos do namespace
kubectl get events --sort-by=.metadata.creationTimestamp

# Verificar configuração final do kustomize
kubectl kustomize k8s/overlays/production

# Verificar diferenças entre ambientes
diff <(kubectl kustomize k8s/overlays/staging) <(kubectl kustomize k8s/overlays/production)

# Backup da configuração atual
kubectl get deployment datacompass-frontend -o yaml > backup-deployment.yaml
```

---

## 🔒 Segurança e Melhores Práticas

### 1. Configurações de Segurança

```yaml
# Security Context já configurado no deployment
securityContext:
  allowPrivilegeEscalation: false
  runAsNonRoot: true
  runAsUser: 1001
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL
```

### 2. Network Policies (Opcional)

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: datacompass-frontend-netpol
spec:
  podSelector:
    matchLabels:
      app: datacompass-frontend
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: whatsapp-analytics-api
    ports:
    - protocol: TCP
      port: 3000
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
```

### 3. Resource Limits

```yaml
# Já configurado no deployment
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"
```

### 4. Backup e Disaster Recovery

```bash
# Backup das configurações
kubectl get configmap,secret,deployment,service,ingress,hpa -l app=datacompass-frontend -o yaml > backup-frontend-$(date +%Y%m%d).yaml

# Backup do namespace completo
kubectl get all,configmap,secret,ingress,hpa -n production -o yaml > backup-namespace-$(date +%Y%m%d).yaml
```

---

## 📚 Referências e Próximos Passos

### Documentação Relacionada
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Kustomize Documentation](https://kustomize.io/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [React Deployment Guide](https://create-react-app.dev/docs/deployment/)

### Melhorias Futuras
1. **Implementar CI/CD Pipeline** com GitHub Actions ou GitLab CI
2. **Configurar Monitoring** com Prometheus e Grafana
3. **Implementar Logging Centralizado** com ELK Stack
4. **Configurar SSL/TLS** com cert-manager
5. **Implementar Cache** com Redis para melhor performance
6. **Configurar CDN** para assets estáticos

### Comandos de Referência Rápida

```bash
# Deploy rápido
make full-deploy ENVIRONMENT=staging

# Verificar status
make k8s-status

# Ver logs
make k8s-logs

# Port forward para desenvolvimento
make k8s-port-forward

# Atualizar imagem
make update-image VERSION=v1.1.0

# Rollback
kubectl rollout undo deployment/datacompass-frontend
```

---

## 🆘 Suporte

Para problemas ou dúvidas:

1. **Verificar logs** primeiro usando os comandos acima
2. **Consultar documentação** do Kubernetes e componentes
3. **Verificar issues** no repositório do projeto
4. **Contatar equipe** de DevOps/SRE

---

**✅ Parabéns!** Seu frontend DataCompass agora está rodando no Kubernetes e se comunicando com o backend. 

Lembre-se de monitorar regularmente a aplicação e manter as configurações atualizadas conforme necessário.

