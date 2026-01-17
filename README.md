# RealHub - Condominium Management System (SaaS)

A complete condominium management system with a Node.js/Express Backend and a React.js/Tailwind CSS Frontend.

## 🚀 Technologies

- **Backend**: Node.js, Express.js, MySQL, JWT, Bcrypt
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React Router, Framer Motion
- **Architecture**: Monorepo ready for Vercel deployment
- **Design**: Premium, Mobile-First, Professional Blue Palette (#0ea5e9, #1e3a8a)

## ✨ Key Features

- **Resident Management**: Complete CRUD with unit linkage and cost center associations.
- **Unit Management**: Support for alphanumeric Quadra/Lote/Casa (e.g., Block A, Lot 10B).
- **Financial Control**: Payment registration (Inflow/Outflow) with support for proof of payment.
- **Cost Centers**: Group payments and residents by specific departments or categories.
- **Activity Logs**: Advanced auditing system for Admins.
  - Track all Creations, Updates, and Deletions.
  - **Side-by-side data comparison** for updates (Old vs. New values).
  - IP Address and Timestamp tracking.
- **Dashboard**: Real-time stats and a live Activity Feed.
- **Internationalization**: Fully localized UI (Portuguese/English support).

## 📁 Project Structure

```
/
├── api/                 # Backend (Express API)
│   ├── controllers/     # Business logic
│   ├── routes/          # API Route definitions
│   ├── middleware/      # Auth & Permissions
│   └── migrations/      # SQL Schema scripts
├── client/              # Frontend (React App)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application views
│   │   ├── context/     # State management (Auth, Translation)
│   │   └── layouts/     # Page layouts (Dashboard, etc.)
└── vercel.json          # Deployment configuration
```

## 🛠️ Local Setup & Execution

### Prerequisites

- Node.js v18+
- MySQL Database

### 1. Database Configuration

You must execute the SQL scripts located in `api/migrations/` in sequential order.

**Manual Execution:**
Run the scripts in this specific order:

1. `001_create_units.sql`
2. `002_create_users.sql`
3. `003_create_payments.sql`
   ... and so on for all files up to `011_alter_units_lote_casa.sql`.

**Automated Execution (Linux/macOS):**
If you have the `mysql` client installed, you can run all migrations at once from the root folder:

```bash
for f in api/migrations/*.sql; do
  mysql -u YOUR_USER -pYOUR_PASS YOUR_DB_NAME < $f;
done
```

### 2. Environment Variables

Create a `.env` file in the `api/` directory:

```env
# CORE SETTINGS
PORT=3001
TIMEZONE=America/Sao_Paulo
JWT_SECRET=your_super_secure_secret_key
# FRONTEND_URL=http://localhost:5173

# DATABASE SETTINGS
DATABASE_URL=mysql://user:password@host:3306/database_name

# MAIL SETTINGS
SMTP_HOST=smtp.host.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
SMTP_FROM=your_email@example.com
SMTP_SECURE=false
```

### 3. Install Dependencies

```bash
# Install root dependencies (Backend)
cd api
npm install

# Install Frontend dependencies
cd client
npm install
```

### 4. Running the Application

You will need two separate terminal windows:

**Terminal 1 (Backend):**

```bash
# From the /api directory
npm start
```

**Terminal 2 (Frontend):**

```bash
# From the /client directory
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📦 Vercel Deployment

The project is pre-configured with `vercel.json` for seamless deployment.

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root.
3. Configure Environment Variables (`DATABASE_URL`, `JWT_SECRET`) in the Vercel Dashboard.

## 🔐 Access Levels

- **Admin**: Full access to all modules (Units, Users, Payments, Cost Centers, and Activity Logs).
- **Resident (User)**:
  - View their own household details.
  - Register payments (Inflow).
  - View payment history.
  - Restricted from deleting any records.

## 🎨 Design System

The project uses Tailwind CSS with a "Premium Blue" palette:

- **Primary**: `#1d4ed8` (Deep Blue)
- **Dark**: `#1e3a8a` (Professional Navy)
- **Light**: `#0ea5e9` (Sky Blue)
- **Background**: Subtle Slate gradients for a modern SaaS look.
