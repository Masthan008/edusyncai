import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/languageStore.js';
import { 
  GraduationCap, ShieldCheck, Cpu, Globe, Award, Users, 
  Sparkles, CheckCircle2, Mail, Phone, MapPin, ArrowRight, Building, BookOpen
} from 'lucide-react';

export default function AboutPage() {
  const { language, toggleLanguage, t } = useLanguageStore();
  const [contactForm, setContactForm] = useState({ name: '', email: '', school: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setContactForm({ name: '', email: '', school: '', message: '' });
    }, 4000);
  };

  const leaders = [
    { name: 'Dr. Marcus Vance', role: 'Chief Executive Officer & Co-Founder', bg: 'Ex-MIT EdTech Fellow with 15+ years in academic administration.' },
    { name: 'Elena Rostova', role: 'Head of AI & Machine Learning', bg: 'Pioneer in LLM integration and student performance diagnostics.' },
    { name: 'Tariq Al-Mansoor', role: 'VP of Middle East & Global Expansion', bg: 'Specialist in bilingual education systems and GCC accreditation.' }
  ];

  const milestones = [
    { year: '2023', title: 'Platform Foundation', desc: 'Conceived to eliminate legacy educational software fragmentation with modern high-speed architecture.' },
    { year: '2024', title: 'PostgreSQL + Dual-Engine Engine', desc: 'Introduced high-availability zero-downtime database fallback stores.' },
    { year: '2025', title: 'Google Gemini AI Integration', desc: 'Integrated AI tutors, automated at-risk prediction, and 1-click bilingual SOP translation.' },
    { year: '2026', title: 'Full Enterprise Rollout', desc: 'Serving 250+ academies, colleges, and university campuses across North America & EMEA.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* Liquid Glass Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-300/35 to-teal-200/35 blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-300/35 to-indigo-200/35 blur-[100px] animate-blob animation-delay-2000 pointer-events-none z-0" />

      {/* Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="h-6 w-6 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t('app_title')}</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/" className="text-slate-600 hover:text-emerald-700 font-bold text-sm transition hidden sm:block">Home</Link>
            <Link to="/features" className="text-slate-600 hover:text-emerald-700 font-bold text-sm transition hidden sm:block">Features</Link>
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

      {/* Main Content */}
      <main className="flex-1 z-10 space-y-24 py-16 px-6 max-w-7xl mx-auto">
        {/* Banner */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            <span>Empowering Educational Leadership Through Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            About <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">EduSync AI</span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed">
            EduSync AI was engineered to bridge the gap between complex school administration and intuitive modern software design. We empower K-12 schools, vocational academies, and university networks with real-time predictive insights, zero-downtime execution, and bilingual operational excellence.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit">
              <Cpu className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI Predictive Intelligence</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Powered by Google Gemini 1.5 Flash, our platform automatically identifies at-risk students, provides personal AI tutoring, and generates instant report card summaries for teachers.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl w-fit">
              <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Dual High-Availability Architecture</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Combines enterprise PostgreSQL database tables with an automatic In-Memory Fallback Engine. Campus operations never stop even during database maintenance window.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md transition space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit">
              <Globe className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Native Bilingual & RTL Support</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Full English and Arabic translation dictionaries with dynamic RTL layout switching (`dir="rtl"`) and 1-click AI translation for institutional SOP policy guidelines.
            </p>
          </div>
        </div>

        {/* Milestones / Story */}
        <div className="bg-white/80 border border-slate-200 p-10 rounded-3xl space-y-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Our Growth Journey</h2>
            <p className="text-slate-500 text-sm">Key engineering milestones in building the ultimate educational ERP.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((m, i) => (
              <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-black text-emerald-700 uppercase tracking-widest px-2.5 py-1 bg-emerald-100 rounded-md inline-block">{m.year}</span>
                <h4 className="font-bold text-slate-900">{m.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Leadership Team</h2>
            <p className="text-slate-500 text-sm">Guided by veterans in software engineering, education technology, and artificial intelligence.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {leaders.map((l, idx) => (
              <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs space-y-3">
                <div className="h-12 w-12 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-white text-lg">
                  {l.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{l.name}</h3>
                  <span className="text-xs text-emerald-700 font-semibold block">{l.role}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{l.bg}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Contact / Inquiry Form */}
        <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-blue-950 text-white p-10 md:p-16 rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-bold text-emerald-300">
              <span>Get In Touch</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to transform your school operations?</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Schedule a personalized demonstration with our systems architects. Learn how EduSync AI can be customized for your school board or university network.
            </p>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-center gap-3"><Mail className="h-4 w-4 text-emerald-400" /> enterprise@edusync.com</div>
              <div className="flex items-center gap-3"><Phone className="h-4 w-4 text-emerald-400" /> +1 (800) 555-EDUSYNC</div>
              <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-emerald-400" /> Innovation Tower, Boston, MA & Dubai Internet City, UAE</div>
            </div>
          </div>

          <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Request Institution Consultation</h3>
            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900">Inquiry Received!</h4>
                <p className="text-xs text-emerald-700">Thank you. Our campus deployment team will contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="Dr. Sarah Jenkins"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="s.jenkins@academy.edu"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.school}
                    onChange={(e) => setContactForm({ ...contactForm, school: e.target.value })}
                    placeholder="St. Jude Academy"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Message / Requirements</label>
                  <textarea
                    rows={3}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Tell us about student count and migration goals..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 outline-none"
                  />
                </div>
                <button type="submit" className="w-full btn-emerald-blue font-bold py-3 rounded-xl shadow-md text-sm">
                  Send Consultation Request
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Enterprise Footer with Quick Links */}
      <footer className="bg-white border-t border-slate-200 py-16 px-6 text-slate-600 text-sm z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-xs">
                <GraduationCap className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <span className="text-slate-900 font-bold tracking-tight text-lg">EduSync AI</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              The next-generation Educational Resource Planning (ERP) platform unifying student profiles, grades, tuition fees, transport, hostels, and library circulation.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Product Modules</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-emerald-700">Student Directory (SIMS)</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Faculty Management (FIMS)</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Timetable Scheduling</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Attendance Register</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Tuition Dues & Receipts</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Transport Fleet Engine</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Hostel & Room Booking</Link></li>
              <li><Link to="/features" className="hover:text-emerald-700">Library LMS</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-emerald-700">About EduSync AI</Link></li>
              <li><Link to="/about" className="hover:text-emerald-700">Leadership Team</Link></li>
              <li><Link to="/about" className="hover:text-emerald-700">Growth Milestones</Link></li>
              <li><Link to="/about" className="hover:text-emerald-700">Contact Sales</Link></li>
              <li><a href="#" className="hover:text-emerald-700">Careers (We are hiring!)</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Resources & Legal</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-emerald-700">PRD Technical Master</a></li>
              <li><a href="#" className="hover:text-emerald-700">API Documentation</a></li>
              <li><a href="#" className="hover:text-emerald-700">System Health Status</a></li>
              <li><a href="#" className="hover:text-emerald-700">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-emerald-700">FERPA & GDPR Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-10 mt-10 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>&copy; {new Date().getFullYear()} EduSync AI Systems Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-emerald-700">Terms of Service</a>
            <a href="#" className="hover:text-emerald-700">Cookie Settings</a>
            <a href="#" className="hover:text-emerald-700">Security SLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
