# 🔐 GitHub Secrets Configuration Guide

Este guia explica como configurar os secrets necessários no GitHub para que os workflows de CI/CD funcionem corretamente.

## 📋 Secrets Necessários

### 1. AWS Credentials

#### `AWS_ACCESS_KEY_ID`
- **Descrição**: Access Key ID da conta AWS
- **Como obter**: 
  1. Acesse AWS IAM Console
  2. Crie um usuário para CI/CD com as permissões necessárias
  3. Gere Access Keys para o usuário
- **Permissões necessárias**:
  - `AmazonEKSClusterPolicy`
  - `AmazonEKSWorkerNodePolicy`
  - `AmazonEKS_CNI_Policy`
  - `AmazonEC2ContainerRegistryFullAccess`
  - `AmazonEKSServicePolicy`

#### `AWS_SECRET_ACCESS_KEY`
- **Descrição**: Secret Access Key da conta AWS
- **Como obter**: Gerado junto com o Access Key ID

#### `AWS_ACCOUNT_ID`
- **Descrição**: ID da conta AWS (12 dígitos)
- **Como obter**: 
  ```bash
  aws sts get-caller-identity --query Account --output text
  ```

### 2. Slack Notifications (Opcional)

#### `SLACK_WEBHOOK_URL`
- **Descrição**: URL do webhook do Slack para notificações
- **Como obter**:
  1. Acesse https://api.slack.com/apps
  2. Crie uma nova app ou use uma existente
  3. Configure Incoming Webhooks
  4. Copie a URL do webhook

### 3. Outros Secrets (Se necessário)

#### `GITHUB_TOKEN`
- **Descrição**: Token para operações no GitHub (geralmente automático)
- **Nota**: O GitHub fornece automaticamente via `secrets.GITHUB_TOKEN`

## 🛠️ Como Configurar no GitHub

### Via Interface Web

1. **Acesse o repositório** no GitHub
2. **Vá para Settings** → **Secrets and variables** → **Actions**
3. **Clique em "New repository secret"**
4. **Adicione cada secret** com o nome exato e valor correspondente

### Via GitHub CLI

```bash
# Instalar GitHub CLI se necessário
# https://cli.github.com/

# Configurar secrets
gh secret set AWS_ACCESS_KEY_ID --body "AKIA..."
gh secret set AWS_SECRET_ACCESS_KEY --body "..."
gh secret set AWS_ACCOUNT_ID --body "123456789012"
gh secret set SLACK_WEBHOOK_URL --body "https://hooks.slack.com/..."
```

## 🔧 Configuração de Environments

### Staging Environment

1. **Acesse Settings** → **Environments**
2. **Crie environment "staging"**
3. **Configure proteções** (opcional):
   - Required reviewers
   - Wait timer
   - Deployment branches

### Production Environment

1. **Crie environment "production"**
2. **Configure proteções** (recomendado):
   - Required reviewers: 1-2 pessoas
   - Deployment branches: `main` only
3. **Configure environment secrets** se diferentes dos repository secrets

### Production Release Environment

1. **Crie environment "production-release"**
2. **Configure proteções** (obrigatório):
   - Required reviewers: 2+ pessoas
   - Wait timer: 5 minutos
   - Deployment branches: `main` only

## 🔍 Verificação da Configuração

### Script de Teste

Crie um arquivo `scripts/test-secrets.sh`:

```bash
#!/bin/bash

echo "🔍 Testing GitHub Secrets Configuration"
echo "======================================"

# Test AWS credentials
echo "Testing AWS credentials..."
aws sts get-caller-identity || echo "❌ AWS credentials failed"

# Test ECR access
echo "Testing ECR access..."
aws ecr describe-repositories --region us-east-1 || echo "❌ ECR access failed"

# Test EKS access
echo "Testing EKS access..."
aws eks describe-cluster --name whatsapp-analytics-production --region us-east-1 || echo "❌ EKS access failed"

echo "✅ Configuration test completed"
```

### Workflow de Teste

Crie `.github/workflows/test-config.yml`:

```yaml
name: Test Configuration

on:
  workflow_dispatch:

jobs:
  test-secrets:
    runs-on: ubuntu-latest
    steps:
    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
        
    - name: Test AWS access
      run: |
        aws sts get-caller-identity
        echo "Account ID: ${{ secrets.AWS_ACCOUNT_ID }}"
```

## 🚨 Segurança e Melhores Práticas

### 1. Princípio do Menor Privilégio
- Crie usuários IAM específicos para CI/CD
- Conceda apenas as permissões mínimas necessárias
- Use roles IAM quando possível

### 2. Rotação de Secrets
- Rotacione Access Keys regularmente (a cada 90 dias)
- Use AWS IAM Access Analyzer para revisar permissões
- Monitore uso de credenciais no CloudTrail

### 3. Ambientes Separados
- Use contas AWS separadas para staging e production
- Configure secrets específicos por environment
- Implemente aprovações obrigatórias para production

### 4. Monitoramento
- Configure alertas para falhas de deployment
- Monitore logs de acesso às credenciais
- Use AWS Config para compliance

## 📝 Checklist de Configuração

- [ ] AWS_ACCESS_KEY_ID configurado
- [ ] AWS_SECRET_ACCESS_KEY configurado  
- [ ] AWS_ACCOUNT_ID configurado
- [ ] SLACK_WEBHOOK_URL configurado (opcional)
- [ ] Environment "staging" criado
- [ ] Environment "production" criado com proteções
- [ ] Environment "production-release" criado com proteções
- [ ] Permissões IAM verificadas
- [ ] Teste de configuração executado
- [ ] Documentação atualizada

## 🆘 Troubleshooting

### Erro: "AWS credentials not configured"
- Verifique se os secrets estão configurados corretamente
- Confirme que os nomes dos secrets estão exatos
- Teste as credenciais localmente

### Erro: "Access denied to ECR"
- Verifique permissões do usuário IAM
- Confirme que a região está correta
- Teste acesso ao ECR manualmente

### Erro: "EKS cluster not found"
- Verifique se o cluster existe na região especificada
- Confirme o nome do cluster no workflow
- Teste acesso ao EKS manualmente

### Workflow não executa
- Verifique se os environments estão configurados
- Confirme que as proteções não estão bloqueando
- Verifique logs do workflow para erros específicos

---

**⚠️ Importante**: Nunca commite secrets no código! Use sempre o sistema de secrets do GitHub.

