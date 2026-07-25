import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../../store/languageStore.js';
import { 
  GraduationCap, Shield, Users, BarChart3, Clock, Landmark, 
  ArrowRight, BookOpen, School, Sparkles, MessageSquare, Check, HelpCircle, Rocket, Globe
} from 'lucide-react';

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annually'>('annually');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { language, toggleLanguage, t } = useLanguageStore();
  const navigate = useNavigate();

  const stats = [
    { value: '250+', label: language === 'ar' ? 'مؤسسة تعليمية مسجلة' : 'Schools enrolled' },
    { value: '1.2M+', label: language === 'ar' ? 'طالب ونشاط يومي' : 'Daily active students' },
    { value: '99.9%', label: language === 'ar' ? 'نسبة الجاهزية والتشغيل' : 'Platform uptime' },
    { value: '4.8★', label: language === 'ar' ? 'تقييم المستخدمين' : 'Average App Store rating' }
  ];

  const features = [
    {
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      title: language === 'ar' ? 'إدارة القبول والطلاب' : 'Admissions & Students Profiles',
      desc: language === 'ar' ? 'مسارات تسجيل تفاعلية، وخزائن وثائق رقمية، وربط تلقائي لأولياء الأمور.' : 'Interactive enrollment pipelines, smart document vaults, and parent contact linkages.'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: language === 'ar' ? 'الجدول المدرسي والمحاضرات' : 'Schedules & Calendars',
      desc: language === 'ar' ? 'خوارزميات جدولة تلقائية خالية من التعارض للمواد والمعلمين والقاعات.' : 'Conflict-free automatic scheduling algorithms. Instantly assign subjects, teachers, and rooms.'
    },
    {
      icon: <School className="h-6 w-6 text-emerald-600" />,
      title: language === 'ar' ? 'بوابات الإدارة والمتعلمين' : 'Multi-Role Portals',
      desc: language === 'ar' ? 'واجهات مخصصة للمدير، رؤساء الأقسام، المعلمين، الطلاب، وأولياء الأمور.' : 'Tailored dashboard layouts for Admins, Principals, HODs, Teachers, Students, Parents, and Accountants.'
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: language === 'ar' ? 'تحليلات الأداء والشهادات' : 'Academic Performance Insights',
      desc: language === 'ar' ? 'حساب تلقائي للمعدل التراكمي GPA، ورسوم بيانية للتقدم، وشهادات رقمية.' : 'Automatic letter grade conversions, GPA calculations, progress charts, and digital report cards.'
    },
    {
      icon: <Landmark className="h-6 w-6 text-emerald-600" />,
      title: language === 'ar' ? 'الفواتير والرسوم المالي' : 'Invoices & Payments Ledger',
      desc: language === 'ar' ? 'تذكيرات بالمتأخرات، تتبع المدفوعات، وإصدار إيصالات السداد الرسمية.' : 'Outstanding dues notifications, card payments tracking, manual transaction entries, and receipts.'
    },
    {
      icon: <Sparkles className="h-6 w-6 text-blue-600" />,
      title: language === 'ar' ? 'معلم الذكاء الاصطناعي' : 'AI-Ready Core Architecture',
      desc: language === 'ar' ? 'مساعد ذكي للإجابة عن أسئلة الواجبات وتحليل المخاطر الترجمة الفورية.' : 'Context-aware chatbot assistant answers homework questions, monitors risk trends, and provides parent insights.'
    }
  ];

  const workflowSteps = [
    { num: '01', title: language === 'ar' ? 'القبول والتوزيع' : 'Admit & Allocate', desc: language === 'ar' ? 'تسجيل الطلاب، ربط أولياء الأمور، وتوزيع الفصول والصفوف.' : 'Register students, link parents, and allocate to designated grade sections.' },
    { num: '02', title: language === 'ar' ? 'الجدولة والحضور' : 'Schedule & Register', desc: language === 'ar' ? 'إنشاء جداول الحصص ورصد الحضور والغياب اليومي.' : 'Create timetable schedules. Subject rosters log attendance daily.' },
    { num: '03', title: language === 'ar' ? 'التعليم والتسليم' : 'Teach & Review', desc: language === 'ar' ? 'نشر الواجبات والمهام وتلقي ملفات الحلول رقمياً.' : 'Post homework assignments. Students submit PDFs directly into the portal.' },
    { num: '04', title: language === 'ar' ? 'الدرجات والشهادات' : 'Grade & Transcribe', desc: language === 'ar' ? 'تصحيح الاختبارات ورصد الدرجات وإصدار الشهادات.' : 'Grade submissions, compile test scores, and automatically export PDF report cards.' }
  ];

  const pricingTiers = [
    {
      name: 'Academy Starter',
      price: billingPeriod === 'annually' ? '$149' : '$189',
      period: '/month',
      desc: 'Perfect for small private K-12 schools & specialized tutoring centers.',
      features: ['Up to 500 Active Students', 'Standard Attendance & Grading', 'Parent & Student Portals', 'PostgreSQL Database Cloud'],
      popular: false
    },
    {
      name: 'Campus Enterprise',
      price: billingPeriod === 'annually' ? '$399' : '$499',
      period: '/month',
      desc: 'Ideal for colleges, multi-branch academies, and growing high school networks.',
      features: ['Unlimited Student Accounts', 'Gemini AI Assistant & At-Risk Diagnostic', 'Bilingual English/Arabic RTL SOP Hub', 'Tuition Ledger & Electronic Receipts', '24/7 Dedicated Support SLA'],
      popular: true
    },
    {
      name: 'District SaaS Network',
      price: 'Custom Tier',
      period: '',
      desc: 'Dedicated enterprise infrastructure for regional educational boards.',
      features: ['Multi-Campus Data Partitioning', 'Custom Subdomains & Custom SSO', 'On-Premises Docker Deployment', 'Full Source Code License Option'],
      popular: false
    }
  ];

  const faqs = [
    {
      q: "Does EduSync AI run if PostgreSQL is temporarily disconnected?",
      a: "Yes! EduSync AI features an automatic In-Memory Fallback Engine. If PostgreSQL drops or is undergoing maintenance, all portal logins and read queries continue uninterrupted."
    },
    {
      q: "Is Arabic language and RTL fully supported?",
      a: "Absolutely. EduSync AI includes full native English and Arabic translation dictionaries, dynamic RTL layout switching, and one-click AI translation for institutional SOP guidelines."
    },
    {
      q: "Can parents view live attendance and pay tuition fees?",
      a: "Yes. The Parent Portal provides live attendance alerts, performance trends, fee statements, and digital payment receipts."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* Liquid Glass Background Blobs - Green & Blue */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-300/35 to-teal-200/35 blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-300/35 to-indigo-200/35 blur-[100px] animate-blob animation-delay-2000 pointer-events-none z-0" />
      <div className="absolute top-[35%] left-[25%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-emerald-200/25 to-blue-200/30 blur-[90px] animate-blob animation-delay-4000 pointer-events-none z-0" />

      {/* Navigation Header */}
      <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 px-6 shadow-xs">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="h-6 w-6 text-white stroke-[2.5]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t('app_title')}</span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Global Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition shadow-xs"
            >
              <Globe className="h-4 w-4 text-emerald-600" />
              <span>{language === 'en' ? 'العربية 🇸🇦' : 'English 🇬🇧'}</span>
            </button>

            <Link to="/login" className="text-slate-600 hover:text-emerald-700 font-bold text-sm transition hidden sm:block">
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>

            <Link to="/register" className="btn-emerald-blue font-bold text-sm px-5 py-2.5 rounded-xl transition shadow-md">
              {language === 'ar' ? 'إنشاء حساب' : 'Deploy Portal'}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative px-6 pt-20 pb-24 md:pt-32 md:pb-32 text-center max-w-5xl mx-auto space-y-8 z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-xs">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>{language === 'ar' ? 'جيل جديد من أنظمة إدارة المدارس بالذكاء الاصطناعي' : 'Next-Gen School & College Operating System'}</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {language === 'ar' ? (
            <>إدارة المدارس والجامعات <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">بالذكاء الاصطناعي</span></>
          ) : (
            <>Synchronize Your Campus with <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">AI Intelligence</span></>
          )}
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          {language === 'ar' 
            ? 'منظومة متكاملة تجمع بين إدارة الطلاب، الحضور، الدرجات، الرسوم الدراسية، حافلات النقل، السكن الطلابي، والمكتبة في واجهة زجاجية ذكية.'
            : 'Unify admissions, faculty workloads, digital attendance, GPAs, tuition fees, transport fleet, hostels, and library circulation under a high-contrast Liquid Glass layout.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link to="/register" className="btn-emerald-blue font-bold px-8 py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg text-base w-full sm:w-auto">
            {language === 'ar' ? 'ابدأ الآن مجاناً' : 'Get Started Instantly'} <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/login" className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold px-8 py-4 rounded-xl transition shadow-xs w-full sm:w-auto">
            {language === 'ar' ? 'تسجيل الدخول للنظام' : 'Access Demo Portal'}
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-200/80">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/80 border border-slate-200 p-6 rounded-2xl shadow-xs">
              <span className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent block mb-1">{s.value}</span>
              <span className="text-xs text-slate-500 font-semibold">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20 bg-white/60 border-y border-slate-200 relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              {language === 'ar' ? 'مميزات المنظومة المتكاملة' : 'Enterprise Modules & Capabilities'}
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              {language === 'ar' ? 'كل ما تحتاجه إدارتك التعليمية في منصة واحدة موحدة.' : 'Everything your educational institution needs to run smoothly.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition duration-300 space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl w-fit">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-24 max-w-6xl mx-auto relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900">
            {language === 'ar' ? 'خطط الاشتراك والأسعار' : 'Transparent Enterprise Pricing'}
          </h2>
          <p className="text-slate-600">Choose the right tier for your institution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingTiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`rounded-3xl p-8 transition-all flex flex-col justify-between relative ${
                tier.popular 
                  ? 'bg-white border-2 border-emerald-500 shadow-xl scale-105' 
                  : 'bg-white/80 border border-slate-200 shadow-sm'
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-full shadow-md">
                  Most Popular
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{tier.name}</h3>
                  <p className="text-slate-500 text-xs mt-1 leading-relaxed">{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{tier.price}</span>
                  <span className="text-slate-500 text-sm">{tier.period}</span>
                </div>

                <ul className="space-y-3 text-xs text-slate-600 pt-4 border-t border-slate-200">
                  {tier.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2.5">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link 
                  to="/register" 
                  className={`w-full py-3 px-4 rounded-xl font-bold text-center block text-sm transition ${
                    tier.popular 
                      ? 'btn-emerald-blue shadow-md' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                  }`}
                >
                  Create Portal Account
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="bg-white/80 py-20 px-6 border-t border-slate-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">FAQ</h2>
            <p className="text-slate-500 text-sm">Common questions about the EduSync AI platform architecture.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition cursor-pointer shadow-xs hover:border-emerald-300"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              >
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                    <h3 className="font-semibold text-slate-900 text-base md:text-lg">{faq.q}</h3>
                  </div>
                  <span className={`text-slate-400 transition-transform ${activeFaq === idx ? 'rotate-180 text-emerald-600' : ''}`}>▼</span>
                </div>
                {activeFaq === idx && (
                  <div className="px-6 pb-6 pt-2 text-slate-600 border-t border-slate-100 text-sm leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12 px-6 text-slate-500 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-xs">
              <GraduationCap className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-slate-900 font-bold tracking-tight text-base">EduSync AI</span>
          </div>
          <p className="text-xs text-slate-500">&copy; {new Date().getFullYear()} EduSync AI Inc. All rights reserved. Premium Modern Light ERP Ecosystem.</p>
          <div className="flex gap-6 text-slate-600 font-medium text-xs">
            <a href="#" className="hover:text-emerald-600 transition">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-600 transition">Terms of Service</a>
            <a href="#" className="hover:text-emerald-600 transition">SaaS SLA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
