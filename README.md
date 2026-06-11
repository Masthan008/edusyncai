# EduSync AI 🎓

EduSync AI is a premium, enterprise-grade School & College ERP (Enterprise Resource Planning) platform built for modern educational institutions. It provides a complete digital ecosystem connecting administrators, HODs, teachers, students, parents, and accountants through tailored role-based dashboards.

---

## 🚀 Key Features

*   **SaaS Dashboard & Portals**: 7 specialized dashboards (Admin, Principal, HOD, Teacher, Student, Parent, Accountant) styled with a sleek Linear/Stripe-like dark slate design system and glassmorphism.
*   **Normalized PostgreSQL Schema**: 20 core tables tracking enrollment histories, sections, subject catalogs, attendance logs, marks journals, assignment reviews, and payments audits.
*   **Conflict-Free Timetables**: Timetable scheduler checks room bookings and teacher schedules to prevent overlap conflicts.
*   **Smart Attendance Registers**: Log daily or subject-wise attendance check rosters in one-click.
*   **Automatic Grade sheets & GPAs**: Standardized letter grade conversions and dynamic GPA card transcript generators.
*   **Payments & Invoices Ledger**: Parents can view outstanding fees, pay online, and generate manual receipt logs.
*   **AI-Ready Core Integration**: 
    *   *AI Academic Assistant*: Context-aware student chatbot answers course questions, due assignments, or attendance rates.
    *   *AI Predictive Insights*: Recharts presence rates combined with grade metrics highlights student risk warnings.
    *   *Dual-Mode Fallback*: Uses the official Gemini API if key is provided; otherwise falls back to smart local context templates.

---

## 🛠️ Tech Stack

### Frontend
*   React.js (TypeScript) & Vite
*   Tailwind CSS (Deep Blue & Cyan design tokens)
*   Zustand (State Management)
*   Recharts (KPIs area & pie graphs)
*   Lucide React (Icon sets)
*   Framer Motion (Micro-animations)

### Backend
*   Node.js (TypeScript) & Express.js
*   node-postgres (`pg` Pool driver)
*   Zod (Request validation schemas)
*   JSON Web Token (JWT) & bcryptjs

### Database
*   PostgreSQL (Neon / Supabase / Local)

---

## 📦 Directory Structure

```
EduSync AI/
├── backend/                  # Express.js API Server
│   ├── src/
│   │   ├── config/           # Environment config loader
│   │   ├── database/         # PostgreSQL connection driver, DDL schema, and seeders
│   │   ├── controllers/      # Route controllers (CRUD actions, AI engines)
│   │   ├── routes/           # REST endpoints declaration
│   │   ├── middlewares/      # JWT guards, validation filters, and error handlers
│   │   ├── validators/       # Zod parameters validation
│   │   └── app.ts            # Server entrypoint
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # React.js SPA Client
    ├── src/
    │   ├── store/            # Zustand session caches
    │   ├── utils/            # Axios API wrappers
    │   ├── pages/            # Public landing page, Login portal, and Role dashboards
    │   ├── App.tsx           # React Router tree & route guards
    │   ├── main.tsx          # DOM mounts
    │   └── index.css         # Tailwind style directives
    ├── tailwind.config.js
    ├── tsconfig.json
    └── vite.config.ts
```

---

## ⚡ Setup & Installation

### Prerequisite
Ensure you have **Node.js** (v18+) and a **PostgreSQL** instance running.

### 1. Database Configuration
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/edusync_ai
JWT_SECRET=edusync_ai_super_secret_jwt_key_2026
JWT_REFRESH_SECRET=edusync_ai_super_secret_refresh_jwt_key_2026
GEMINI_API_KEY=your_optional_gemini_api_key
```

### 2. Migration and Seeding
Compile the schemas DDL and seed the PostgreSQL tables with comprehensive mock profiles:
```bash
cd backend
npm run db:seed
```
*Note: If the database URL connection is absent or offline during frontend deployment reviews, the backend automatically registers a stateful **in-memory mock database** so all login shortcuts, attendance loggers, and payments checkouts function successfully.*

### 3. Launch Backend Server
```bash
cd backend
npm run dev
```
The API server starts listening on [http://localhost:5000](http://localhost:5000).

### 4. Launch Frontend Client
```bash
cd frontend
npm run dev
```
The client dashboard opens on [http://localhost:3000](http://localhost:3000).

---

## 🧭 REST API Map

| Endpoint | Method | Role Permissions | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | Public | Authenticate user & issue tokens |
| `/api/auth/register` | `POST` | Public | Register a new user account with role profiles |
| `/api/auth/profile` | `GET` | All Roles | Fetch current profile metadata |
| `/api/students` | `GET`, `POST` | Admin, Principal, HOD | List directory and admit new students |
| `/api/teachers` | `GET`, `POST` | Admin, Principal | List faculty and register workload |
| `/api/departments` | `GET`, `POST` | Admin, Principal | List departments and assign HOD |
| `/api/school/classes` | `GET` | All Roles | Fetch registered grade classes catalog |
| `/api/school/subjects` | `GET`, `POST` | GET: All, POST: Admin, Principal | Manage course subjects catalog |
| `/api/attendance` | `POST` | Teacher, Admin | Record daily/subject roster check-in logs |
| `/api/exams/grade` | `POST` | Teacher, Admin | Log test scores & convert points |
| `/api/exams/report-card/:id`| `GET` | Student, Parent, Admin | Get report transcript sheet & GPA card |
| `/api/assignments/submit`| `POST` | Student | Upload simulated assignment PDF link |
| `/api/payments/record` | `POST` | Parent, Accountant | Process invoices or bank draft payments |
| `/api/payments/student/:id`| `GET` | Parent, Accountant | Fetch student outstanding invoices & history |
| `/api/timetables/class/:c/:s`| `GET` | All Roles | Fetch calendars and scheduler slots |
| `/api/ai/assistant` | `POST` | Student, Teacher | Send questions to AI academic helper |
| `/api/ai/insights/:id` | `GET` | Parent, Student | Fetch performance trend diagnostics |

---

## 🧪 Seeding & Test Credentials
To get started on a clean setup:
1. Register a new user directly in the frontend using the **Create an account** link. Select your desired role (Admin, Accountant, Teacher, Student, or Parent) to automatically provision the matching dashboard portal.
2. The database seeder comes pre-configured with a default **System Administrator** account:
   *   **Email**: `admin@edusync.com`
   *   **Password**: `admin123`

