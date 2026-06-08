import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Shield, Users, BarChart3, Clock, Landmark, 
  ArrowRight, BookOpen, School, Sparkles, MessageSquare, Check, HelpCircle
} from 'lucide-react';

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const stats = [
    { value: '250+', label: 'Schools enrolled' },
    { value: '1.2M+', label: 'Daily active students' },
    { value: '99.9%', label: 'Platform uptime' },
    { value: '4.8★', label: 'Average App Store rating' }
  ];

  const features = [
    {
      icon: <Users className="h-6 w-6 text-cyan-500" />,
      title: "Admissions & Students Profiles",
      desc: "Interactive enrollment pipelines, smart document vaults, and parent contact linkages."
    },
    {
      icon: <Clock className="h-6 w-6 text-cyan-500" />,
      title: "Schedules & Calendars",
      desc: "Conflict-free automatic scheduling algorithms. Instantly assign subjects, teachers, and rooms."
    },
    {
      icon: <School className="h-6 w-6 text-cyan-500" />,
      title: "Multi-Role Portals",
      desc: "Tailored dashboard layouts for Admins, Principals, HODs, Teachers, Students, Parents, and Accountants."
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-cyan-500" />,
      title: "Academic Performance Insights",
      desc: "Automatic letter grade conversions, GPA calculations, progress charts, and digital report cards."
    },
    {
      icon: <Landmark className="h-6 w-6 text-cyan-500" />,
      title: "Invoices & Payments Ledger",
      desc: "Outstanding dues notifications, card payments tracking, manual transaction entries, and receipts."
    },
    {
      icon: <Sparkles className="h-6 w-6 text-cyan-500" />,
      title: "AI-Ready Core Architecture",
      desc: "Context-aware chatbot assistant answers homework questions, monitors risk trends, and provides parent insights."
    }
  ];

  const workflowSteps = [
    { num: '01', title: 'Admit & Allocate', desc: 'Register students, link parents, and allocate to designated grade sections.' },
    { num: '02', title: 'Schedule & Register', desc: 'Create timetable schedules. Subject rosters log attendance daily.' },
    { num: '03', title: 'Teach & Review', desc: 'Post homework assignments. Students submit PDFs directly into the portal.' },
    { num: '04', title: 'Grade & Transcribe', desc: 'Grade submissions, compile test scores, and automatically export PDF report cards.' }
  ];

  const pricingTiers = [
    {
      name: "Starter School",
      price: billingPeriod === 'annually' ? 120 : 150,
      desc: "Perfect for tutoring centers and small primary academies.",
      features: [
        "Up to 200 student seats",
        "Standard Admin & Teacher accounts",
        "Timetable & Calendar schedules",
        "Basic attendance tracking",
        "Standard email support"
      ],
      popular: false
    },
    {
      name: "Enterprise Campus",
      price: billingPeriod === 'annually' ? 290 : 350,
      desc: "Our most popular package for growing secondary colleges.",
      features: [
        "Unlimited student profiles",
        "All 7 specialized dashboard roles",
        "Gradebook sheets & GPAs calculator",
        "Fee structures & invoice billing",
        "AI Assistant & Student Risk warnings",
        "24/7 Priority support"
      ],
      popular: true
    },
    {
      name: "Global University",
      price: "Custom",
      desc: "Tailored to complex multi-campus college environments.",
      features: [
        "Dedicated cloud database instance",
        "Multi-Institution consolidation",
        "Custom API & webhook access",
        "Twilio SMS & WhatsApp notifications integration",
        "Dedicated account manager",
        "On-prem database bridge sync"
      ],
      popular: false
    }
  ];

  const faqs = [
    {
      q: "How does the AI Assistant fetch context?",
      a: "The assistant queries student attendance histories, recent assignment grades, and upcoming timetables directly from the normalized PostgreSQL database, providing relevant academic recommendations."
    },
    {
      q: "Can parents view outstanding dues?",
      a: "Yes. The Parent Portal aggregates linked child accounts, showing payment logs, outstanding invoices, due dates, and online card checkout utilities."
    },
    {
      q: "Does the system check for scheduling conflicts?",
      a: "Absolutely. The timetable slot generator performs structural database query checks to prevent double-booking teachers or rooms during overlap times."
    },
    {
      q: "Can we integrate with third-party messaging services?",
      a: "Yes. Our enterprise plans support easy plug-in upgrades to Twilio, Firebase Cloud Messaging (FCM), and WhatsApp APIs for instant alert broadcasts."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans overflow-x-hidden">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <GraduationCap className="h-6 w-6 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-transparent">EduSync AI</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition">Sign In</Link>
          <Link to="/login" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-1 shadow-lg shadow-cyan-500/10">
            Deploy Portal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-40 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[350px] w-[350px] md:h-[500px] md:w-[500px] bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-cyan-400 font-semibold mb-6 uppercase tracking-wider">
          <Sparkles className="h-3.5 w-3.5" /> Next-Generation College ERP
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-5xl mb-6">
          The Premium digital ecosystem for <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Modern Education</span>
        </h1>

        <p className="text-slate-400 text-lg md:text-xl max-w-3xl mb-10 leading-relaxed">
          Manage students, schedules, teachers, grade sheets, invoices, and parents through a unified visual control center. Built for modern schools, colleges, and university centers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full justify-center px-4 max-w-md">
          <Link to="/login" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 text-base">
            Start ERP Portal <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#features" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 text-base">
            Explore Features
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="w-full max-w-5xl bg-slate-800/50 border border-slate-700/60 p-3 rounded-2xl shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent -bottom-2 pointer-events-none" />
          <div className="bg-slate-950 rounded-xl overflow-hidden shadow-inner flex flex-col h-[380px] md:h-[500px]">
            {/* Mock Dashboard Topbar */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 ml-2 font-mono">edusync-dashboard-v1.0</span>
              </div>
              <div className="h-5 w-40 bg-slate-800 rounded" />
            </div>
            {/* Mock Dashboard Body */}
            <div className="flex flex-1">
              {/* Mock Sidebar */}
              <div className="w-48 bg-slate-900/60 border-r border-slate-800 p-4 space-y-3 hidden md:block">
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                <div className="h-4 w-5/6 bg-cyan-950 border border-cyan-800/40 rounded" />
                <div className="h-4 w-2/3 bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-800 rounded" />
                <div className="h-4 w-1/2 bg-slate-800 rounded" />
              </div>
              {/* Mock Content */}
              <div className="flex-1 p-6 space-y-6 overflow-hidden text-left">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="h-6 w-36 bg-slate-800 rounded" />
                    <div className="h-3.5 w-52 bg-slate-800 rounded" />
                  </div>
                  <div className="h-9 w-28 bg-cyan-950 border border-cyan-800 rounded-lg" />
                </div>
                {/* Stats cards mock */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                    <div className="h-7 w-24 bg-slate-700 rounded" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                    <div className="h-7 w-24 bg-slate-700 rounded" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
                    <div className="h-3 w-16 bg-slate-800 rounded" />
                    <div className="h-7 w-24 bg-slate-700 rounded" />
                  </div>
                </div>
                {/* Data table mock */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 flex-1">
                  <div className="h-4 w-full bg-slate-800 rounded" />
                  <div className="h-4 w-5/6 bg-slate-800 rounded" />
                  <div className="h-4 w-4/6 bg-slate-800 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Institution Statistics Banner */}
      <section className="bg-slate-950 border-y border-slate-800 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="text-3xl md:text-5xl font-black text-cyan-400">{stat.value}</div>
              <div className="text-slate-400 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Everything your campus needs in one place
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            Say goodbye to cluttered outdated databases. EduSync AI synchronizes your classrooms, marks, and finance offices dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-slate-800/40 border border-slate-800/80 p-8 rounded-2xl hover:border-cyan-500/30 transition duration-300 flex flex-col gap-4">
              <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center border border-slate-800 shadow-md">
                {feat.icon}
              </div>
              <h3 className="text-xl font-bold">{feat.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Workflow */}
      <section className="bg-slate-950/50 py-24 px-6 border-y border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Academic Workflow Engine</h2>
            <p className="text-slate-400">Our relational architecture synchronizes every step of your institution lifecycle automatically.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="relative bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
                <span className="text-5xl font-black text-slate-800 absolute right-4 top-2 select-none">{step.num}</span>
                <h3 className="text-lg font-bold z-10">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed z-10">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Simple, predictable pricing</h2>
          <p className="text-slate-400 mb-8">All features included, billed yearly for school savings.</p>
          
          <div className="inline-flex items-center gap-2 bg-slate-850 border border-slate-800 p-1.5 rounded-xl">
            <button 
              onClick={() => setBillingPeriod('monthly')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${billingPeriod === 'monthly' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Billed Monthly
            </button>
            <button 
              onClick={() => setBillingPeriod('annually')} 
              className={`px-4 py-2 rounded-lg text-xs font-bold transition ${billingPeriod === 'annually' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'}`}
            >
              Billed Annually (Save 20%)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`bg-slate-800/40 border p-8 rounded-3xl flex flex-col justify-between relative ${tier.popular ? 'border-cyan-500 shadow-xl shadow-cyan-500/5' : 'border-slate-800'}`}
            >
              {tier.popular && (
                <span className="absolute top-0 right-8 -translate-y-1/2 bg-cyan-500 text-slate-950 font-extrabold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
                  Recommended
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-200">{tier.name}</h3>
                  <p className="text-slate-400 text-xs mt-2">{tier.desc}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">
                    {typeof tier.price === 'number' ? `$${tier.price}` : tier.price}
                  </span>
                  {typeof tier.price === 'number' && (
                    <span className="text-slate-500 text-sm">/month</span>
                  )}
                </div>
                <hr className="border-slate-800" />
                <ul className="space-y-4">
                  {tier.features.map((f, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-cyan-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Link 
                  to="/login" 
                  className={`w-full py-3 px-4 rounded-xl font-bold text-center block text-sm transition ${tier.popular ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 'bg-slate-900 hover:bg-slate-800 border border-slate-700'}`}
                >
                  Launch Live Portal
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-slate-950/50 py-24 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">FAQ</h2>
            <p className="text-slate-400">Common questions about the EduSync AI platform architecture.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition cursor-pointer"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-cyan-400 shrink-0" />
                    <h3 className="font-semibold text-base md:text-lg">{faq.q}</h3>
                  </div>
                  <span className={`text-slate-500 transition-transform ${activeFaq === idx ? 'rotate-180' : ''}`}>▼</span>
                </div>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 pt-2 text-slate-400 border-t border-slate-800/40 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call To Action / Contact */}
      <section className="relative px-6 py-24 md:py-32 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight">Ready to synchronize your campus?</h2>
          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Register your institution details to receive immediate portal deployment tokens. Switch your registrar off spreadsheet files today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/login" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl transition flex items-center gap-2 shadow-lg shadow-cyan-500/20 text-base w-full sm:w-auto">
              Launch Portal Demo <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="mailto:support@edusync.com" className="bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white font-semibold px-8 py-4 rounded-xl transition w-full sm:w-auto">
              Contact Support
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="text-slate-200 font-bold tracking-tight">EduSync AI</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} EduSync AI Inc. All rights reserved. Premium Modern ERP ecosystem.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition">SaaS SLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
