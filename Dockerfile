# Multi-stage build para otimizar o tamanho da imagem
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
# Copiar pnpm-lock.yaml se existir
COPY pnpm-lock.yaml* ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências
RUN pnpm install

# Copiar código fonte e configurações
COPY . .

# Copiar configurações de produção
COPY .env.production .env

# Build da aplicação
RUN pnpm run build

# Estágio de produção com Nginx
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Criar usuário app com UID 1001 (evitando conflito com nginx existente)
RUN addgroup -g 1001 -S app && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G app -g app app

# Copiar configurações do nginx
COPY nginx-main.conf /etc/nginx/nginx.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remover configuração padrão do nginx
RUN rm -f /etc/nginx/conf.d/default.conf.default

# Copiar arquivos buildados do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Criar diretórios necessários e ajustar permissões para UID 1001
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /var/log/nginx && \
    mkdir -p /var/run && \
    mkdir -p /tmp && \
    chown -R 1001:1001 /var/cache/nginx && \
    chown -R 1001:1001 /var/log/nginx && \
    chown -R 1001:1001 /var/run && \
    chown -R 1001:1001 /usr/share/nginx/html && \
    chown -R 1001:1001 /tmp && \
    chown -R 1001:1001 /etc/nginx && \
    chmod -R 755 /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx && \
    chmod -R 755 /var/log/nginx && \
    chmod -R 755 /var/run && \
    chmod -R 755 /tmp && \
    chmod -R 644 /etc/nginx/nginx.conf && \
    chmod -R 644 /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 8080

# Health check simples
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Mudar para usuário não-root
USER 1001

# Comando para iniciar nginx em foreground
CMD ["nginx", "-g", "daemon off;"]

