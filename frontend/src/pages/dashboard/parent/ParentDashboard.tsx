import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import { useAuthStore } from '../../../store/authStore.js';
import {
  Users, CheckSquare, Award, Landmark, CreditCard, Check,
  AlertTriangle, Sparkles, Loader2, RefreshCw, ClipboardList
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

/* ── Interfaces ─────────────────────────────────────────────────────── */

interface ChildProfile {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
  section_name: string;
  roll_number: string;
  admission_number: string;
}

interface AttendanceSummary {
  summary: {
    attendanceRate: number;
    total: number;
    present: number;
    absent: number;
  };
}

interface GradeItem {
  subject_code: string;
  marks_obtained: string | number;
}

interface ReportCard {
  grades: GradeItem[];
}

interface Invoice {
  id: string;
  name: string;
  due_date: string;
  amount: number;
  balance: number;
  status: string;
}

interface Transaction {
  id: string;
  transaction_reference: string;
  payment_date: string;
  payment_method: string;
  amount_paid: string;
  fee_name?: string;
}

interface BillingInfo {
  invoices: Invoice[];
  history: Transaction[];
}

interface AiInsights {
  trend: string;
  riskLevel: string;
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function ParentDashboard() {
  const location = useLocation();
  const { profile } = useAuthStore();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');

  const [childProfile, setChildProfile] = useState<ChildProfile | null>(null);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [billing, setBilling] = useState<BillingInfo>({ invoices: [], history: [] });
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ── Init children from profile ───────────────────────────────────── */

  useEffect(() => {
    if (profile?.children && profile.children.length > 0) {
      setChildren(profile.children as ChildProfile[]);
      setSelectedChildId(profile.children[0].id);
    }
  }, [profile]);

  /* ── Fetch child data with AbortController ────────────────────────── */

  useEffect(() => {
    if (!selectedChildId) return;

    const controller = new AbortController();
    const { signal } = controller;

    const fetchData = async () => {
      try {
        const profRes = await api.get(`/students/${selectedChildId}`, { signal });
        setChildProfile(profRes.data.data);

        const attRes = await api.get(`/attendance/student/${selectedChildId}`, { signal });
        setAttendance(attRes.data.data);

        const gradesRes = await api.get(`/exams/report-card/${selectedChildId}`, { signal });
        setReportCard(gradesRes.data.data);

        const billRes = await api.get(`/payments/student/${selectedChildId}`, { signal });
        setBilling(billRes.data.data);

        const aiRes = await api.get(`/ai/insights/${selectedChildId}`, { signal });
        setAiInsights(aiRes.data.data);
      } catch (e: any) {
        if (e?.name === 'AbortError' || e?.code === 'ERR_CANCELED') return;
        setErrorMsg('Failed to load child data. Please try again.');
      }
    };

    fetchData();
    return () => controller.abort();
  }, [selectedChildId]);

  const [activeTab, setActiveTab] = useState<string | null>(null);

  const [sops, setSops] = useState<any[]>([]);
  const [selectedSop, setSelectedSop] = useState<any | null>(null);
  const [sopSearch, setSopSearch] = useState('');
  const [sopCategoryFilter, setSopCategoryFilter] = useState('');
  const [sopLang, setSopLang] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    api.get('/sops').then((res) => {
      setSops(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedSop(res.data.data[0]);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const refreshBilling = useCallback(async (childId: string) => {
    try {
      const billRes = await api.get(`/payments/student/${childId}`);
      setBilling(billRes.data.data);
    } catch {
      setErrorMsg('Failed to refresh billing data.');
    }
  }, []);

  const refreshAiInsights = useCallback(async (childId: string) => {
    try {
      const aiRes = await api.get(`/ai/insights/${childId}`);
      setAiInsights(aiRes.data.data);
    } catch {
      // non-critical
    }
  }, []);

  /* ── Payment handler ──────────────────────────────────────────────── */

  const handlePayment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeInvoice) return;

      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      try {
        await api.post('/payments/record', {
          student_id: selectedChildId,
          fee_structure_id: activeInvoice.id,
          amount_paid: activeInvoice.balance,
          payment_method: paymentMethod,
          ...(paymentMethod === 'BankTransfer' ? { account_number: accountNumber } : {}),
          ...(paymentMethod === 'ChequeDD' ? { cheque_number: chequeNumber } : {}),
        });
        setSuccessMsg(`Payment of ₹${activeInvoice.balance} completed successfully.`);
        refreshBilling(selectedChildId);
        refreshAiInsights(selectedChildId);
        setActiveInvoice(null);
        setAccountNumber('');
        setChequeNumber('');
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Payment processing failed.');
      } finally {
        setLoading(false);
      }
    },
    [activeInvoice, selectedChildId, paymentMethod, refreshBilling, refreshAiInsights],
  );

  /* ── Receipt modal ────────────────────────────────────────────────── */

  const openReceipt = useCallback((tx: Transaction) => {
    setReceiptTx(tx);
  }, []);

  const closeReceipt = useCallback(() => {
    setReceiptTx(null);
  }, []);

  /* ── Memoised chart data ──────────────────────────────────────────── */

  const chartData = useMemo(
    () =>
      reportCard?.grades?.map((g: GradeItem) => ({
        name: g.subject_code,
        value: parseFloat(String(g.marks_obtained)),
      })) || [],
    [reportCard],
  );

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <div className="space-y-6 text-slate-100">
      {/* Receipt Modal */}
      {receiptTx && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={closeReceipt}
          role="dialog"
          aria-modal="true"
          aria-label="Payment Receipt"
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <h2 className="text-lg font-bold text-cyan-400">EduSync AI — Official Receipt</h2>
              <button
                onClick={closeReceipt}
                className="text-slate-500 hover:text-white text-lg leading-none"
                aria-label="Close receipt"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Reference ID</p>
                <p className="font-mono text-slate-200 font-semibold">{receiptTx.transaction_reference}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Payment Date</p>
                <p className="font-mono text-slate-200 font-semibold">{receiptTx.payment_date.split('T')[0]}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Student Name</p>
                <p className="text-slate-200 font-semibold">
                  {childProfile?.first_name || 'Student'} {childProfile?.last_name || ''}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Payment Method</p>
                <p className="text-slate-200 font-semibold">{receiptTx.payment_method}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Description</p>
                <p className="text-slate-200 font-semibold">{receiptTx.fee_name || 'School Fee Payment'}</p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-700 rounded-2xl p-5 flex justify-between items-center">
              <span className="font-bold text-slate-300">Amount Paid</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                ₹{parseFloat(receiptTx.amount_paid).toFixed(2)}
              </span>
            </div>

            <p className="text-[10px] text-slate-600 text-center pt-2 border-t border-slate-800">
              Thank you for your payment. For inquiries, contact finance@edusync.com
            </p>
          </div>
        </div>
      )}

      {/* Header Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Parent Gateway</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your children's performance, pay active tuition invoices, and check AI reports.</p>
        </div>

        {children.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Select Student:</span>
            <select
              aria-label="Select student"
              value={selectedChildId}
              onChange={(e) => {
                setSelectedChildId(e.target.value);
                setActiveInvoice(null);
                setSuccessMsg(null);
                setErrorMsg(null);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl outline-none"
            >
              {children.map(ch => (
                <option key={ch.id} value={ch.id}>{ch.first_name} {ch.last_name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Action Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400 text-sm flex items-center gap-2" role="alert">
          <Check className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-2xl text-rose-400 text-sm flex items-center gap-2" role="alert">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'sops' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="tabpanel-sops" role="tabpanel" aria-label="SOP Guidelines">
          {/* List */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold">Procedural Guidelines</h2>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search Title..."
                    value={sopSearch}
                    onChange={(e) => setSopSearch(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs w-28 text-slate-200"
                  />
                </div>
                <select
                  value={sopCategoryFilter}
                  onChange={(e) => setSopCategoryFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 outline-none text-xs text-slate-200"
                >
                  <option value="">All Categories</option>
                  <option value="Admissions">Admissions</option>
                  <option value="Academics">Academics</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            {/* Grid of SOPs */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {sops
                .filter((s) => !sopCategoryFilter || s.category === sopCategoryFilter)
                .filter((s) => !sopSearch || s.title.toLowerCase().includes(sopSearch.toLowerCase()))
                .map((sop) => (
                  <button
                    key={sop.id}
                    onClick={() => setSelectedSop(sop)}
                    className={`p-4 rounded-2xl text-left border transition w-full block ${
                      selectedSop?.id === sop.id
                        ? 'bg-cyan-500/10 border-cyan-500/40 shadow-lg shadow-cyan-500/5'
                        : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1.5 gap-2">
                      <span className="font-extrabold text-sm text-slate-200 block truncate">{sop.title}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-cyan-400 border border-slate-700 shrink-0">
                        {sop.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">{sop.description || 'No description provided.'}</p>
                  </button>
                ))}
            </div>
          </div>

          {/* Selected SOP Detail Pane */}
          <div className="lg:col-span-2">
            {selectedSop ? (
              <div 
                className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6 transition-all duration-300"
                dir={sopLang === 'ar' ? 'rtl' : 'ltr'}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800/80 pb-4 gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold text-slate-100">
                        {sopLang === 'ar' ? (selectedSop.title_ar || selectedSop.title) : selectedSop.title}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/60 text-cyan-400 border border-cyan-900">
                        {selectedSop.category}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      {sopLang === 'ar' ? (selectedSop.description_ar || selectedSop.description) : selectedSop.description}
                    </p>
                  </div>
                  
                  {/* Language Switcher */}
                  <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-xl shrink-0">
                    <button
                      type="button"
                      onClick={() => setSopLang('en')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${sopLang === 'en' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setSopLang('ar')}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${sopLang === 'ar' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      AR
                    </button>
                  </div>
                </div>

                {/* Steps Checklist Vertical Timeline */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                    {sopLang === 'ar' ? 'خطوات قائمة التحقق' : 'Checklist Steps'}
                  </span>
                  <div className={`relative border-slate-850 space-y-6 ${sopLang === 'ar' ? 'border-r mr-4 pr-6 text-right' : 'border-l ml-4 pl-6 text-left'}`}>
                    {((sopLang === 'ar' ? selectedSop.steps_ar : null) || selectedSop.steps).map((st: any, i: number) => (
                      <div key={i} className="relative">
                        {/* Timeline Bullet Point */}
                        <div className={`absolute top-0.5 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-[10px] font-bold text-cyan-400 font-mono ${sopLang === 'ar' ? '-right-[35px]' : '-left-[35px]'}`}>
                          {st.step}
                        </div>
                        <div className="space-y-1">
                          <div className={`flex flex-wrap items-center gap-2 ${sopLang === 'ar' ? 'justify-start' : ''}`}>
                            <span className="font-bold text-sm text-slate-200">{st.title}</span>
                            {st.role && (
                              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[9px] rounded-md uppercase font-semibold">
                                {sopLang === 'ar' ? `المالك: ${st.role}` : `Owner: ${st.role}`}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">{st.description || (sopLang === 'ar' ? 'لا يوجد وصف.' : 'No description.')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl text-center text-slate-500 text-xs italic">
                Select an SOP guideline card from the list to view detailed steps.
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Child Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Child Profile summary */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Student Identity</span>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-cyan-950 border border-cyan-800 rounded-full flex items-center justify-center font-bold text-cyan-400 text-lg">
              {childProfile?.first_name ? childProfile.first_name[0] : 'S'}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-200">{childProfile?.first_name} {childProfile?.last_name}</h3>
              <span className="text-[10px] text-slate-500 block">Class: {childProfile?.class_name} - {childProfile?.section_name}</span>
            </div>
          </div>
          <div className="text-xs space-y-2 border-t border-slate-850 pt-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Roll No:</span>
              <span className="font-mono text-slate-300">{childProfile?.roll_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Admission No:</span>
              <span className="font-mono text-slate-300">{childProfile?.admission_number}</span>
            </div>
          </div>
        </div>

        {/* Child Presence rates summary */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Attendance status</span>
            <h2 className="text-sm font-bold mt-1">Class Attendance</h2>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-cyan-400">{attendance?.summary?.attendanceRate || 100}%</span>
            <span className="text-[10px] text-slate-500">Presence</span>
          </div>
          <span className="text-[10px] text-slate-400">
            Total Sessions: {attendance?.summary?.total || 0} | Present: {attendance?.summary?.present || 0} | Absent: {attendance?.summary?.absent || 0}
          </span>
        </div>

        {/* AI Parent Insights panel */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-850 pb-2">
            <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
            <h3 className="font-bold text-sm">AI Parent Suggestions</h3>
          </div>
          {aiInsights ? (
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <p>We notice {childProfile?.first_name} maintains a **{aiInsights.trend}** trend with a **{aiInsights.riskLevel}** academic risk profile.</p>
              <div className="p-2 bg-slate-950 border border-slate-850 rounded-xl flex gap-2 items-start text-[10px] text-slate-400">
                <AlertTriangle className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Advice: Encourage review of CS coding homework assignments on laboratory days.</span>
              </div>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic block">Calculating child metrics...</span>
          )}
        </div>
      </div>

      {/* Main grids: Billing & Performance report cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Children Billing & School Invoices lists */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 lg:col-span-2">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Landmark className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold">Outstanding Dues & Fee Ledger</h2>
          </div>

          <div className="space-y-3">
            {billing.invoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-200 block">{inv.name}</span>
                  <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                    <span>Due Date: {inv.due_date.split('T')[0]}</span>
                    <span>Total Bill: ₹{inv.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {inv.status} (Bal: ₹{inv.balance.toFixed(2)})
                  </span>
                  {inv.balance > 0 && (
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
                      aria-label={`Pay dues for ${inv.name}`}
                    >
                      <CreditCard className="h-3.5 w-3.5" />
                      <span>Pay Dues</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {billing.invoices.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                No active outstanding school bills for this student.
              </div>
            )}
          </div>

          {/* Payment checkout modal/form */}
          {activeInvoice && (
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="font-bold text-xs">Payment Checkout: {activeInvoice.name}</span>
                <button onClick={() => setActiveInvoice(null)} className="text-slate-500 hover:text-white" aria-label="Cancel payment">✕ Cancel</button>
              </div>

              <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
                <div>
                  <label htmlFor="invoice-balance" className="text-slate-500 block mb-1">Invoice Balance to Pay</label>
                  <span id="invoice-balance" className="block font-mono text-cyan-400 font-bold text-sm bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                    ₹{activeInvoice.balance.toFixed(2)}
                  </span>
                </div>
                <div>
                  <label htmlFor="payment-method" className="text-slate-500 block mb-1">Payment Method</label>
                  <select
                    id="payment-method"
                    aria-label="Payment method"
                    value={paymentMethod}
                    onChange={(e) => {
                      setPaymentMethod(e.target.value);
                      setAccountNumber('');
                      setChequeNumber('');
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 outline-none"
                  >
                    <option value="Card">Online Credit Card</option>
                    <option value="BankTransfer">Direct Bank Transfer</option>
                    <option value="ChequeDD">Cheque / DD</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
                  aria-label={loading ? 'Processing payment' : 'Complete payment'}
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </button>
              </form>
              {paymentMethod === 'BankTransfer' && (
                <div className="mt-3">
                  <label htmlFor="parent-account-number" className="text-slate-500 block mb-1 text-xs">Bank Account Number</label>
                  <input
                    id="parent-account-number"
                    type="text" required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 1234567890"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 outline-none text-xs font-mono"
                    aria-label="Bank account number"
                  />
                </div>
              )}
              {paymentMethod === 'ChequeDD' && (
                <div className="mt-3">
                  <label htmlFor="parent-cheque-number" className="text-slate-500 block mb-1 text-xs">Cheque / DD Number</label>
                  <input
                    id="parent-cheque-number"
                    type="text" required
                    value={chequeNumber}
                    onChange={(e) => setChequeNumber(e.target.value)}
                    placeholder="e.g. CHQ-0042891"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 outline-none text-xs font-mono"
                    aria-label="Cheque or DD number"
                  />
                </div>
              )}
            </div>
          )}

          {/* Transaction History Section */}
          <div className="border-t border-slate-800/60 pt-6 mt-6 space-y-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Transaction Receipt History</span>
            <div className="space-y-2.5">
              {billing.history && billing.history.map((tx) => (
                <div key={tx.id} className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{tx.fee_name || 'School Fee Payment'}</span>
                    <div className="flex gap-4 text-[10px] text-slate-500 font-mono mt-1">
                      <span>Ref: {tx.transaction_reference}</span>
                      <span>Paid: {tx.payment_date.split('T')[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-400 font-mono">+₹{parseFloat(tx.amount_paid).toFixed(2)}</span>
                    <button
                      onClick={() => openReceipt(tx)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition"
                      aria-label={`View receipt for ${tx.transaction_reference}`}
                    >
                      View Receipt
                    </button>
                  </div>
                </div>
              ))}
              {(!billing.history || billing.history.length === 0) && (
                <div className="text-left py-4 text-slate-500 text-xs italic">
                  No transaction history logged for this student.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Academic Standings scores chart (Recharts Bar chart) */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
            <Award className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold">Academic Standings</h2>
          </div>

          <div className="h-[200px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-slate-600 text-xs italic">No scores graded yet this term.</div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
