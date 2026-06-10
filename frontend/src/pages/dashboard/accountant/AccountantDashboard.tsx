import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import { 
  Landmark, CreditCard, ClipboardList, Plus, Search, 
  CheckCircle2, AlertTriangle, FileSpreadsheet, Download, RefreshCw
} from 'lucide-react';

export default function AccountantDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'collect' | 'ledger' | 'structures'>('collect');

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/payments/ledger')) {
      setActiveTab('ledger');
    } else if (path.endsWith('/payments')) {
      setActiveTab('structures');
    } else {
      setActiveTab('collect');
    }
  }, [location.pathname]);

  // Loaded stats
  const [summary, setSummary] = useState<any>(null);
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [payMethod, setPayMethod] = useState('Card');
  const [txnRef, setTxnRef] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchStructures();
    fetchStudents();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/payments/summary');
      setSummary(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStructures = async () => {
    try {
      const res = await api.get('/payments/structures');
      setFeeStructures(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Record a payment manual entry
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedFee || !amountPaid) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/payments/record', {
        student_id: selectedStudent,
        fee_structure_id: selectedFee,
        amount_paid: parseFloat(amountPaid),
        payment_method: payMethod,
        transaction_reference: txnRef || `TXN-MAN-${Date.now()}`
      });

      setSuccessMsg('Offline payment checkout recorded successfully in ledger.');
      fetchSummary();
      setSelectedStudent('');
      setSelectedFee('');
      setAmountPaid('');
      setTxnRef('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record payment in database ledger.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Finance Office</h1>
          <p className="text-slate-400 text-sm mt-1">Record bank drafts, generate manual tuition receipts, and oversee institution revenue sheets.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'collect', label: 'Record Collection', icon: <Plus className="h-4 w-4" />, path: '/dashboard' },
            { id: 'ledger', label: 'Transaction Ledger', icon: <FileSpreadsheet className="h-4 w-4" />, path: '/dashboard/payments/ledger' },
            { id: 'structures', label: 'Fee Catalog', icon: <ClipboardList className="h-4 w-4" />, path: '/dashboard/payments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                navigate(tab.path);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                activeTab === tab.id ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-2xl text-rose-400 text-sm flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats summaries header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total College Revenue</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">
              ${summary?.totalRevenue?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
          <div className="h-10 w-10 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
            <Landmark className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Transaction Entries</span>
            <span className="text-3xl font-black text-slate-200 mt-1 block">
              {summary?.transactionCount || 0} invoices
            </span>
          </div>
          <div className="h-10 w-10 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
            <CreditCard className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* TAB CONTENT: RECORD COLLECTION */}
      {activeTab === 'collect' && (
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl max-w-2xl mx-auto space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold">Log Student Fees Collection</h2>
            <p className="text-slate-500 text-xs mt-0.5">Enter direct card checkouts, cash drafts, or bank checks manually here.</p>
          </div>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="text-slate-400 block mb-1">Select Student</label>
              <select
                required
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 text-xs"
              >
                <option value="">Select Enrolled Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Fee Structure Dues Category</label>
              <select
                required
                value={selectedFee}
                onChange={(e) => setSelectedFee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 text-xs"
              >
                <option value="">Select Dues Category</option>
                {feeStructures.map(f => <option key={f.id} value={f.id}>{f.name} (${parseFloat(f.amount).toFixed(2)})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1">Amount Collected ($)</label>
                <input
                  type="number" required min={1} step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="e.g. 1200.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 text-xs font-bold"
                >
                  <option value="Card">Online Credit Card</option>
                  <option value="Cash">Cash Draft Receipt</option>
                  <option value="BankTransfer">Direct Bank Check</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Bank Check/Txn Ref No. (Optional)</label>
              <input
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. CHK-992384"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs font-mono"
              />
              <span className="text-[10px] text-slate-500 block font-normal mt-1">Leaves default simulated reference if left empty.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-md"
            >
              {loading ? 'Recording in Ledger...' : 'Log Collection Receipt'}
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold">Transactions Audit Ledger</h2>
            <button 
              onClick={fetchSummary}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500">
                  <th className="py-3 font-semibold">Student Name</th>
                  <th className="py-3 font-semibold">Category Fee Item</th>
                  <th className="py-3 font-semibold">Transaction Ref No</th>
                  <th className="py-3 font-semibold">Payment Date</th>
                  <th className="py-3 font-semibold">Method</th>
                  <th className="py-3 font-semibold">Amount Paid</th>
                  <th className="py-3 text-right font-semibold">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {summary?.recentTransactions?.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-850/30">
                    <td className="py-3 font-bold text-slate-200">{tx.student_name}</td>
                    <td className="py-3">{tx.fee_name}</td>
                    <td className="py-3 font-mono text-cyan-400">{tx.transaction_reference}</td>
                    <td className="py-3 font-mono">{tx.payment_date.split('T')[0]}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-950 border border-slate-850">
                        {tx.payment_method}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-emerald-400">${parseFloat(tx.amount_paid).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => alert(`Simulated receipt PDF download generated for reference: ${tx.transaction_reference}`)}
                        className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-cyan-400"
                        title="Download Receipt"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!summary?.recentTransactions || summary.recentTransactions.length === 0) && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-500">No payment transaction entries in database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: FEE STRUCTURES CATALOG */}
      {activeTab === 'structures' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Active Tuition Invoices Catalog</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500">
                  <th className="py-3 font-semibold">Structure Name</th>
                  <th className="py-3 font-semibold">Grade Scope</th>
                  <th className="py-3 font-semibold">Dues Amount</th>
                  <th className="py-3 font-semibold">Due Date</th>
                  <th className="py-3 font-semibold">Academic Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {feeStructures.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-850/30">
                    <td className="py-3 font-bold text-slate-200">{f.name}</td>
                    <td className="py-3">{f.class_name || 'All Classes'}</td>
                    <td className="py-3 font-mono font-bold text-cyan-400">${parseFloat(f.amount).toFixed(2)}</td>
                    <td className="py-3 font-mono">{f.due_date.split('T')[0]}</td>
                    <td className="py-3 text-slate-400">{f.academic_year_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
