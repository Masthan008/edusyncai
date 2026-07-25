<div align="center">

# 🎓 EduSync AI
### *Next-Generation Enterprise School & College ERP Platform*

![Version](https://img.shields.io/badge/version-2.0.0-cyan?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-indigo?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-emerald?style=for-the-badge&logo=github)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-blue?style=for-the-badge&logo=google)
![Design System](https://img.shields.io/badge/UI-Liquid%20Glassmorphism-pink?style=for-the-badge)

<p align="center">
  <b>EduSync AI</b> is an all-in-one Cloud ERP and Academic Operating System unifying educational administration, student intelligence, multi-channel tuition billing, classroom scheduling, and bilingual policy guidelines under a state-of-the-art <b>Liquid Glass</b> interface.
</p>

[✨ Explore Live Demo](#-quick-start) • [📖 Read PRD Specification](./product_requirements_document.md) • [🗺️ API Registry](#%EF%B8%8F-api-route-registry) • [🎨 Design System](#-liquid-glass-ui-design-system)

---

</div>

## 📌 Table of Contents
- [🌟 Executive Value Proposition](#-executive-value-proposition)
- [✨ Key Architecture Differentiators](#-key-architecture-differentiators)
- [🏛️ Multi-Role Personas & Portals](#%EF%B8%8F-multi-role-personas--portals)
- [📊 System Architecture & Data Flow](#-system-architecture--data-flow)
- [🛠️ Tech Stack & Engineering Stack](#%EF%B8%8F-tech-stack--engineering-stack)
- [⚡ Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🗺️ API Route Registry](#%EF%B8%8F-api-route-registry)
- [🎨 Liquid Glass UI Design System](#-liquid-glass-ui-design-system)
- [🚀 Strategic Product Roadmap](#-strategic-product-roadmap)
- [📋 Unique Reusable README Template](#-unique-reusable-readme-template)
- [📄 License & Credits](#-license--credits)

---

## 🌟 Executive Value Proposition

Educational institutions often operate on legacy administrative tools plagued by fragmented modules, zero predictive student analytics, poor mobile responsiveness, and high downtime during maintenance. **EduSync AI** solves these pain points by integrating high-throughput data management with **Google Gemini AI**, real-time bilingual English & Arabic RTL support, and multi-persona access control.

```
       +-------------------------------------------------------------------------+
       |                           EDUSYNC AI ECOSYSTEM                          |
       +-------------------------------------------------------------------------+
       |  [Admins & Board] ----> Executive Dashboards & SOP Translators          |
       |  [Faculty Staff]  ----> Conflict-Free Timetables & Digital Registers    |
       |  [Students]       ----> AI Tutor Assistant & Interactive Report Cards   |
       |  [Parents]        ----> Tuition Invoices & Child Academic Analytics     |
       |  [Accountants]    ----> Multi-Channel Payments & Financial Ledgers      |
       +-------------------------------------------------------------------------+
```

---

## ✨ Key Architecture Differentiators

| Feature | Legacy School ERP | EduSync AI Engine |
| :--- | :--- | :--- |
| **High Availability** | Single DB dependency (downtime on error) | **Dual Execution Engine** (PostgreSQL + In-Memory Fallback) |
| **AI Capabilities** | None / Manual spreadsheet exports | **Google Gemini 1.5 Flash** (Tutor AI, Risk Alerts, Auto-SOP Translate) |
| **User Interface** | Cluttered tables & static forms | **Liquid Glass Theme** (Glassmorphism, Floating Blobs, Inter font) |
| **Multi-Language** | Single language default | **Native English & Arabic** with dynamic Right-to-Left (`dir="rtl"`) |
| **Role Partitioning** | Hardcoded permissions | **7 Security Personas** across 5 custom dashboard interfaces |

---

## 🏛️ Multi-Role Personas & Portals

EduSync AI provides customized user experiences tailored to 7 security roles across 5 dashboard interfaces:

<details>
<summary><b>1. 👑 System Administrator (Admin Dashboard)</b></summary>
<br />

- **Universal Control:** Manage Student, Faculty, and Parent master directories (Create, Edit, Deactivate).
- **Hierarchy Setup:** Create Departments, assign HODs, define Classes, and map Sections with Advisor Teachers & Room Numbers.
- **SOP Policy Hub:** Create, publish, and auto-translate Standard Operating Procedures (SOPs) into Arabic with 1 click.
</details>

<details>
<summary><b>2. 🏫 Principal & HOD (Executive Overlay)</b></summary>
<br />

- **Executive Auditing:** Read-only access across all campus departments, academic records, and financial revenue graphs.
- **Workload Supervision:** Monitor faculty assignment allocations, section occupancy, and academic performance metrics.
</details>

<details>
<summary><b>3. 👩‍🏫 Faculty Teacher (Teacher Dashboard)</b></summary>
<br />

- **Digital Attendance:** Take daily or subject-specific attendance check-ins (`Present`, `Absent`, `Late`, `Excused`) with custom remarks.
- **Gradebook Journal:** Log exam scores with automatic grade conversion (`A+`, `A`, `B`, `C`, `F`) and GPA calculation.
- **Homework Portal:** Publish assignments, inspect student submission links, and provide grading feedback.
- **Teaching Schedule:** View personalized weekly schedule grids and assigned classroom locations.
</details>

<details>
<summary><b>4. 👨‍🎓 Enrolled Student (Student Dashboard)</b></summary>
<br />

- **Report Card Transcript:** View cumulative GPA (e.g., 3.70 / 4.00), exam letter grades, and AI report summaries.
- **Assignment Submissions:** Submit homework solutions via PDF/Document links with student notes.
- **EduSync AI Chatbot:** Interact with a personal AI virtual tutor for homework help and exam revision guidance.
</details>

<details>
<summary><b>5. 👨‍👩‍👦 Linked Parent / Guardian (Parent Dashboard)</b></summary>
<br />

- **Child Analytics:** Track real-time attendance percentages, upcoming exam dates, and progress alerts.
- **Tuition Bills:** View itemized fee structures, track due dates, and process online fee payments.
- **Bilingual SOP Hub:** Access school policies in English or Arabic with full RTL support.
</details>

<details>
<summary><b>6. 💳 Campus Accountant (Accountant Dashboard)</b></summary>
<br />

- **Fee Structuring:** Create annual/term tuition fee templates categorized by grade class.
- **Payment Ledger:** Log manual cash/cheque transactions, verify reference numbers, and review revenue trend analytics.
</details>

---

## 📊 System Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                FRONTEND CLIENT LAYER                              |
|   React 18 | TypeScript | Tailwind CSS (Liquid Glass) | Zustand | Axios | Lucide   |
+-----------------------------------------------------------------------------------+
                                          │ REST API (JSON / Bearer JWT)
                                          ▼
+-----------------------------------------------------------------------------------+
|                                BACKEND SERVER LAYER                               |
|   Node.js | Express.js | TypeScript | Zod Validation | JWT Security | Helmet       |
+-----------------------------------------------------------------------------------+
                        │                                   │
    +-------------------+-------------------+       +-------+-----------------------+
    │   PRIMARY DATABASE ENGINE             │       │   EXTERNAL AI ENGINE          │
    │   PostgreSQL 15+ (pg Pool Driver)     │       │   Google Gemini 1.5 Flash     │
    │   21 Tables + Triggers + Indexes      │       │   Direct HTTPS API Bridge     │
    +---------------------------------------+       +-------------------------------+
                        │
    +-------------------+-------------------+
    │   HIGH-AVAILABILITY MOCK ENGINE       │
    │   In-Memory MockDb (Zero Downtime)    │
    +---------------------------------------+
```

---

## 🛠️ Tech Stack & Engineering Stack

### Frontend Stack
- **Framework:** React 18 with TypeScript & Vite
- **Styling:** Tailwind CSS (Custom Liquid Glass tokens & backdrop blurs)
- **State Management:** Zustand (Session auth cache & user state)
- **Icons & Graphics:** Lucide React icons
- **HTTP Client:** Axios with Request & Response Interceptors

### Backend Stack
- **Runtime & Framework:** Node.js & Express.js (TypeScript)
- **Database Driver:** `pg` (node-postgres Connection Pooling)
- **Validation:** Zod Schema Validator
- **Security:** JSON Web Tokens (JWT), BcryptJS, Helmet, CORS
- **Logging:** Morgan HTTP logger

### Database Architecture
- **Engine:** PostgreSQL 15+ with `uuid-ossp` extension
- **Schema Count:** 21 Normalized Database Tables with Cascading Foreign Keys & PL/pgSQL Triggers

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **PostgreSQL** instance (Optional: system automatically activates In-Memory MockDb if PostgreSQL is offline).

### 1. Repository Setup
```bash
# Clone the repository
git clone https://github.com/Masthan008/edusyncai.git

# Navigate to project directory
cd "EduSync AI"
```

### 2. Backend Environment & Launch
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file (.env)
cp .env.example .env

# Configure backend environment variables
# Edit .env file:
# PORT=5000
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/edusync_ai
# JWT_SECRET=edusync_ai_super_secret_jwt_key_2026
# GEMINI_API_KEY=your_optional_gemini_api_key

# Seed database schema and sample data
npm run db:seed

# Start backend development server
npm run dev
```
> Server will be live on `http://localhost:5000`

### 3. Frontend Client Setup & Launch
```bash
# Navigate to frontend directory in a new terminal
cd ../frontend

# Install dependencies
npm install

# Start frontend development client
npm run dev
```
> Web Application will be live on `http://localhost:3000`

---

## 🔐 Default Demo Credentials

| Security Role | Demo Login Email | Demo Password | Accessible Features |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@edusync.com` | `admin123` | Full Campus Directory, SOP Translator, Global Settings |
| **Self Registration** | Click **Create an account** on login page | User Specified | Choose any role (Teacher, Student, Parent, Accountant) to provision matching dashboard |

---

## 🗺️ API Route Registry

| Endpoint URI | Method | Role Permission | Description |
| :--- | :---: | :---: | :--- |
| `/api/health` | `GET` | Public | System status and operational health check |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns JWT bearer token |
| `/api/auth/register` | `POST` | Public | Onboards new user account with selected role |
| `/api/students` | `GET`, `POST` | Admin, Principal, HOD | List enrolled students or admit new student |
| `/api/teachers` | `GET`, `POST` | Admin, Principal | List faculty members or create teacher profile |
| `/api/departments` | `GET`, `POST` | Admin, Principal | Manage campus departments and HOD links |
| `/api/attendance` | `POST` | Teacher, Admin | Submit daily/subject student attendance register |
| `/api/exams/grades` | `POST` | Teacher, Admin | Log student exam scores & update cumulative GPA |
| `/api/assignments` | `POST` | Teacher, Admin | Publish new homework assignment to section |
| `/api/assignments/submit` | `POST` | Student | Submit assignment document URL & student notes |
| `/api/payments` | `POST` | Accountant, Parent | Process fee payment transaction |
| `/api/timetables` | `POST`, `GET` | Admin, All Roles | Schedule classroom slots or view timetable grids |
| `/api/ai/assistant` | `POST` | Authenticated | Interact with EduSync AI Tutor Chatbot |
| `/api/ai/insights/:id` | `GET` | Authenticated | Retrieve AI predictive academic risk diagnostics |
| `/api/sops` | `GET`, `POST` | Authenticated | Fetch or publish Standard Operating Procedures |
| `/api/sops/translate` | `POST` | Admin, Principal, HOD | Auto-translate English SOP to Arabic via Gemini AI |

---

## 🎨 Liquid Glass UI Design System

EduSync AI introduces a high-performance **Glossy Light Mode Glassmorphism** design language:

```css
/* Core Design Tokens */
.glass-panel {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.04);
}

/* Background Liquid Spheres Animation */
@keyframes float-blob {
  0%   { transform: translate(0px, 0px) scale(1); }
  33%  { transform: translate(40px, -60px) scale(1.15); }
  66%  { transform: translate(-30px, 30px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
```

- **Floating Liquid Backdrops:** Animated gradient spheres floating across the canvas via `@keyframes float-blob`.
- **Contrast Typography:** Slate-800 (`#1e293b`) & Slate-900 (`#0f172a`) fonts ensure maximum legibility over frosted white glass panels.
- **Native RTL Rendering:** Realigns step timelines, scrollbars, and navigation drawers when Arabic mode is enabled (`dir="rtl"`).

---

## 🚀 Strategic Product Roadmap

```
Phase 1: Advanced AI (Q3 2026)      ---> AI Lecture Summarizer & Gemini Quiz Bank Generator
Phase 2: Mobile & SMS (Q4 2026)      ---> Native iOS/Android Apps & Twilio WhatsApp Gateway
Phase 3: Extended Campus (Q1 2027)   ---> Hostel, Bus Live GPS Tracking & RFID Gate Attendance
Phase 4: Multi-Campus SaaS (Q2 2027) ---> Multi-Tenant Switcher & Board Accreditation Reports
```

---

## 📋 Unique Reusable README Template

> *Want to use this unique, high-impact README style for your own project? Copy the modular template block below!*

<details>
<summary><b>👉 Click to Expand Unique README Template Code</b></summary>

```markdown
<div align="center">

# 🚀 Your Project Name
### *Short Project Tagline or Mission Statement*

![Version](https://img.shields.io/badge/version-1.0.0-cyan?style=for-the-badge)
![Status](https://img.shields.io/badge/status-active-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-indigo?style=for-the-badge)

<p align="center">
  A brief 2-sentence description of your project's unique value proposition, tech stack, and user experience.
</p>

[✨ Live Demo](#) • [📖 Documentation](#) • [⚡ Quick Start](#)

</div>

---

## 📌 Table of Contents
- [🌟 Key Features](#-key-features)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [⚡ Installation](#-installation)
- [🗺️ API Registry](#%EF%B8%8F-api-registry)
- [📄 License](#-license)

---

## 🌟 Key Features

| Feature | Description | Highlight |
| :--- | :--- | :--- |
| **Feature 1** | Describe primary capability | ⚡ High Performance |
| **Feature 2** | Describe secondary capability | 🔒 Secure |
| **Feature 3** | Describe third capability | 🎨 Beautiful UI |

---

## 🏗️ System Architecture

```
[ Frontend Layer ] ---> ( REST / GraphQL API ) ---> [ Backend Layer ] ---> [ Database Storage ]
```

---

## ⚡ Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/yourproject.git

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
```

</details>

---

## 📄 License & Credits

- **Author & Lead Developer:** [Masthan008](https://github.com/Masthan008)
- **Organization:** EduSync AI Systems
- **License:** Open Source under [MIT License](LICENSE)
- **Built with:** React.js, Express.js, TypeScript, Tailwind CSS, PostgreSQL, and Google Gemini AI.

---

<div align="center">

<b>EduSync AI</b> — *Empowering Educational Institutions with Intelligence & Modern Aesthetics.*

⭐ **If you find this repository helpful, please consider giving it a star!** ⭐

</div>
