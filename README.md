<div align="center">

# 🎓 EduSync AI
### *Next-Generation Enterprise School & College ERP Platform*

![Version](https://img.shields.io/badge/version-2.5.0-cyan?style=for-the-badge&logo=react)
![License](https://img.shields.io/badge/license-MIT-indigo?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-emerald?style=for-the-badge&logo=github)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-blue?style=for-the-badge&logo=google)
![Design System](https://img.shields.io/badge/UI-Liquid%20Glassmorphism-pink?style=for-the-badge)

<p align="center">
  <b>EduSync AI</b> is an all-in-one Cloud ERP and Academic Operating System unifying educational administration, student intelligence, multi-channel tuition billing, classroom scheduling, transport fleet, hostels, library LMS, and bilingual policy guidelines under a state-of-the-art <b>Liquid Glass</b> interface.
</p>

[✨ Explore Live Demo](#-quick-start) • [📖 Read PRD Specification](./product_requirements_document.md) • [🗺️ API Registry](#%EF%B8%8F-api-route-registry) • [🎨 Design System](#-liquid-glass-ui-design-system)

---

</div>

## 📌 Table of Contents
- [🌟 Executive Value Proposition](#-executive-value-proposition)
- [⚔️ Pin-to-Pin Enterprise ERP Comparison](#%EF%B8%8F-pin-to-pin-enterprise-erp-comparison)
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

Educational institutions often operate on legacy administrative tools plagued by fragmented modules, zero predictive student analytics, poor mobile responsiveness, and high downtime during maintenance. **EduSync AI** solves these pain points by integrating high-throughput data management with **Google Gemini AI**, real-time bilingual English & Arabic RTL support, native transport/hostel/library modules, and multi-persona access control.

---

## ⚔️ Pin-to-Pin Enterprise ERP Comparison

| ERP Feature Domain | PowerSchool (District ERP) | Fedena (Modular ERP) | OpenEduCat (Odoo-Based) | **EduSync AI (Our System)** |
| :--- | :---: | :---: | :---: | :---: |
| **High Availability Architecture** | Cloud Only (Downtime risk) | Server Only | Server / Self-Host | **Dual Engine (PostgreSQL + In-Memory Fallback)** |
| **Built-in Generative AI Tutor** | Third-party add-on | None | None | **Native Google Gemini 1.5 Flash Chatbot** |
| **Predictive At-Risk Analytics** | Basic Reports | Plugin Required | Basic Reports | **Automated AI Risk Level & Recommendations** |
| **Bilingual Guidelines & RTL** | English Only | Paid Plugin | Limited | **Native English & Arabic with Dynamic RTL (`dir="rtl"`)** |
| **SOP One-Click AI Translation** | None | None | None | **1-Click AI Translation (Gemini + Local Fallback)** |
| **UI Aesthetics & Themes** | Standard Enterprise Tables | Classic Web Layout | Odoo Standard | **White Glossy Liquid Glassmorphism & Blobs** |
| **Student Information System (SIMS)** | ✅ Included | ✅ Included | ✅ Included | **✅ Full CRUD with Admission & Parent Link** |
| **Faculty Management (FIMS)** | ✅ Included | ✅ Included | ✅ Included | **✅ Department Allocation & HOD Tracking** |
| **Conflict-Free Timetable Engine** | ✅ Included | ✅ Included | ✅ Included | **✅ Unique Composite SQL Key Enforcement** |
| **Digital Attendance Register** | ✅ Included | ✅ Included | ✅ Included | **✅ Daily & Subject Check-In with Remarks** |
| **Exams, Marks & GPA Calculator** | ✅ Included | ✅ Included | ✅ Included | **✅ Automated Grade Point & Letter Conversion** |
| **Assignments & Online Submissions** | ✅ Included | ✅ Included | ✅ Included | **✅ PDF/Cloud Document Submission & Grading** |
| **Tuition Billing & Transaction Ledger** | ✅ Included | ✅ Included | ✅ Included | **✅ Multi-Channel Payments & Receipt Voucher** |
| **Transport & Fleet Bus Management** | Paid Module | Paid Plugin | Paid Module | **✅ Native Transport Routes & Vehicles** |
| **Hostel & Dormitory Accommodation** | Paid Module | Paid Plugin | Paid Module | **✅ Native Hostels & Room Rent Allocation** |
| **Library Management System (LMS)** | Paid Module | Paid Plugin | Paid Module | **✅ Native Books Catalog & ISBN Checkout** |

---

## 🏛️ Multi-Role Personas & Portals

EduSync AI provides customized user experiences tailored to 7 security roles across 5 dashboard interfaces:

- **System Administrator:** Manage master directories, campus departments, transport routes, hostels, library catalogs, and SOP translations.
- **Principal & HOD:** Read-only executive oversight across all campus departments, academic records, transport, hostel, and financial statements.
- **Faculty Teacher:** Daily/subject attendance register, exam gradebook, homework reviewer, schedule calendar, and library issue assistant.
- **Enrolled Student:** Report card transcripts, GPA calculator, pending assignment submitter, class schedule grid, and EduSync AI Chatbot Tutor.
- **Linked Parent / Guardian:** Attendance rate charts, child progress alerts, fee invoices payment, and bilingual SOP policies.
- **Campus Accountant:** Fee structures management, manual cash/cheque payment logging, receipt voucher generation, and revenue analytics.

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
    │   27 Tables + Triggers + Indexes      │       │   Direct HTTPS API Bridge     │
    +---------------------------------------+       +-------------------------------+
                        │
    +-------------------+-------------------+
    │   HIGH-AVAILABILITY MOCK ENGINE       │
    │   In-Memory MockDb (Zero Downtime)    │
    +---------------------------------------+
```

---

## ⚡ Quick Start & Installation Guide

### Prerequisites
- **Node.js** (v18.0.0 or higher)
- **PostgreSQL** instance (Optional: system automatically activates In-Memory MockDb if PostgreSQL is offline).

```bash
# 1. Clone repository
git clone https://github.com/Masthan008/edusyncai.git
cd "EduSync AI"

# 2. Launch Backend
cd backend
npm install
npm run db:seed
npm run dev

# 3. Launch Frontend (in new terminal)
cd ../frontend
npm install
npm run dev
```

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
| `/api/payments/receipt/:id` | `GET` | Authenticated | Generate transaction receipt voucher |
| `/api/timetables` | `POST`, `GET` | Admin, All Roles | Schedule classroom slots or view timetable grids |
| `/api/transport/routes` | `GET`, `POST` | Admin, Principal | Manage bus routes & fares |
| `/api/transport/vehicles` | `GET`, `POST` | Admin, Principal | Register bus vehicles & driver contacts |
| `/api/hostel` | `GET`, `POST` | Admin, Principal | Manage hostel buildings |
| `/api/hostel/rooms` | `GET`, `POST` | Admin, Principal | Configure hostel rooms & rent amounts |
| `/api/library/books` | `GET`, `POST` | Authenticated | Catalog library books & ISBN codes |
| `/api/library/issues` | `GET`, `POST` | Admin, Teacher | Issue library books to students |
| `/api/library/return/:id` | `PUT` | Admin, Teacher | Process returned books & calculate fines |
| `/api/ai/assistant` | `POST` | Authenticated | Interact with EduSync AI Tutor Chatbot |
| `/api/ai/insights/:id` | `GET` | Authenticated | Retrieve AI predictive academic risk diagnostics |
| `/api/sops` | `GET`, `POST` | Authenticated | Fetch or publish Standard Operating Procedures |
| `/api/sops/translate` | `POST` | Admin, Principal, HOD | Auto-translate English SOP to Arabic via Gemini AI |

---

## 🎨 Liquid Glass UI Design System

EduSync AI introduces a high-performance **Glossy Light Mode Glassmorphism** design language:

- **Floating Liquid Backdrops:** Animated gradient spheres floating across the canvas via `@keyframes float-blob`.
- **Contrast Typography:** Slate-800 (`#1e293b`) & Slate-900 (`#0f172a`) fonts ensure maximum legibility over frosted white glass panels.
- **Native RTL Rendering:** Realigns step timelines, scrollbars, and navigation drawers when Arabic mode is enabled (`dir="rtl"`).

---

## 📄 License & Credits

- **Author & Lead Developer:** [Masthan008](https://github.com/Masthan008)
- **Organization:** EduSync AI Systems
- **License:** Open Source under [MIT License](LICENSE)
