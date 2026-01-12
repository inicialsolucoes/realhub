# RealHub - Sistema de Gestão de Condomínios (SaaS)

Um sistema completo para gestão de condomínios com Backend em Node.js/Express e Frontend em React.js/Tailwind CSS.

## 🚀 Tecnologias

- **Backend**: Node.js, Express.js, MySQL, JWT, Bcrypt
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React Router
- **Arquitetura**: Monorepo pronto para Vercel
- **Design**: Premium, Mobile-First, Tons de Azul (#0ea5e9, #1e3a8a)

## 📁 Estrutura de Pastas

```
/
├── api/                 # Backend (Express API)
│   ├── controllers/     # Lógica de controle
│   ├── routes/          # Definição de rotas
│   ├── middleware/      # Auth & Permissões
│   └── migrations/      # Scripts SQL
├── client/              # Frontend (React App)
│   ├── src/
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── context/     # Gerenciamento de estado (Auth)
│   │   └── layouts/     # Layouts (Dashboard, etc)
└── vercel.json          # Configuração de Deploy
```

## 🛠️ Instalação e execução local

### Pré-requisitos
- Node.js v18+
- MySQL Database

### 1. Configuração do Banco de Dados
Crie um banco de dados MySQL e execute os scripts da pasta `api/migrations/` na ordem:
1. `001_create_units.sql`
2. `002_create_users.sql`
3. `003_create_payments.sql`

Alternativamente, use um cliente SQL para rodar os comandos.

### 2. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL=mysql://usuario:senha@host:3306/nome_do_banco
JWT_SECRET=sua_chave_secreta_super_segura
PORT=3001
```

### 3. Instalação de Dependências

```bash
# Instalar dependências da raiz (Backend)
npm install

# Instalar dependências do Frontend
cd client
npm install
```

### 4. Execução

Para rodar o projeto localmente, você precisará de dois terminais:

**Terminal 1 (Backend):**
```bash
npm start
# Ou: node api/index.js
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
```

Acesse o frontend em `http://localhost:5173`.

## 📦 Deploy na Vercel

O projeto já está configurado com `vercel.json` para deploy simples.

1. Instale a Vercel CLI: `npm i -g vercel`
2. Rode `vercel` na raiz do projeto.
3. Configure as variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`) no painel da Vercel.

## 🔐 Níveis de Acesso

- **Admin**: Acesso total (CRUD de Unidades, Usuários, Pagamentos).
- **Morador**: 
  - Visualiza sua unidade e moradores vinculados.
  - Registra pagamentos (Entrada).
  - Visualiza seus pagamentos.
  - Não pode excluir registros.

## 🎨 Design System

O projeto utiliza Tailwind CSS com uma paleta de cores personalizada "Premium Blue":
- Primary: `#1d4ed8`
- Dark: `#1e3a8a`
- Light: `#0ea5e9`
