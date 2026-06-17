import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import { 
  Landmark, CreditCard, ClipboardList, Plus, 
  CheckCircle2, AlertTriangle, FileSpreadsheet, Download, RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string | number;
  student_name: string;
  fee_name: string;
  transaction_reference: string;
  payment_date: string;
  payment_method: string;
  amount_paid: string | number;
}

interface Summary {
  totalRevenue: number;
  transactionCount: number;
  recentTransactions: Transaction[];
}

interface FeeStructure {
  id: string | number;
  name: string;
  amount: string | number;
  class_name?: string;
  due_date: string;
  academic_year_name: string;
}

interface Student {
  id: string | number;
  first_name: string;
  last_name: string;
  admission_number: string;
}

type TabId = 'collect' | 'ledger' | 'structures' | 'sops';

interface TabDef {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

export default function AccountantDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabId>('collect');

  // Loaded stats
  const [summary, setSummary] = useState<Summary | null>(null);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Form states
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedFee, setSelectedFee] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [payMethod, setPayMethod] = useState('Card');
  const [txnRef, setTxnRef] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [chequeNumber, setChequeNumber] = useState('');

  // Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [sops, setSops] = useState<any[]>([]);
  const [selectedSop, setSelectedSop] = useState<any | null>(null);
  const [sopSearch, setSopSearch] = useState('');
  const [sopCategoryFilter, setSopCategoryFilter] = useState('');

  const fetchSummary = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get('/payments/summary', { signal });
      if (!signal?.aborted) {
        setSummary(res.data.data);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load payment summary.';
      setErrorMsg(msg);
    }
  }, []);

  const fetchStructures = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get('/payments/structures', { signal });
      if (!signal?.aborted) {
        setFeeStructures(res.data.data);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load fee structures.';
      setErrorMsg(msg);
    }
  }, []);

  const fetchStudents = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get('/students', { signal });
      if (!signal?.aborted) {
        setStudents(res.data.data);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load students.';
      setErrorMsg(msg);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    fetchSummary(signal);
    fetchStructures(signal);
    fetchStudents(signal);

    api.get('/sops', { signal }).then((res) => {
      setSops(res.data.data);
      if (res.data.data.length > 0) {
        setSelectedSop(res.data.data[0]);
      }
    }).catch(() => {});

    return () => controller.abort();
  }, [fetchSummary, fetchStructures, fetchStudents]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab as TabId);
    }
  }, [location.state?.tab]);

  // Record a payment manual entry
  const handleRecordPayment = useCallback(async (e: React.FormEvent) => {
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
        transaction_reference: txnRef || `TXN-MAN-${Date.now()}`,
        ...(payMethod === 'BankTransfer' ? { account_number: accountNumber } : {}),
        ...(payMethod === 'ChequeDD' ? { cheque_number: chequeNumber } : {}),
      });

      setSuccessMsg('Offline payment checkout recorded successfully in ledger.');
      fetchSummary();
      fetchStructures();
      setSelectedStudent('');
      setSelectedFee('');
      setAmountPaid('');
      setTxnRef('');
      setAccountNumber('');
      setChequeNumber('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to record payment in database ledger.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [selectedStudent, selectedFee, amountPaid, payMethod, txnRef, fetchSummary]);

  const tabs: TabDef[] = useMemo(() => [
    { id: 'collect', label: 'Record Collection', icon: <Plus className="h-4 w-4" /> },
    { id: 'ledger', label: 'Transaction Ledger', icon: <FileSpreadsheet className="h-4 w-4" /> },
    { id: 'structures', label: 'Fee Catalog', icon: <ClipboardList className="h-4 w-4" /> },
  ], []);

  const handleReceiptDownload = useCallback((tx: Transaction) => {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;
    receiptWindow.document.write(`
      <html><head><title>Receipt - ${tx.transaction_reference}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 40px; color: #1e293b; }
        .header { text-align: center; border-bottom: 2px solid #06b6d4; padding-bottom: 20px; margin-bottom: 20px; }
        .header h1 { color: #06b6d4; margin: 0; font-size: 24px; }
        .header p { color: #64748b; margin: 4px 0 0; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 8px 4px; font-size: 13px; }
        .label { color: #64748b; font-weight: 600; width: 140px; }
        .value { font-weight: 700; }
        .amount-row { background: #f1f5f9; border-radius: 8px; }
        .amount-row td { padding: 16px 8px; font-size: 18px; }
        .amount-row .value { color: #06b6d4; font-size: 22px; text-align: right; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; }
      </style></head><body>
        <div class="header">
          <h1>EduSync AI — Official Receipt</h1>
          <p>Payment Confirmation Voucher</p>
        </div>
        <table>
          <tr><td class="label">Reference ID</td><td class="value">${tx.transaction_reference}</td></tr>
          <tr><td class="label">Student Name</td><td class="value">${tx.student_name}</td></tr>
          <tr><td class="label">Fee Item</td><td class="value">${tx.fee_name || 'School Fee'}</td></tr>
          <tr><td class="label">Payment Date</td><td class="value">${tx.payment_date.split('T')[0]}</td></tr>
          <tr><td class="label">Payment Method</td><td class="value">${tx.payment_method}</td></tr>
        </table>
        <table style="margin-top: 16px;">
          <tr class="amount-row"><td class="label">Amount Paid</td><td class="value">₹${parseFloat(String(tx.amount_paid)).toFixed(2)}</td></tr>
        </table>
        <div class="footer">
          Thank you for your payment. For inquiries, contact finance@edusync.com<br/>
          This is a computer-generated receipt.
        </div>
      </body></html>
    `);
    receiptWindow.document.close();
  }, []);

  return (
    <div className="space-y-6 text-slate-100" role="main" aria-label="Finance Office Dashboard">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Finance Office</h1>
          <p className="text-slate-400 text-sm mt-1">Record bank drafts, generate manual tuition receipts, and oversee institution revenue sheets.</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl" role="tablist" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={tab.label}
              onClick={() => {
                setActiveTab(tab.id);
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
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400 text-sm flex items-center gap-2" role="alert" aria-live="polite">
          <CheckCircle2 className="h-5 w-5" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-2xl text-rose-400 text-sm flex items-center gap-2" role="alert" aria-live="assertive">
          <AlertTriangle className="h-5 w-5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Stats summaries header */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total College Revenue</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block" aria-label={`Total revenue ₹${summary?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}`}>
              ₹{summary?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
            </span>
          </div>
          <div className="h-10 w-10 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0" aria-hidden="true">
            <Landmark className="h-5.5 w-5.5" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex justify-between items-center shadow-lg">
          <div>
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Transaction Entries</span>
            <span className="text-3xl font-black text-slate-200 mt-1 block" aria-label={`${summary?.transactionCount || 0} total invoices`}>
              {summary?.transactionCount || 0} invoices
            </span>
          </div>
          <div className="h-10 w-10 bg-slate-850 rounded-xl border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0" aria-hidden="true">
            <CreditCard className="h-5.5 w-5.5" />
          </div>
        </div>
      </div>

      {/* TAB CONTENT: RECORD COLLECTION */}
      {activeTab === 'collect' && (
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl max-w-2xl mx-auto space-y-6" role="tabpanel" aria-label="Record Collection">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold">Log Student Fees Collection</h2>
            <p className="text-slate-500 text-xs mt-0.5">Enter direct card checkouts, cash drafts, or bank checks manually here.</p>
          </div>

          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs font-semibold" aria-label="Record payment form">
            <div>
              <label className="text-slate-400 block mb-1" htmlFor="student-select">Select Student</label>
              <select
                id="student-select"
                required
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 text-xs"
                aria-label="Select enrolled student"
              >
                <option value="">Select Enrolled Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.admission_number})</option>)}
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1" htmlFor="fee-select">Fee Structure Dues Category</label>
              <select
                id="fee-select"
                required
                value={selectedFee}
                onChange={(e) => setSelectedFee(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 text-xs"
                aria-label="Select fee structure"
              >
                <option value="">Select Dues Category</option>
                {feeStructures.map(f => <option key={f.id} value={f.id}>{f.name} (₹{parseFloat(String(f.amount)).toFixed(2)})</option>)}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 block mb-1" htmlFor="amount-paid">Amount Collected (₹)</label>
                <input
                  id="amount-paid"
                  type="number" required min={1} step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="e.g. 1200.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs font-mono font-bold"
                  aria-label="Amount collected in rupees"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1" htmlFor="payment-method">Payment Method</label>
                <select
                  id="payment-method"
                  value={payMethod}
                  onChange={(e) => {
                    setPayMethod(e.target.value);
                    setAccountNumber('');
                    setChequeNumber('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-slate-200 text-xs font-bold"
                  aria-label="Select payment method"
                >
                  <option value="Card">Online Credit Card</option>
                  <option value="Cash">Cash Draft Receipt</option>
                  <option value="BankTransfer">Direct Bank Transfer</option>
                  <option value="ChequeDD">Cheque / DD</option>
                </select>
              </div>
            </div>

            {payMethod === 'BankTransfer' && (
              <div>
                <label className="text-slate-400 block mb-1" htmlFor="account-number">Bank Account Number</label>
                <input
                  id="account-number"
                  type="text" required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1234567890"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs font-mono"
                  aria-label="Bank account number"
                />
              </div>
            )}

            {payMethod === 'ChequeDD' && (
              <div>
                <label className="text-slate-400 block mb-1" htmlFor="cheque-number">Cheque / DD Number</label>
                <input
                  id="cheque-number"
                  type="text" required
                  value={chequeNumber}
                  onChange={(e) => setChequeNumber(e.target.value)}
                  placeholder="e.g. CHQ-0042891"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs font-mono"
                  aria-label="Cheque or DD number"
                />
              </div>
            )}

            <div>
              <label className="text-slate-400 block mb-1" htmlFor="txn-ref">Bank Check/Txn Ref No. (Optional)</label>
              <input
                id="txn-ref"
                type="text"
                value={txnRef}
                onChange={(e) => setTxnRef(e.target.value)}
                placeholder="e.g. CHK-992384"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs font-mono"
                aria-label="Transaction reference number"
              />
              <span className="text-[10px] text-slate-500 block font-normal mt-1">Leaves default simulated reference if left empty.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-xl transition text-xs shadow-md"
              aria-label={loading ? 'Recording payment' : 'Log collection receipt'}
            >
              {loading ? 'Recording in Ledger...' : 'Log Collection Receipt'}
            </button>
          </form>
        </div>
      )}

      {/* TAB CONTENT: TRANSACTION LEDGER */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4" role="tabpanel" aria-label="Transaction Ledger">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold">Transactions Audit Ledger</h2>
            <button 
              onClick={() => fetchSummary()}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
              aria-label="Refresh transaction ledger"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse" aria-label="Transactions table">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500">
                  <th className="py-3 font-semibold" scope="col">Student Name</th>
                  <th className="py-3 font-semibold" scope="col">Category Fee Item</th>
                  <th className="py-3 font-semibold" scope="col">Transaction Ref No</th>
                  <th className="py-3 font-semibold" scope="col">Payment Date</th>
                  <th className="py-3 font-semibold" scope="col">Method</th>
                  <th className="py-3 font-semibold" scope="col">Amount Paid</th>
                  <th className="py-3 text-right font-semibold" scope="col">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {summary?.recentTransactions?.map((tx: Transaction) => (
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
                    <td className="py-3 font-mono font-bold text-emerald-400">₹{parseFloat(String(tx.amount_paid)).toFixed(2)}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => handleReceiptDownload(tx)}
                        className="p-1 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-cyan-400"
                        aria-label={`Download receipt for transaction ${tx.transaction_reference}`}
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
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4" role="tabpanel" aria-label="Fee Catalog">
          <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Active Tuition Invoices Catalog</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse" aria-label="Fee structures table">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500">
                  <th className="py-3 font-semibold" scope="col">Structure Name</th>
                  <th className="py-3 font-semibold" scope="col">Grade Scope</th>
                  <th className="py-3 font-semibold" scope="col">Dues Amount</th>
                  <th className="py-3 font-semibold" scope="col">Due Date</th>
                  <th className="py-3 font-semibold" scope="col">Academic Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {feeStructures.map((f: FeeStructure) => (
                  <tr key={f.id} className="hover:bg-slate-850/30">
                    <td className="py-3 font-bold text-slate-200">{f.name}</td>
                    <td className="py-3">{f.class_name || 'All Classes'}</td>
                    <td className="py-3 font-mono font-bold text-cyan-400">₹{parseFloat(String(f.amount)).toFixed(2)}</td>
                    <td className="py-3 font-mono">{f.due_date.split('T')[0]}</td>
                    <td className="py-3 text-slate-400">{f.academic_year_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SOPS */}
      {activeTab === 'sops' && (
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
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-100">{selectedSop.title}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-950/60 text-cyan-400 border border-cyan-900">
                      {selectedSop.category}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{selectedSop.description}</p>
                </div>

                {/* Steps Checklist Vertical Timeline */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Checklist Steps</span>
                  <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
                    {selectedSop.steps.map((st: any, i: number) => (
                      <div key={i} className="relative">
                        {/* Timeline Bullet Point */}
                        <div className="absolute -left-[35px] top-0.5 h-6 w-6 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center text-[10px] font-bold text-cyan-400 font-mono">
                          {st.step}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-sm text-slate-200">{st.title}</span>
                            {st.role && (
                              <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-slate-400 font-mono text-[9px] rounded-md uppercase font-semibold">
                                Owner: {st.role}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed">{st.description}</p>
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
      )}
    </div>
  );
}
