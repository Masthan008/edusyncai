import React, { useEffect, useState } from 'react';
import { api } from '../../../utils/api.js';
import { useAuthStore } from '../../../store/authStore.js';
import { 
  Users, CheckSquare, Award, Landmark, CreditCard, Check, 
  AlertTriangle, Sparkles, Loader2, RefreshCw, ClipboardList
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function ParentDashboard() {
  const { profile } = useAuthStore();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState('');

  // Loaded child details states
  const [childProfile, setChildProfile] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>(null);
  const [reportCard, setReportCard] = useState<any>(null);
  const [billing, setBilling] = useState<any>({ invoices: [], history: [] });
  const [aiInsights, setAiInsights] = useState<any>(null);

  // Bill payment form state
  const [activeInvoice, setActiveInvoice] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  
  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.children && profile.children.length > 0) {
      setChildren(profile.children);
      setSelectedChildId(profile.children[0].id);
    }
  }, [profile]);

  useEffect(() => {
    if (selectedChildId) {
      fetchChildData(selectedChildId);
    }
  }, [selectedChildId]);

  const fetchChildData = async (childId: string) => {
    try {
      // 1. Fetch child profile
      const profRes = await api.get(`/students/${childId}`);
      setChildProfile(profRes.data.data);

      // 2. Fetch child attendance
      const attRes = await api.get(`/attendance/student/${childId}`);
      setAttendance(attRes.data.data);

      // 3. Fetch child grades
      const gradesRes = await api.get(`/exams/report-card/${childId}`);
      setReportCard(gradesRes.data.data);

      // 4. Fetch child billing
      const billRes = await api.get(`/payments/student/${childId}`);
      setBilling(billRes.data.data);

      // 5. Fetch child AI insights
      const aiRes = await api.get(`/ai/insights/${childId}`);
      setAiInsights(aiRes.data.data);
    } catch (e) {
      console.error('Error fetching child details:', e);
    }
  };

  // Perform card payment
  const handlePayment = async (e: React.FormEvent) => {
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
        payment_method: paymentMethod
      });
      setSuccessMsg(`Payment of $${activeInvoice.balance} completed successfully.`);
      fetchChildData(selectedChildId);
      setActiveInvoice(null);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (tx: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${tx.transaction_reference}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .receipt-card { max-w: 600px; margin: 0 auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #06b6d4; }
            .title { font-size: 18px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: bold; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: bold; margin-bottom: 2px; }
            .value { font-size: 14px; color: #334155; font-weight: 600; }
            .total-section { background-color: #f8fafc; border: 1px solid #f1f5f9; padding: 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 16px; font-weight: bold; color: #475569; }
            .total-value { font-size: 24px; font-weight: 900; color: #0891b2; font-family: monospace; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="logo">EduSync AI</div>
              <div class="title">Official Receipt</div>
            </div>
            
            <div class="grid">
              <div>
                <div class="label">Reference ID</div>
                <div class="value">${tx.transaction_reference}</div>
              </div>
              <div>
                <div class="label">Payment Date</div>
                <div class="value">${tx.payment_date.split('T')[0]}</div>
              </div>
              <div>
                <div class="label">Student Name</div>
                <div class="value">${childProfile?.first_name || 'Student'} ${childProfile?.last_name || ''}</div>
              </div>
              <div>
                <div class="label">Payment Method</div>
                <div class="value">${tx.payment_method}</div>
              </div>
              <div style="grid-column: span 2;">
                <div class="label">Description</div>
                <div class="value">${tx.fee_name || 'School Fee Payment'}</div>
              </div>
            </div>

            <div class="total-section">
              <div class="total-label">Amount Paid</div>
              <div class="total-value">$${parseFloat(tx.amount_paid).toFixed(2)}</div>
            </div>

            <div class="footer">
              Thank you for your payment. For inquiries, contact the billing office at finance@edusync.com<br>
              &copy; ${new Date().getFullYear()} EduSync AI Inc. All rights reserved.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const chartData = reportCard?.grades?.map((g: any) => ({
    name: g.subject_code,
    value: parseFloat(g.marks_obtained)
  })) || [];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Parent Gateway</h1>
          <p className="text-slate-400 text-sm mt-1">Monitor your children's performance, pay active tuition invoices, and check AI reports.</p>
        </div>

        {/* Children selector list */}
        {children.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Select Student:</span>
            <select
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
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400 text-sm flex items-center gap-2">
          <Check className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-2xl text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMsg}</span>
        </div>
      )}

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
            {billing.invoices.map((inv: any) => (
              <div key={inv.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-slate-200 block">{inv.name}</span>
                  <div className="flex gap-4 text-[10px] text-slate-500 font-mono">
                    <span>Due Date: {inv.due_date.split('T')[0]}</span>
                    <span>Total Bill: ${inv.amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    inv.status === 'Paid' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                  }`}>
                    {inv.status} (Bal: ${inv.balance.toFixed(2)})
                  </span>
                  {inv.balance > 0 && (
                    <button
                      onClick={() => setActiveInvoice(inv)}
                      className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 transition"
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

          {/* Payment receipt checkout modal/form */}
          {activeInvoice && (
            <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                <span className="font-bold text-xs">Payment Checkout: {activeInvoice.name}</span>
                <button onClick={() => setActiveInvoice(null)} className="text-slate-500 hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handlePayment} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Invoice Balance to Pay</label>
                  <span className="block font-mono text-cyan-400 font-bold text-sm bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl">
                    ${activeInvoice.balance.toFixed(2)}
                  </span>
                </div>
                <div>
                  <label className="text-slate-500 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 outline-none"
                  >
                    <option value="Card">Online Credit Card</option>
                    <option value="BankTransfer">Direct Bank Transfer</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
                >
                  {loading ? 'Processing...' : 'Complete Payment'}
                </button>
              </form>
            </div>
          )}

          {/* Transaction History Section */}
          <div className="border-t border-slate-800/60 pt-6 mt-6 space-y-4">
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Transaction Receipt History</span>
            <div className="space-y-2.5">
              {billing.history && billing.history.map((tx: any) => (
                <div key={tx.id} className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{tx.fee_name || 'School Fee Payment'}</span>
                    <div className="flex gap-4 text-[10px] text-slate-500 font-mono mt-1">
                      <span>Ref: {tx.transaction_reference}</span>
                      <span>Paid: {tx.payment_date.split('T')[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-emerald-400 font-mono">+${parseFloat(tx.amount_paid).toFixed(2)}</span>
                    <button
                      onClick={() => printReceipt(tx)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold hover:underline transition"
                    >
                      Print Receipt
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
    </div>
  );
}
