# 🎓 EduSync AI - Enterprise School & College Management System
## Official User Manual & Operational Guide
**Version 3.2.0**

---

## 📌 Table of Contents
1. [Introduction & System Overview](#1-introduction--system-overview)
2. [Getting Started & Installation](#2-getting-started--installation)
3. [User Roles & Access Control](#3-user-roles--access-control)
4. [User Portals & Navigation Guide](#4-user-portals--navigation-guide)
   - [4.1 Administrator Portal](#41-administrator-portal)
   - [4.2 Principal & Leadership Portal](#42-principal--leadership-portal)
   - [4.3 Department Head (HOD) Portal](#43-department-head-hod-portal)
   - [4.4 Teacher & Faculty Portal](#44-teacher--faculty-portal)
   - [4.5 Student Portal](#45-student-portal)
   - [4.6 Parent & Guardian Portal](#46-parent--guardian-portal)
   - [4.7 Accountant & Financial Portal](#47-accountant--financial-portal)
5. [Comprehensive Module Operational Manual](#5-comprehensive-module-operational-manual)
   - [Module 1: Student Information Management System (SIMS)](#module-1-student-information-management-system-sims)
   - [Module 2: Faculty Information Management System (FIMS)](#module-2-faculty-information-management-system-fims)
   - [Module 3: Academic Scheduling & Timetable Engine](#module-3-academic-scheduling--timetable-engine)
   - [Module 4: Digital Attendance Register](#module-4-digital-attendance-register)
   - [Module 5: Examinations, Grading & GPA Calculator](#module-5-examinations-grading--gpa-calculator)
   - [Module 6: Assignments & Digital Submissions](#module-6-assignments--digital-submissions)
   - [Module 7: Finance, Tuition Fees & Invoicing (INR ₹)](#module-7-finance-tuition-fees--invoicing-inr-)
   - [Module 8: EduSync AI Tutor & At-Risk Predictive Analytics](#module-8-edusync-ai-tutor--at-risk-predictive-analytics)
   - [Module 9: SOP Policy Guidelines & Arabic RTL Support](#module-9-sop-policy-guidelines--arabic-rtl-support)
   - [Module 10: Transport Fleet & Bus Route Engine](#module-10-transport-fleet--bus-route-engine)
   - [Module 11: Hostel & Dormitory Accommodation System](#module-11-hostel--dormitory-accommodation-system)
   - [Module 12: Library Management System (LMS)](#module-12-library-management-system-lms)
6. [Pricing Tiers & Subscription Management](#6-pricing-tiers--subscription-management)
7. [Troubleshooting & Frequently Asked Questions (FAQ)](#7-troubleshooting--frequently-asked-questions-faq)

---

## 1. Introduction & System Overview

**EduSync AI** is a next-generation Cloud ERP and Academic Operating System designed for K-12 schools, high school academies, vocational colleges, and university networks. Built with a high-performance **Liquid Glass** user interface, EduSync AI unifies all administrative, academic, financial, and facility management operations under a single platform.

### Key Differentiators
- **Dual-Engine Architecture:** High availability PostgreSQL backend with automatic in-memory fallback ensure uninterrupted operational uptime.
- **Generative AI Integration:** Native integration with Google Gemini 1.5 Flash powers an interactive AI Student Tutor, automated academic at-risk predictions, and 1-click English-to-Arabic SOP translation.
- **Bilingual & RTL Ready:** Instant dynamic switching between English and Arabic (`dir="rtl"`) for guidelines, forms, timelines, and interface components.
- **Multi-Tenant & Multi-Role:** Standardized role-based access for 7 distinct campus personas across 5 dedicated web portals.
- **Native INR (₹) Financial Management:** Enterprise pricing tiers, fee invoice generation, payment transaction tracking, and printable PDF voucher receipts in Indian Rupees (₹).

---

## 2. Getting Started & Installation

### System Prerequisites
- **Node.js:** v18.0.0 or higher
- **Package Manager:** `npm` (v9.0.0+) or `yarn`
- **Database:** PostgreSQL v14+ (Optional; fallback in-memory mode active by default)

### Installation & Launching the Application

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Masthan008/edusyncai.git
   cd "EduSync AI"
   ```

2. **Backend Setup & Launch:**
   ```bash
   cd backend
   npm install
   npm run db:seed    # Seeds default initial data and demo credentials
   npm run dev        # Launches server on http://localhost:5000
   ```

3. **Frontend Setup & Launch:**
   ```bash
   cd ../frontend
   npm install
   npm run dev        # Launches UI client on http://localhost:5173
   ```

---

## 3. User Roles & Access Control

EduSync AI implements Role-Based Access Control (RBAC) to ensure security and privacy across all institution operations.

| Role | Access Level | Primary Responsibilities |
| :--- | :--- | :--- |
| **Admin** | System Wide | System configuration, database backups, pricing tier management, global user accounts |
| **Principal** | Academic Executive | Institution oversight, SOP policy approval, staff/student analytics, curriculum monitoring |
| **HOD** | Department Head | Departmental schedules, course allocations, teacher evaluations, subject performance |
| **Teacher** | Classroom Level | Attendance check-ins, assignment creation, exam grading, student AI performance notes |
| **Student** | Personal Portal | Viewing timetables, submitting assignments, AI Tutor assistance, checking grades & attendance |
| **Parent** | Ward Guardian | Monitoring student progress, attendance alerts, fee invoice payment & receipt downloads |
| **Accountant** | Financial Desk | Processing tuition fees, generating transaction ledger reports, managing pending balances |

---

## 4. User Portals & Navigation Guide

### 4.1 Administrator Portal
- **Dashboard View:** System analytics, total active users, server uptime, database sync status.
- **Key Features:**
  - **User Management:** Create, update, or deactivate user profiles for teachers, students, parents, and staff.
  - **Pricing Tier Configurator:** Modify active pricing plans (Academy Starter, Campus Enterprise, District SaaS) in INR (₹).
  - **Global System Logs:** Monitor API request rates, system exceptions, and audit trails.

### 4.2 Principal & Leadership Portal
- **Dashboard View:** Institutional KPIs, overall student pass rate, faculty attendance summary, department rankings.
- **Key Features:**
  - **Policy & SOP Manager:** Review institution guidelines and trigger 1-click AI translations into Arabic.
  - **At-Risk Analytics:** Review AI-generated list of students falling below performance thresholds.
  - **Academic Oversight:** View master timetable conflicts and institutional exam reports.

### 4.3 Department Head (HOD) Portal
- **Dashboard View:** Departmental faculty count, course breakdown, student pass rate by subject.
- **Key Features:**
  - **Course Allocation:** Assign teachers to specific courses and subject sections.
  - **Subject Analytics:** Compare average test scores across classes.
  - **Department SOPs:** Maintain subject-specific teaching standards and rubrics.

### 4.4 Teacher & Faculty Portal
- **Dashboard View:** Today's class schedule, pending assignment reviews, recent attendance alerts.
- **Key Features:**
  - **Digital Attendance Register:** Record daily or subject-specific attendance with instant remarks.
  - **Assignment Hub:** Post homework assignments, attach resource files, and grade student submissions.
  - **Exam & Gradebook Engine:** Input exam scores and automatically compute letter grades and GPA points.

### 4.5 Student Portal
- **Dashboard View:** Personal class schedule, current overall GPA, attendance percentage, upcoming assignments.
- **Key Features:**
  - **EduSync AI Tutor:** Chat with Gemini-powered AI tutor for study help, quiz prep, and subject explanations.
  - **Assignment Portal:** Upload completed homework documents (PDFs, docs) before deadlines.
  - **Gradebook & Reports:** View transcript reports and semester GPA progress.

### 4.6 Parent & Guardian Portal
- **Dashboard View:** Ward's attendance summary, recent exam scores, pending fee invoices.
- **Key Features:**
  - **Ward Overview:** Switch between multiple wards if more than one child is enrolled.
  - **Fee Payment Portal:** Review itemized tuition fee invoices and generate PDF transaction receipts.
  - **Teacher Communication:** Receive instant notifications regarding ward attendance or academic warnings.

### 4.7 Accountant & Financial Portal
- **Dashboard View:** Total collected revenue (₹), pending fee dues, monthly collection graphs.
- **Key Features:**
  - **Fee Invoice Generator:** Issue tuition, hostel, and transport fee invoices to students/parents.
  - **Payment Ledger:** Record manual (cash/cheque) and digital payments.
  - **Receipt Vouchers:** Export official receipt vouchers with institution stamp and transaction reference.

---

## 5. Comprehensive Module Operational Manual

### Module 1: Student Information Management System (SIMS)
- **Overview:** Central database for all student profiles, personal details, admission history, and parent associations.
- **How to Use:**
  1. Navigate to **Students** section in the Admin or Principal sidebar.
  2. To admit a new student, click **Admit Student**, fill in mandatory details (Full Name, Roll Number, Class/Section, Parent Contact), and click **Submit**.
  3. Search students using the search bar by Name, Roll Number, or Class.
  4. Click on any student row to view their complete profile, linked guardian, and historical academic records.

### Module 2: Faculty Information Management System (FIMS)
- **Overview:** Manages teacher directory, qualifications, assigned department, subject specializations, and work schedules.
- **How to Use:**
  1. Go to **Teachers / Staff** in the Navigation Menu.
  2. Click **Add Faculty Member** to register new teaching staff.
  3. Assign the faculty member to a specific Department (e.g., Computer Science, Mathematics, Science).
  4. View active workloads and subject allocations for each teacher.

### Module 3: Academic Scheduling & Timetable Engine
- **Overview:** Generates conflict-free class schedules, subject periods, and classroom assignments.
- **How to Use:**
  1. Access **Timetable Engine** from HOD or Admin Portal.
  2. Select Class/Section and Day of the week.
  3. Assign Period Time Slot, Subject, Subject Teacher, and Room Number.
  4. The system validates entries against duplicate teacher or room assignments and highlights conflicts before saving.

### Module 4: Digital Attendance Register
- **Overview:** Allows teachers to record daily morning or subject-wise attendance with real-time sync to parent portals.
- **How to Use:**
  1. Teachers select **Attendance** from their menu.
  2. Pick the Class, Section, and Subject Period.
  3. The roster loads with toggle switches for **Present**, **Absent**, or **Late**.
  4. Add optional remarks for absent or late students (e.g., "Medical leave", "Unexcused delay").
  5. Click **Submit Attendance Register**. Absent alerts automatically trigger to parent accounts.

### Module 5: Examinations, Grading & GPA Calculator
- **Overview:** Tracks mid-term, final, and quiz marks with automated letter grade and GPA point conversion.
- **How to Use:**
  1. Navigate to **Exams & Grading**.
  2. Select Exam Term (e.g., "Mid-Term 2025") and Subject.
  3. Enter marks obtained for each student against maximum score.
  4. The system automatically computes percentage, Letter Grade (A+, A, B, C, F), and GPA Points (4.0 Scale).
  5. Click **Publish Grades** to make them visible on Student and Parent dashboards.

### Module 6: Assignments & Digital Submissions
- **Overview:** Facilitates paperless homework distribution, file uploads, and online grading.
- **How to Use:**
  1. **For Teachers:** Click **Create Assignment**, specify title, description, subject, submission deadline, and max score.
  2. **For Students:** Open **Assignments**, click on active task, attach file (PDF/DOCX), and click **Turn In**.
  3. **For Grading:** Teachers open submission inbox, view student files, enter score, and provide feedback remarks.

### Module 7: Finance, Tuition Fees & Invoicing (INR ₹)
- **Overview:** Handles tuition fee structures, installment invoices, online payments, and receipt vouchers in Indian Rupees (₹).
- **How to Use:**
  1. **Generate Invoice:** Accountant selects student, specifies fee components (Tuition, Transport, Hostel, Lab Fee), enters amount in ₹, and sets due date.
  2. **Payment Processing:** Parent/Accountant opens pending invoice, selects payment method (UPI, Net Banking, Credit Card, Cash), and clicks **Pay Fee**.
  3. **Receipt Voucher:** Click **Download Receipt** on any paid invoice to view and print an official transaction receipt.

### Module 8: EduSync AI Tutor & At-Risk Predictive Analytics
- **Overview:** Powered by Google Gemini 1.5 Flash, providing student AI study help and predictive academic failure alerts.
- **How to Use:**
  1. **AI Tutor:** Students click **EduSync AI Chat** on their portal, ask study questions, request code debugging, or prompt practice questions.
  2. **At-Risk Analytics:** Principals and Teachers view the **Academic Intelligence** tab. The system analyzes attendance trends, assignment scores, and exam marks to flag students with high risk of academic failure, providing actionable recommendations.

### Module 9: SOP Policy Guidelines & Arabic RTL Support
- **Overview:** Hub for institutional operating procedures with 1-click AI translation into Arabic and native Right-to-Left (RTL) reading layout.
- **How to Use:**
  1. Open **Policy & SOP Guidelines**.
  2. Browse standard operational guidelines (e.g., Examination Conduct Policy, Library Rules, Hostel Guidelines).
  3. Click **Translate to Arabic (العربية)**. Gemini AI generates translated content instantly.
  4. Toggle the **Language / RTL Switcher** in the navbar to switch the entire application interface to Arabic RTL mode (`dir="rtl"`).

### Module 10: Transport Fleet & Bus Route Engine
- **Overview:** Manages school bus routes, driver details, vehicle information, and pickup/drop-off point allocations.
- **How to Use:**
  1. Go to **Transport Management**.
  2. Add vehicles (Bus number, plate number, capacity, driver phone).
  3. Define Routes (Route Name, Start Point, End Point, Pickup Stops, Monthly Transport Fee in ₹).
  4. Assign enrolled students to specific routes for automated transport fee billing.

### Module 11: Hostel & Dormitory Accommodation System
- **Overview:** Oversees hostel buildings, room block allocations, room capacities, and monthly rent charges.
- **How to Use:**
  1. Open **Hostel Management**.
  2. Register Hostel Blocks (e.g., Boys Hostel A, Girls Hostel B) and specify total rooms.
  3. Configure Room Types (Single, Double, AC, Non-AC) and monthly rent in INR (₹).
  4. Allocate students to vacant room numbers and view occupancy rates.

### Module 12: Library Management System (LMS)
- **Overview:** Digital catalog for physical books, ISBN tracking, book issue/return tracking, and overdue fine tracking.
- **How to Use:**
  1. Navigate to **Library LMS**.
  2. **Add Book:** Enter Title, Author, ISBN Number, Category, and Available Quantity.
  3. **Issue Book:** Search student roll number, select book, and specify return due date.
  4. **Return Book:** Process returned books and calculate overdue fees if returned past due date.

---

## 6. Pricing Tiers & Subscription Management

EduSync AI offers flexible tier subscription models catered to different institutional sizes with native Indian Rupee (INR ₹) pricing:

| Plan Tier | Monthly Price | Target Institution | Included Capabilities |
| :--- | :---: | :--- | :--- |
| **Academy Starter** | **₹9,999** / mo | K-12 Private Schools, Coaching Academies | Up to 500 Students, SIMS, FIMS, Attendance, Exams, Invoicing |
| **Campus Enterprise** | **₹24,999** / mo | Colleges, High Schools, Multi-Branch | Unlimited Students, Gemini AI Tutor, At-Risk Analytics, Arabic RTL SOPs, Transport, Hostel, Library LMS |
| **District SaaS Network** | **₹49,999** / mo | University Networks, Education Boards | Multi-tenant isolation, Custom Domain, SSO/SAML, On-Premises Docker Deployment, SLA Support |

*Administrators can update pricing tier details directly through the Admin Dashboard under `/api/school/pricing`.*

---

## 7. Troubleshooting & Frequently Asked Questions (FAQ)

### Q1: What happens if the primary PostgreSQL database disconnects?
**Answer:** EduSync AI features an integrated **In-Memory Fallback Engine**. In the event of PostgreSQL database maintenance or connection drop, the system automatically switches to in-memory mode, ensuring continuous operational availability without crashing or showing error pages.

### Q2: How does the AI translation for SOP guidelines work?
**Answer:** The SOP module sends the guideline document to the Google Gemini 1.5 Flash API endpoint. If external API access is restricted, local fallback translation engines automatically deliver standard Arabic translations.

### Q3: How do parents download payment receipts?
**Answer:** Parents can log into the Parent Portal, navigate to **Fees & Payments**, select any invoice marked **PAID**, and click **Download Receipt**. A formatted PDF receipt with transaction ID and breakdown will be downloaded.

### Q4: Can teachers change grades after publishing them?
**Answer:** Grades can be updated by the subject teacher or Department Head (HOD) prior to final term lock. Any modification made after lock requires approval from the Principal account.

---

*EduSync AI System Manual — Confidential & Proprietary — EduSync AI Systems Inc.*
