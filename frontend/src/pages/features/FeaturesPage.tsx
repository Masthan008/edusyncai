import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/languageStore.js';
import { 
  GraduationCap, Users, BookOpen, Clock, CheckSquare, Award, 
  Landmark, Building, Cpu, ClipboardList, BarChart3, Bus, Home, BookCopy, Globe, ArrowRight
} from 'lucide-react';

export default function FeaturesPage() {
  const { language, toggleLanguage, t } = useLanguageStore();
  const [activeCategory, setActiveCategory] = useState<'academics' | 'operations' | 'intelligence' | 'finance'>('academics');

  const modules = [
    {
      category: 'academics',
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      title: 'Student Information System (SIMS)',
      desc: 'Complete student lifecycle management from admission to graduation with automated parent linkages and profile tracking.',
      highlights: ['Admission registration workflow', 'Section & Class assignment', 'Parent account connection', 'Student status tracking (Active, Suspended, Graduated)']
    },
    {
      category: 'academics',
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: 'Faculty Information Management (FIMS)',
      desc: 'Manage teaching staff profiles, department assignments, qualifications, and class workload schedules.',
      highlights: ['Department allocation', 'Head of Department (HOD) linking', 'Faculty contact directory', 'Workload tracking']
    },
    {
      category: 'academics',
      icon: <Clock className="h-6 w-6 text-emerald-600" />,
      title: 'Academic Timetable & Schedule Engine',
      desc: 'Conflict-free classroom schedule generator enforcing unique room, section, and teacher constraints.',
      highlights: ['Unique room slot validation', 'Teacher schedule grid', 'Classroom double-booking prevention', 'Interactive calendar view']
    },
    {
      category: 'academics',
      icon: <CheckSquare className="h-6 w-6 text-blue-600" />,
      title: 'Digital Attendance Register',
      desc: 'Multi-tier attendance recording for daily morning check-ins or subject-specific class periods.',
      highlights: ['Present, Absent, Late, Excused flags', 'Teacher remarks per student', 'Parent instant attendance alerts', 'Campus attendance percentage stats']
    },
    {
      category: 'academics',
      icon: <Award className="h-6 w-6 text-emerald-600" />,
      title: 'Exams, Grading & GPA Calculator',
      desc: 'Automated marks entry, grade point conversions, cumulative GPA calculations, and digital report card generation.',
      highlights: ['Automated letter grade scale (A+, A, B, C, F)', 'GPA grade point weighting', 'Class rank analysis', 'Report card export']
    },

    {
      category: 'finance',
      icon: <Landmark className="h-6 w-6 text-emerald-600" />,
      title: 'Tuition Fees & Invoice Ledger',
      desc: 'Multi-channel tuition billing, card payments logging, manual transaction entries, and receipt voucher generation.',
      highlights: ['Class fee structure templates', 'Multi-channel payment methods (Card, Cash, Bank, Cheque)', 'Official transaction receipt voucher', 'Accountant revenue ledger']
    },

    {
      category: 'operations',
      icon: <Bus className="h-6 w-6 text-emerald-600" />,
      title: 'Transport Fleet & Bus Route Engine',
      desc: 'Manage campus transport bus routes, passenger fare templates, vehicle registrations, and driver contact info.',
      highlights: ['Bus route & fare mapping', 'Vehicle registration details', 'Driver phone directory', 'Student bus assignment']
    },
    {
      category: 'operations',
      icon: <Home className="h-6 w-6 text-blue-600" />,
      title: 'Hostel & Dormitory Accommodation System',
      desc: 'Configure hostel buildings (Boys, Girls, Co-Ed), room allocations, bed capacity, and monthly room rent charges.',
      highlights: ['Hostel building directory', 'Room capacity & rent pricing', 'Unique room allocation', 'Residence occupancy tracking']
    },
    {
      category: 'operations',
      icon: <BookCopy className="h-6 w-6 text-emerald-600" />,
      title: 'Library Management System (LMS)',
      desc: 'Cataloging of library books with ISBN numbers, author tracking, available copy counts, book checkout issuing, and fine calculations.',
      highlights: ['ISBN barcode cataloging', 'Available copy deduction on checkout', 'Return date fine calculator', 'Student borrowing ledger']
    },

    {
      category: 'intelligence',
      icon: <Cpu className="h-6 w-6 text-emerald-600" />,
      title: 'Google Gemini 1.5 Flash AI Assistant',
      desc: 'Integrated generative artificial intelligence engine providing student AI tutoring, automated at-risk warnings, and report card summaries.',
      highlights: ['Student AI Chatbot tutor', 'Automated academic risk level diagnostic', 'Teacher report card summary generator', 'Smart fallback algorithms']
    },
    {
      category: 'intelligence',
      icon: <ClipboardList className="h-6 w-6 text-blue-600" />,
      title: 'Bilingual SOP Guidelines Hub (EN & AR)',
      desc: 'Institutional policy center for admissions, grading guidelines, safety procedures, and fee collection SOPs with 1-click AI translation.',
      highlights: ['Step-by-step operational workflows', '1-Click Gemini AI translation to Arabic', 'Dynamic RTL text realignment (`dir="rtl"`)', 'Role-specific step execution']
    },
    {
      category: 'intelligence',
      icon: <BarChart3 className="h-6 w-6 text-emerald-600" />,
      title: 'Executive Analytics & KPI Dashboards',
      desc: 'Real-time business intelligence for school leaders and administrators tracking active students, revenue, attendance ratios, and system activities.',
      highlights: ['Interactive Recharts visual graphs', 'Revenue trend analysis', 'Campus health counters', 'Multi-role portal views']
    }
  ];

  const filteredModules = modules.filter(m => m.category === activeCategory);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans relative overflow-hidden">
      {/* Dynamic Vibrant Liquid Glass Backdrops */}
      <div className="fixed top-[-15%] left-[-15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-400/40 via-teal-300/35 to-blue-500/40 blur-[70px] animate-blob-1 pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-15%] w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-blue-500/40 via-indigo-400/35 to-emerald-400/40 blur-[80px] animate-blob-2 pointer-events-none z-0" />
      <div className="fixed top-[30%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-teal-300/30 via-emerald-400/30 to-sky-400/30 blur-[90px] animate-blob-1 pointer-events-none z-0" />

      {/* Header */}
      <header className="h-20 glass-panel sticky top-0 z-50 px-6 shadow-sm border-b border-white/80">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="h-6 w-6 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t('app_title')}</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-600 hover:text-emerald-700 font-bold text-sm transition hidden sm:block">Home</Link>
            <Link to="/about" className="text-slate-600 hover:text-emerald-700 font-bold text-sm transition hidden sm:block">About Us</Link>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition shadow-xs"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>{language === 'en' ? 'العربية 🇸🇦' : 'English 🇬🇧'}</span>
            </button>
            <Link to="/login" className="btn-emerald-blue font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-md">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 z-10 space-y-16 py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Complete Enterprise <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">ERP Modules</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg">
            Explore the 15 enterprise modules built natively inside EduSync AI to streamline academic workflows, financial ledgers, transport fleet, and campus intelligence.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory('academics')}
            className={`px-6 py-3 rounded-full text-xs font-bold transition shadow-xs ${
              activeCategory === 'academics' 
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🎓 Academic Modules (5)
          </button>
          <button
            onClick={() => setActiveCategory('finance')}
            className={`px-6 py-3 rounded-full text-xs font-bold transition shadow-xs ${
              activeCategory === 'finance' 
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            💳 Finance & Dues (1)
          </button>
          <button
            onClick={() => setActiveCategory('operations')}
            className={`px-6 py-3 rounded-full text-xs font-bold transition shadow-xs ${
              activeCategory === 'operations' 
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🚌 Campus Operations (3)
          </button>
          <button
            onClick={() => setActiveCategory('intelligence')}
            className={`px-6 py-3 rounded-full text-xs font-bold transition shadow-xs ${
              activeCategory === 'intelligence' 
                ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            🤖 AI Intelligence & Analytics (3)
          </button>
        </div>

        {/* Modules Display Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredModules.map((m, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit">
                  {m.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{m.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{m.desc}</p>
                <div className="pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Functionalities</h4>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {m.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link to="/register" className="text-emerald-700 font-bold text-xs flex items-center gap-1 hover:gap-2 transition">
                  Deploy Module into Your Portal <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6 text-slate-600 text-sm z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-xs">
                <GraduationCap className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <span className="text-slate-900 font-bold tracking-tight text-lg">EduSync AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Enterprise educational resource planning software powering modern K-12 schools and university systems globally.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-emerald-700">All Modules Showcase</Link></li>
              <li><Link to="/about" className="hover:text-emerald-700">About EduSync AI</Link></li>
              <li><Link to="/login" className="hover:text-emerald-700">Sign In to Portal</Link></li>
              <li><Link to="/register" className="hover:text-emerald-700">Deploy New Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Architecture & AI</h4>
            <ul className="space-y-2 text-xs">
              <li><span className="text-slate-600">Google Gemini 1.5 Flash</span></li>
              <li><span className="text-slate-600">PostgreSQL 15 High Availability</span></li>
              <li><span className="text-slate-600">Bilingual English/Arabic RTL</span></li>
              <li><span className="text-slate-600">Zero Downtime In-Memory Fallback</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Contact Support</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>Email: support@edusync.com</li>
              <li>Toll-Free: +1 (800) 555-EDUSYNC</li>
              <li>Available 24/7 for Enterprise SLA Customers</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-slate-200 text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} EduSync AI Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
