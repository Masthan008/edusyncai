<div align="center">

# 🎓 EduSync AI
### *Next-Generation Enterprise School & College ERP Platform*

![Version](https://img.shields.io/badge/version-3.2.0-emerald?style=for-the-badge&logo=react)
![Theme](https://img.shields.io/badge/theme-Liquid%20Glass%20%2B%20Green%20%26%20Blue-blue?style=for-the-badge)
![Currency](https://img.shields.io/badge/pricing-INR%20%E2%82%B9%20Native-success?style=for-the-badge)
![Languages](https://img.shields.io/badge/i18n-English%20%2B%20Arabic%20RTL-success?style=for-the-badge)
![Build](https://img.shields.io/badge/build-passing-emerald?style=for-the-badge&logo=github)
![AI Powered](https://img.shields.io/badge/AI-Google%20Gemini%201.5%20Flash-indigo?style=for-the-badge&logo=google)

<p align="center">
  <b>EduSync AI</b> is an all-in-one Cloud ERP and Academic Operating System unifying educational administration, student intelligence, multi-channel tuition billing, classroom scheduling, transport fleet, hostels, library LMS, and bilingual policy guidelines under a state-of-the-art <b>Liquid Glass</b> interface with dynamic <b>Arabic RTL</b> language switching and native <b>INR (₹) Pricing Tiers</b>.
</p>

[✨ Explore Live Demo](#-quick-start) • [📖 Read PRD Specification](./product_requirements_document.md) • [🗺️ API Registry](#%EF%B8%8F-api-route-registry) • [🎨 Design System](#-liquid-glass-ui-design-system)

---

</div>

## 📌 Table of Contents
- [🌟 Executive Value Proposition](#-executive-value-proposition)
- [💰 Transparent Enterprise Pricing (INR ₹)](#-transparent-enterprise-pricing-inr-)
- [⚔️ Pin-to-Pin Enterprise ERP Comparison](#%EF%B8%8F-pin-to-pin-enterprise-erp-comparison)
- [🏛️ Multi-Role Personas & Portals](#%EF%B8%8F-multi-role-personas--portals)
- [📊 System Architecture & Data Flow](#-system-architecture--data-flow)
- [⚡ Quick Start & Installation Guide](#-quick-start--installation-guide)
- [🗺️ API Route Registry](#%EF%B8%8F-api-route-registry)
- [🎨 Liquid Glass Design System & Animations](#-liquid-glass-design-system--animations)
- [📄 License & Credits](#-license--credits)

---

## 💰 Transparent Enterprise Pricing (INR ₹)

| Plan Tier | Price (INR ₹) | Target Institution | Included Built-in Features |
| :--- | :---: | :--- | :--- |
| **Academy Starter Plan** | **₹9,999** / mo | Small Private K-12 Schools, Academies & Coaching Institutes | Up to 500 Active Students, SIMS, FIMS, Digital Attendance, Marks & GPA Calculator, Tuition Fee Invoices, PostgreSQL High Availability Cloud |
| **Campus Enterprise Plan** | **₹24,999** / mo *(Popular)* | Colleges, High Schools & Multi-Branch Networks | Unlimited Students, Google Gemini 1.5 Flash AI Tutor, At-Risk Predictive Analytics, Bilingual English/Arabic RTL SOP Guidelines & 1-Click Translation, Transport Fleet, Hostel Allocation, Library LMS with ISBN Barcodes, Printable Receipts & Report Cards |
| **District SaaS Network** | **₹49,999** / mo | Large University Networks, Board Districts & Franchise Networks | Multi-Tenant Data Isolation, Custom Subdomains & University SSO/SAML, On-Premises Campus Docker Deployment, Full Source Code License & Dedicated SLA |

*Admin users can dynamically modify tier pricing in INR (₹) and features via the `/api/school/pricing` endpoint in the Admin Dashboard.*

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

## ⚡ Quick Start & Installation Guide

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
| `/api/school/pricing` | `GET` | Public | Retrieves active plan pricing tiers in INR (₹) |
| `/api/school/pricing/:id` | `PUT` | Admin | Modifies plan tier pricing and feature lists |
| `/api/auth/login` | `POST` | Public | Authenticates credentials and returns JWT bearer token |
| `/api/students` | `GET`, `POST` | Admin, Principal, HOD | List enrolled students or admit new student |
| `/api/teachers` | `GET`, `POST` | Admin, Principal | List faculty members or create teacher profile |
| `/api/departments` | `GET`, `POST` | Admin, Principal | Manage campus departments and HOD links |
| `/api/attendance` | `POST` | Teacher, Admin | Submit daily/subject student attendance register |
| `/api/exams/grades` | `POST` | Teacher, Admin | Log student exam scores & update cumulative GPA |
| `/api/assignments` | `POST` | Teacher, Admin | Publish new homework assignment to section |
| `/api/payments` | `POST` | Accountant, Parent | Process fee payment transaction |
| `/api/payments/receipt/:id` | `GET` | Authenticated | Generate transaction receipt voucher |
| `/api/transport/routes` | `GET`, `POST` | Admin, Principal | Manage bus routes & fares |
| `/api/hostel/rooms` | `GET`, `POST` | Admin, Principal | Configure hostel rooms & rent amounts |
| `/api/library/books` | `GET`, `POST` | Authenticated | Catalog library books & ISBN codes |
| `/api/ai/assistant` | `POST` | Authenticated | Interact with EduSync AI Tutor Chatbot |
| `/api/sops/translate` | `POST` | Admin, Principal, HOD | Auto-translate English SOP to Arabic via Gemini AI |

---

## 🎨 Liquid Glass Design System & Animations

- **Liquid Glass Translucency:** Frosted translucent white glass panels (`background: rgba(255, 255, 255, 0.65)`, `backdrop-filter: blur(28px) saturate(190%)`).
- **Dynamic Floating Backdrops:** Multi-axis 800px fluid gradient liquid motion spheres (`from-emerald-400/40 via-teal-300/35 to-blue-500/40`) via `@keyframes float-blob-1` & `@keyframes float-blob-2`.
- **Motion & Glowing Effects:**
  - `@keyframes pulse-glow`: Glowing border animation around active cards and badges (`.animate-pulse-glow`).
  - `@keyframes float-slow`: Smooth vertical floating animation for emblem icons (`.animate-float-slow`).
  - Light shimmer glass reflection beams (`.glass-shimmer`).

---

## 📄 License & Credits

- **Author & Lead Developer:** [Masthan008](https://github.com/Masthan008)
- **Organization:** EduSync AI Systems Inc.
- **License:** Open Source under [MIT License](LICENSE)
