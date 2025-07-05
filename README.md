# 🧭 DataCompass Frontend

Interface web moderna para a plataforma DataCompass - Sistema de análise e gerenciamento de dados do WhatsApp Business.

## 🚀 Funcionalidades

### 📊 Dashboard Principal
- Estatísticas em tempo real de usuários e mensagens
- Gráficos interativos de atividade
- Indicadores de performance do sistema
- Visão geral dos registros e conversões

### 👥 Gerenciamento de Usuários
- Lista completa de usuários registrados via WhatsApp
- Filtros avançados por status, empresa e data
- Busca em tempo real por nome, email ou empresa
- Detalhes completos de cada usuário
- Histórico de atividades e mensagens

### 💬 Mensagens WhatsApp
- Histórico completo de conversas
- Filtros por tipo de mensagem e período
- Visualização de comandos processados
- Status de entrega e resposta
- Busca por conteúdo e remetente

### 📈 Analytics & Relatórios
- Gráficos de registros e conversões
- Análise de tipos de mensagem
- Atividade por horário do dia
- Crescimento de usuários ao longo do tempo
- Insights automáticos e recomendações
- Exportação de dados

### ⚙️ Configurações
- Configuração da API WhatsApp Business
- Configurações do banco de dados MongoDB
- Respostas automáticas personalizáveis
- Configurações de notificações
- Limites e políticas de segurança
- Status do sistema em tempo real

## 🛠️ Tecnologias

- **React 19** - Framework frontend moderno
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Ícones modernos
- **Recharts** - Gráficos e visualizações
- **Radix UI** - Componentes acessíveis
- **shadcn/ui** - Sistema de design

## 🎨 Design

- **Responsivo** - Funciona perfeitamente em desktop e mobile
- **Moderno** - Interface limpa e intuitiva
- **Acessível** - Componentes seguem padrões de acessibilidade
- **Performático** - Carregamento rápido e otimizado
- **Tema Adaptável** - Suporte a modo claro/escuro

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- pnpm (recomendado) ou npm

### Instalação
```bash
# Clonar o repositório
git clone https://github.com/amarorn/dataCompass-frontend.git
cd dataCompass-frontend

# Instalar dependências
pnpm install

# Executar em modo desenvolvimento
pnpm run dev

# Build para produção
pnpm run build

# Preview da build de produção
pnpm run preview
```

### Variáveis de Ambiente
```bash
# .env.local
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=DataCompass
VITE_APP_VERSION=1.0.0
```

## 📁 Estrutura do Projeto

```
src/
├── components/           # Componentes React
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── Dashboard.jsx    # Página principal
│   ├── Users.jsx        # Gerenciamento de usuários
│   ├── Messages.jsx     # Histórico de mensagens
│   ├── Analytics.jsx    # Relatórios e gráficos
│   └── Settings.jsx     # Configurações do sistema
├── App.jsx              # Componente principal
├── App.css              # Estilos globais
└── main.jsx             # Ponto de entrada
```

## 🔗 Integração com Backend

Este frontend foi projetado para integrar com a API DataCompass:
- **Repositório Backend**: [dataCompass1.0](https://github.com/amarorn/dataCompass1.0.git)
- **API Base URL**: Configurável via variáveis de ambiente
- **Autenticação**: JWT tokens
- **WebSocket**: Para atualizações em tempo real

## 📱 Funcionalidades Mobile

- **Sidebar Responsiva** - Menu hambúrguer em telas pequenas
- **Touch Friendly** - Botões e elementos otimizados para toque
- **Swipe Gestures** - Navegação por gestos
- **Viewport Adaptável** - Layout se adapta a diferentes tamanhos

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run dev          # Servidor de desenvolvimento
pnpm run build        # Build para produção
pnpm run preview      # Preview da build
pnpm run lint         # Verificar código
pnpm run lint:fix     # Corrigir problemas automaticamente
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
pnpm run build

# Deploy pasta dist/
```

### Docker
```bash
# Build da imagem
docker build -t datacompass-frontend .

# Executar container
docker run -p 3000:3000 datacompass-frontend
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

**DataCompass Team**
- Email: admin@datacompass.com
- GitHub: [@amarorn](https://github.com/amarorn)

## 🙏 Agradecimentos

- [React](https://reactjs.org/) - Framework frontend
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Radix UI](https://www.radix-ui.com/) - Componentes primitivos
- [Lucide](https://lucide.dev/) - Ícones
- [Recharts](https://recharts.org/) - Gráficos

---

**🧭 DataCompass - Navegando pelos seus dados do WhatsApp** 📱✨

