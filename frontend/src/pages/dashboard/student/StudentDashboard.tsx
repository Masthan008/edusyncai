import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import { useAuthStore } from '../../../store/authStore.js';
import { 
  Sparkles, Award, Clock, BookOpen, Send, Loader2, Calendar, 
  CheckCircle2, FileText, UploadCloud, TrendingUp, HelpCircle, AlertCircle,
  Search, ClipboardList
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

// --- Interfaces ---
interface AttendanceSummary {
  attendanceRate: number;
  present: number;
  absent: number;
}

interface AttendanceData {
  summary: AttendanceSummary;
}

interface GradeData {
  id: string;
  subject_code: string;
  subject_name: string;
  marks_obtained: number;
  max_marks: number;
  letter_grade: string;
  grade_point: number;
}

interface ReportCard {
  summary: {
    gpa: number;
  };
  grades: GradeData[];
}

interface ScheduleSlot {
  id: string;
  subject_name: string;
  teacher_name: string;
  room: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject_name: string;
  due_date: string;
  max_marks: number;
}

interface Submission {
  assignment_id: string;
  status: string;
  marks_obtained: number;
  max_marks: number;
  student_id: string;
}

interface AiInsights {
  riskLevel: string;
  trend: string;
  suggestions: string[];
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

// --- Config ---
const DEFAULT_SUBMISSION_URL_PREFIX = 'http://school-storage.internal/uploads/';

export default function StudentDashboard() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'schedule' | 'assignments' | 'sops'>('overview');
  const { profile } = useAuthStore();

  const [sops, setSops] = useState<any[]>([]);
  const [selectedSop, setSelectedSop] = useState<any | null>(null);
  const [sopSearch, setSopSearch] = useState('');
  const [sopCategoryFilter, setSopCategoryFilter] = useState('');
  const [sopLang, setSopLang] = useState<'en' | 'ar'>('en');

  // API states
  const [attendance, setAttendance] = useState<AttendanceData | null>(null);
  const [reportCard, setReportCard] = useState<ReportCard | null>(null);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [aiInsights, setAiInsights] = useState<AiInsights | null>(null);
  const [reportSummary, setReportSummary] = useState<string>('');

  // AI chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "Hello! I'm your EduSync AI Assistant. Ask me anything about your chemistry exam grades, upcoming due assignments, or attendance rates." }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Homework submit state
  const [selectedAssign, setSelectedAssign] = useState<Assignment | null>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Loading states for initial data
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [reportCardLoading, setReportCardLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  // AbortController ref
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchAttendance = useCallback(async (signal?: AbortSignal) => {
    if (!profile?.id) return;
    setAttendanceLoading(true);
    try {
      const res = await api.get(`/attendance/student/${profile.id}`, { signal });
      setAttendance(res.data.data);
    } catch (e: any) {
      if (e.name !== 'CanceledError') setErrorMsg('Failed to load attendance data.');
    } finally {
      setAttendanceLoading(false);
    }
  }, [profile?.id]);

  const fetchAiReportSummary = useCallback(async (signal?: AbortSignal) => {
    if (!profile?.id) return;
    try {
      const res = await api.get(`/ai/report-summary/${profile.id}`, { signal });
      setReportSummary(res.data.summary);
    } catch (e: any) {
      if (e.name !== 'CanceledError') setErrorMsg('Failed to load AI report summary.');
    }
  }, [profile?.id]);

  const fetchReportCard = useCallback(async (signal?: AbortSignal) => {
    if (!profile?.id) return;
    setReportCardLoading(true);
    try {
      const res = await api.get(`/exams/report-card/${profile.id}`, { signal });
      setReportCard(res.data.data);
      fetchAiReportSummary(signal);
    } catch (e: any) {
      if (e.name !== 'CanceledError') setErrorMsg('Failed to load report card data.');
    } finally {
      setReportCardLoading(false);
    }
  }, [profile?.id, fetchAiReportSummary]);

  const fetchSchedule = useCallback(async (signal?: AbortSignal) => {
    if (!profile?.class_id || !profile?.section_id) return;
    setScheduleLoading(true);
    try {
      const res = await api.get(`/timetables/class/${profile.class_id}/${profile.section_id}`, { signal });
      setSchedule(res.data.data);
    } catch (e: any) {
      if (e.name !== 'CanceledError') setErrorMsg('Failed to load schedule data.');
    } finally {
      setScheduleLoading(false);
    }
  }, [profile?.class_id, profile?.section_id]);

  const fetchAssignments = useCallback(async (signal?: AbortSignal) => {
    if (!profile?.class_id || !profile?.section_id) return;
    setAssignmentsLoading(true);
    try {
      const res = await api.get(`/assignments?classId=${profile.class_id}&sectionId=${profile.section_id}`, { signal });
      setAssignments(res.data.data);
      
      const subRes = await api.get('/assignments/submissions', { signal });
      setSubmissions(subRes.data.data.filter((s: Submission) => s.student_id === profile.id));
    } catch (e: any) {
      if (e.name !== 'CanceledError') setErrorMsg('Failed to load assignments.');
    } finally {
      setAssignmentsLoading(false);
    }
  }, [profile?.class_id, profile?.section_id, profile?.id]);

  const fetchAiInsights = useCallback(async (signal?: AbortSignal) => {
    if (!profile?.id) return;
    setInsightsLoading(true);
    try {
      const res = await api.get(`/ai/insights/${profile.id}`, { signal });
      setAiInsights(res.data.data);
    } catch (e: any) {
      if (e.name !== 'CanceledError') setErrorMsg('Failed to load AI insights.');
    } finally {
      setInsightsLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    if (profile?.id) {
      fetchAttendance(signal);
      fetchReportCard(signal);
      fetchSchedule(signal);
      fetchAssignments(signal);
      fetchAiInsights(signal);

      api.get('/sops', { signal }).then((res) => {
        setSops(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSop(res.data.data[0]);
        }
      }).catch(() => {});
    }

    return () => {
      controller.abort();
    };
  }, [profile, fetchAttendance, fetchReportCard, fetchSchedule, fetchAssignments, fetchAiInsights]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab as 'overview' | 'grades' | 'schedule' | 'assignments' | 'sops');
    }
  }, [location.state?.tab]);

  // Submit Homework Roster
  const handleHomeworkSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssign) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/assignments/submit', {
        assignment_id: selectedAssign.id,
        file_url: fileUrl || `${DEFAULT_SUBMISSION_URL_PREFIX}assignment_${Date.now()}.pdf`,
        student_notes: notes
      });
      setSuccessMsg('Assignment submitted successfully.');
      fetchAssignments();
      setSelectedAssign(null);
      setFileUrl('');
      setNotes('');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit assignment.');
    } finally {
      setLoading(false);
    }
  }, [selectedAssign, fileUrl, notes, fetchAssignments]);

  // AI Chat Request
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setAiLoading(true);

    try {
      const res = await api.post('/ai/assistant', {
        question: userText,
        studentId: profile?.id
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I ran into an issue connecting with the context router. Please check your credentials." }]);
    } finally {
      setAiLoading(false);
    }
  }, [chatInput, profile?.id]);

  // Attendance rate indicator colors
  const attRate = attendance?.summary?.attendanceRate ?? 100;
  const pieData = useMemo(() => [
    { name: 'Attended', value: attRate },
    { name: 'Missed', value: Math.max(0, 100 - attRate) }
  ], [attRate]);
  const COLORS = ['#06b6d4', '#1e293b'];

  const tabs = useMemo(() => [
    { id: 'overview' as const, label: 'AI Assistant', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'grades' as const, label: 'Grades & GPA', icon: <Award className="h-4 w-4" /> },
    { id: 'schedule' as const, label: 'Schedule', icon: <Clock className="h-4 w-4" /> },
    { id: 'assignments' as const, label: 'Assignments', icon: <BookOpen className="h-4 w-4" /> },
  ], []);

  return (
    <div className="space-y-6 text-slate-100">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Class: {profile?.class_name} - {profile?.section_name} | Admission ID: {profile?.admission_number}</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl" role="tablist" aria-label="Dashboard sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-label={`${tab.label} tab`}
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
        <div role="alert" className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-2xl text-emerald-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div role="alert" className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-2xl text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB CONTENT: AI ASSISTANT OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Left panel: Quick Academic Metrics Donut */}
          <div className="space-y-6">
            {/* Attendance rate donut */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between items-center text-center">
              <div className="w-full text-left">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Attendance Rate</span>
                <h2 className="text-base font-bold">Class Presence</h2>
              </div>
              {attendanceLoading ? (
                <div className="h-[150px] w-full flex items-center justify-center" aria-label="Loading attendance data">
                  <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                </div>
              ) : (
                <>
                  <div className="h-[150px] w-full mt-2 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={40}
                          outerRadius={55}
                          startAngle={90}
                          endAngle={-270}
                          dataKey="value"
                        >
                          <Cell fill="#06b6d4" />
                          <Cell fill="#1e293b" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute text-center">
                      <span className="text-3xl font-black">{attRate}%</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-2">
                    Present: {attendance?.summary?.present || 0} | Absent: {attendance?.summary?.absent || 0}
                  </div>
                </>
              )}
            </div>

            {/* AI Insights Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <TrendingUp className="h-4.5 w-4.5 text-cyan-400" aria-hidden="true" />
                <h3 className="font-bold text-sm">AI Performance Trends</h3>
              </div>
              {insightsLoading ? (
                <div className="flex items-center gap-2 text-slate-400 text-xs" aria-label="Loading AI insights">
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                  <span>Generating insights...</span>
                </div>
              ) : aiInsights ? (
                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Risk Assessment:</span>
                    <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] uppercase ${
                      aiInsights.riskLevel === 'low' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'
                    }`}>
                      {aiInsights.riskLevel} Risk
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pace Trend:</span>
                    <span className="text-cyan-400 font-bold">{aiInsights.trend}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-slate-500 text-[10px] block font-bold uppercase">Suggestions:</span>
                    <ul className="space-y-1 text-slate-300 pl-4 list-disc">
                      {aiInsights.suggestions.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <span className="text-[10px] text-slate-500 block italic">No insights available.</span>
              )}
            </div>
          </div>

          {/* Right panel: AI Academic Assistant Chatbot (Lucide + Form) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl h-[420px] lg:h-auto">
            {/* Chat Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-cyan-950 border border-cyan-800 rounded-xl flex items-center justify-center text-cyan-400">
                  <Sparkles className="h-4.5 w-4.5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Academic Assistant</h3>
                  <span className="text-[10px] text-slate-400">Powered by Gemini - Context Aware</span>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto text-xs leading-relaxed modern-scrollbar bg-slate-950/30" role="log" aria-label="Chat messages" aria-live="polite">
              {chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3.5 rounded-2xl ${
                    msg.sender === 'user' 
                      ? 'bg-cyan-500 text-slate-950 font-semibold' 
                      : 'bg-slate-900 border border-slate-850 text-slate-200'
                  }`}>
                    {msg.sender === 'ai' ? (
                      <div className="whitespace-pre-line prose prose-invert prose-xs">
                        {msg.text}
                      </div>
                    ) : msg.text}
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-850 p-3 rounded-2xl flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" aria-hidden="true" />
                    <span>Analyzing academic parameters...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Footer Input */}
            <form onSubmit={handleSendMessage} className="bg-slate-900 border-t border-slate-800 p-4 flex gap-3">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about deadlines, GPAs, or chemical formulas..."
                aria-label="Ask the AI assistant a question"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500 text-slate-200"
              />
              <button 
                type="submit"
                disabled={aiLoading}
                aria-label="Send message"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 rounded-xl flex items-center justify-center font-bold"
              >
                <Send className="h-4.5 w-4.5" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT: GRADES */}
      {activeTab === 'grades' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Grade Card Sheet & GPA card */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">Term Grade Report</h2>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-lg">
                GPA: {reportCard?.summary?.gpa ?? '—'}
              </span>
            </div>

            {reportCardLoading ? (
              <div className="flex items-center justify-center py-12" aria-label="Loading grade data">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse" aria-label="Grade report table">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500">
                      <th className="py-2.5 font-semibold" scope="col">Subject Code</th>
                      <th className="py-2.5 font-semibold" scope="col">Subject Name</th>
                      <th className="py-2.5 font-semibold" scope="col">Score Obtained</th>
                      <th className="py-2.5 font-semibold" scope="col">Max</th>
                      <th className="py-2.5 font-semibold" scope="col">Grade</th>
                      <th className="py-2.5 font-semibold" scope="col">Grade Point</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {reportCard?.grades?.map((g: GradeData) => (
                    <tr key={g.id} className="hover:bg-slate-850/20">
                      <td className="py-3 font-mono">{g.subject_code}</td>
                      <td className="py-3 font-bold text-slate-200">{g.subject_name}</td>
                      <td className="py-3 font-mono font-bold">{g.marks_obtained}</td>
                      <td className="py-3 font-mono text-slate-500">{g.max_marks}</td>
                      <td className="py-3 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[9px] ${
                          g.letter_grade.startsWith('A') ? 'bg-emerald-950 text-emerald-400' : 'bg-cyan-950 text-cyan-400'
                        }`}>
                          {g.letter_grade}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-slate-300">{g.grade_point}</td>
                    </tr>
                  ))}
                  {(!reportCard?.grades || reportCard.grades.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">No grades registered for this term.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          </div>

          {/* AI Report Card Summary evaluation */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400" aria-hidden="true" />
              <h3 className="font-bold text-sm">AI Progress Evaluator</h3>
            </div>
            <div className="prose prose-invert prose-xs text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
              {reportSummary || 'Compiling grades summary evaluation...'}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIMETABLE SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Calendar className="h-5 w-5 text-cyan-400" aria-hidden="true" />
            <h2 className="text-lg font-bold">My Class Agenda Calendar</h2>
          </div>

          {scheduleLoading ? (
            <div className="flex items-center justify-center py-12" aria-label="Loading schedule">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((slot: ScheduleSlot) => (
              <div key={slot.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-200 text-sm block">{slot.subject_name}</span>
                  <span className="text-[10px] text-slate-400 block">Teacher: <span className="font-bold text-slate-300">{slot.teacher_name}</span></span>
                  <span className="text-[10px] text-cyan-400 font-semibold block">Room: {slot.room}</span>
                </div>

                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2.5 py-0.5 rounded-full inline-block">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][slot.day_of_week - 1]}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-1">{slot.start_time.slice(0,5)} - {slot.end_time.slice(0,5)}</span>
                </div>
              </div>
            ))}
            {schedule.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs italic w-full">
                No active timetable slots registered for your section grade.
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Assignments List */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Course Homework & Labs</h2>
            
            {assignmentsLoading ? (
              <div className="flex items-center justify-center py-12" aria-label="Loading assignments">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              </div>
            ) : (
            <div className="space-y-3.5">
              {assignments.map((as: Assignment) => {
                const sub = submissions.find(s => s.assignment_id === as.id);
                return (
                  <div key={as.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-200 text-sm block">{as.title}</span>
                      <p className="text-xs text-slate-400 leading-normal max-w-md">{as.description}</p>
                      <div className="flex gap-4 text-[10px] text-slate-500 font-mono pt-1">
                        <span>Subject: {as.subject_name}</span>
                        <span>Due: {as.due_date.split('T')[0]}</span>
                        <span>Max score: {as.max_marks}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {sub ? (
                        <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                          sub.status === 'Graded' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-cyan-950 text-cyan-400 border border-cyan-900'
                        }`}>
                          {sub.status === 'Graded' ? `Score: ${sub.marks_obtained}/${sub.max_marks}` : '✓ Uploaded'}
                        </span>
                      ) : (
                          <button
                            onClick={() => {
                              setSelectedAssign(as);
                              setFileUrl('');
                              setNotes('');
                            }}
                            aria-label={`Submit work for ${as.title}`}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                          >
                            <UploadCloud className="h-4 w-4" aria-hidden="true" />
                            <span>Submit Work</span>
                          </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {assignments.length === 0 && (
                <div className="text-center py-12 text-slate-500 text-xs italic">
                  No pending assignments published for this week.
                </div>
              )}
            </div>
          )}
          </div>

          {/* Homework Submission Box form */}
          {selectedAssign ? (
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-sm font-extrabold">Upload: {selectedAssign.title}</h2>
                <button onClick={() => setSelectedAssign(null)} aria-label="Cancel submission" className="text-slate-500 text-xs hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handleHomeworkSubmit} className="space-y-4 text-xs">
                <div>
                  <label htmlFor="fileUrl" className="text-slate-400 block mb-1">Simulated Cloud URL (PDF/DOC)</label>
                  <input
                    id="fileUrl"
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/homework-report.pdf"
                    aria-label="File URL for submission"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Leaves default simulated link if left empty.</span>
                </div>

                <div>
                  <label htmlFor="notes" className="text-slate-400 block mb-1">Student notes to professor</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    aria-label="Submission notes"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs"
                    placeholder="e.g. Worked with formulas on page 3..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  aria-label="Upload submission"
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                >
                  {loading ? 'Submitting...' : 'Upload Submission'}
                </button>
              </form>
            </div>
          ) : (
            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-center text-center text-slate-500 text-xs italic py-12">
              Select a pending assignment from the left roster to open the file submission panel.
            </div>
          )}
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
                  <Search className="h-3.5 w-3.5 text-slate-500" />
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
      )}
    </div>
  );
}
