import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import { useAuthStore } from '../../../store/authStore.js';
import { 
  Sparkles, Award, Clock, BookOpen, Send, Loader2, Calendar, 
  CheckCircle2, FileText, UploadCloud, TrendingUp, HelpCircle, AlertCircle
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export default function StudentDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'grades' | 'schedule' | 'assignments'>('overview');

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/exams')) {
      setActiveTab('grades');
    } else if (path.endsWith('/assignments')) {
      setActiveTab('assignments');
    } else if (path.endsWith('/timetable')) {
      setActiveTab('schedule');
    } else {
      setActiveTab('overview');
    }
  }, [location.pathname]);
  const { profile } = useAuthStore();

  // API states
  const [attendance, setAttendance] = useState<any>(null);
  const [reportCard, setReportCard] = useState<any>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [reportSummary, setReportSummary] = useState<string>('');

  // AI chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I'm your EduSync AI Assistant. Ask me anything about your chemistry exam grades, upcoming due assignments, or attendance rates." }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Homework submit state
  const [selectedAssign, setSelectedAssign] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchAttendance();
      fetchReportCard();
      fetchSchedule();
      fetchAssignments();
      fetchAiInsights();
    }
  }, [profile]);

  const fetchAttendance = async () => {
    try {
      const res = await api.get(`/attendance/student/${profile.id}`);
      setAttendance(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReportCard = async () => {
    try {
      const res = await api.get(`/exams/report-card/${profile.id}`);
      setReportCard(res.data.data);
      // Fetch AI report summary once grades load
      fetchAiReportSummary();
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchedule = async () => {
    if (!profile?.class_id || !profile?.section_id) return;
    try {
      const res = await api.get(`/timetables/class/${profile.class_id}/${profile.section_id}`);
      setSchedule(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssignments = async () => {
    if (!profile?.class_id || !profile?.section_id) return;
    try {
      const res = await api.get(`/assignments?classId=${profile.class_id}&sectionId=${profile.section_id}`);
      setAssignments(res.data.data);
      
      // Fetch student's own submissions
      const subRes = await api.get('/assignments/submissions');
      setSubmissions(subRes.data.data.filter((s: any) => s.student_id === profile.id));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAiInsights = async () => {
    try {
      const res = await api.get(`/ai/insights/${profile.id}`);
      setAiInsights(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAiReportSummary = async () => {
    try {
      const res = await api.get(`/ai/report-summary/${profile.id}`);
      setReportSummary(res.data.summary);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit Homework Roster
  const handleHomeworkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssign) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/assignments/submit', {
        assignment_id: selectedAssign.id,
        file_url: fileUrl || `http://school-storage.internal/uploads/assignment_${Date.now()}.pdf`,
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
  };

  // AI Chat Request
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setAiLoading(true);

    try {
      const res = await api.post('/ai/assistant', {
        question: userText,
        studentId: profile.id
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I ran into an issue connecting with the context router. Please check your credentials." }]);
    } finally {
      setAiLoading(false);
    }
  };

  // Attendance rate indicator colors
  const attRate = attendance?.summary?.attendanceRate || 100;
  const pieData = [
    { name: 'Attended', value: attRate },
    { name: 'Missed', value: Math.max(0, 100 - attRate) }
  ];
  const COLORS = ['#06b6d4', '#1e293b'];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Student Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Class: {profile?.class_name} - {profile?.section_name} | Admission ID: {profile?.admission_number}</p>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'overview', label: 'AI Assistant', icon: <Sparkles className="h-4 w-4" />, path: '/dashboard' },
            { id: 'grades', label: 'Grades & GPA', icon: <Award className="h-4 w-4" />, path: '/dashboard/exams' },
            { id: 'schedule', label: 'Schedule', icon: <Clock className="h-4 w-4" />, path: '/dashboard/timetable' },
            { id: 'assignments', label: 'Assignments', icon: <BookOpen className="h-4 w-4" />, path: '/dashboard/assignments' },
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
          <AlertCircle className="h-5 w-5" />
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
                {/* Center text */}
                <div className="absolute text-center">
                  <span className="text-3xl font-black">{attRate}%</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 mt-2">
                Present: {attendance?.summary?.present || 0} | Absent: {attendance?.summary?.absent || 0}
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
                <h3 className="font-bold text-sm">AI Performance Trends</h3>
              </div>
              {aiInsights ? (
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
                <span className="text-[10px] text-slate-500 block italic">Generating insights...</span>
              )}
            </div>
          </div>

          {/* Right panel: AI Academic Assistant Chatbot (Lucide + Form) */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col justify-between overflow-hidden shadow-xl h-[420px] lg:h-auto">
            {/* Chat Header */}
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-cyan-950 border border-cyan-800 rounded-xl flex items-center justify-center text-cyan-400">
                  <Sparkles className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Academic Assistant</h3>
                  <span className="text-[10px] text-slate-400">Powered by Gemini - Context Aware</span>
                </div>
              </div>
            </div>

            {/* Messages body */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto text-xs leading-relaxed modern-scrollbar bg-slate-950/30">
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
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
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
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-cyan-500 text-slate-200"
              />
              <button 
                type="submit"
                disabled={aiLoading}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 rounded-xl flex items-center justify-center font-bold"
              >
                <Send className="h-4.5 w-4.5" />
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
                GPA: {reportCard?.summary?.gpa || '—'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500">
                    <th className="py-2.5 font-semibold">Subject Code</th>
                    <th className="py-2.5 font-semibold">Subject Name</th>
                    <th className="py-2.5 font-semibold">Score Obtained</th>
                    <th className="py-2.5 font-semibold">Max</th>
                    <th className="py-2.5 font-semibold">Grade</th>
                    <th className="py-2.5 font-semibold">Grade Point</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {reportCard?.grades?.map((g: any) => (
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
          </div>

          {/* AI Report Card Summary evaluation */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <Sparkles className="h-4.5 w-4.5 text-cyan-400" />
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
            <Calendar className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold">My Class Agenda Calendar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((slot) => (
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
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Assignments List */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Course Homework & Labs</h2>
            
            <div className="space-y-3.5">
              {assignments.map((as) => {
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
                          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition"
                        >
                          <UploadCloud className="h-4 w-4" />
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
          </div>

          {/* Homework Submission Box form */}
          {selectedAssign ? (
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-sm font-extrabold">Upload: {selectedAssign.title}</h2>
                <button onClick={() => setSelectedAssign(null)} className="text-slate-500 text-xs hover:text-white">✕ Cancel</button>
              </div>

              <form onSubmit={handleHomeworkSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Simulated Cloud URL (PDF/DOC)</label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://drive.google.com/homework-report.pdf"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">Leaves default simulated link if left empty.</span>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Student notes to professor</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-slate-200 text-xs"
                    placeholder="e.g. Worked with formulas on page 3..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
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
    </div>
  );
}
