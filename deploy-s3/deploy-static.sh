#!/bin/bash
echo "🚀 Deploy Frontend Estático DataCompass"
echo "======================================="

# 1. Extrair frontend do ECR
echo "1. Fazendo pull da imagem frontend do ECR..."
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 028425947301.dkr.ecr.us-east-1.amazonaws.com
docker pull 028425947301.dkr.ecr.us-east-1.amazonaws.com/datacompass-frontend:latest

# 2. Extrair arquivos estáticos
echo "2. Extraindo arquivos estáticos..."
docker create --name temp-frontend 028425947301.dkr.ecr.us-east-1.amazonaws.com/datacompass-frontend:latest
docker cp temp-frontend:/usr/share/nginx/html ./frontend-build
docker rm temp-frontend

# 3. Criar bucket S3 para hosting
echo "3. Criando bucket S3..."
aws s3 mb s3://datacompass-frontend-ultimatesystems --region us-east-1

# 4. Configurar bucket para website
echo "4. Configurando bucket para website..."
aws s3 website s3://datacompass-frontend-ultimatesystems --index-document index.html --error-document error.html

# 5. Upload dos arquivos
echo "5. Fazendo upload dos arquivos..."
aws s3 sync ./frontend-build s3://datacompass-frontend-ultimatesystems --delete

# 6. Configurar política pública
echo "6. Configurando política pública..."
cat > bucket-policy.json << 'POLICY'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::datacompass-frontend-ultimatesystems/*"
        }
    ]
}
POLICY

aws s3api put-bucket-policy --bucket datacompass-frontend-ultimatesystems --policy file://bucket-policy.json

echo "✅ Deploy concluído!"
echo "URL: http://datacompass-frontend-ultimatesystems.s3-website-us-east-1.amazonaws.com"
