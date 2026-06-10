import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import { useAuthStore } from '../../../store/authStore.js';
import { 
  CheckSquare, Award, BookOpen, Clock, Check, Save, Plus, 
  Search, CalendarDays, FileText, ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';

export default function TeacherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'attendance' | 'grades' | 'assignments' | 'schedule'>('attendance');

  useEffect(() => {
    const path = location.pathname;
    if (path.endsWith('/exams')) {
      setActiveTab('grades');
    } else if (path.endsWith('/assignments')) {
      setActiveTab('assignments');
    } else if (path.endsWith('/timetable')) {
      setActiveTab('schedule');
    } else {
      setActiveTab('attendance');
    }
  }, [location.pathname]);
  const { profile } = useAuthStore();

  // Lists from DB
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  // Selection states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState('');

  // Roster inputs
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, { status: 'Present' | 'Absent' | 'Late' | 'Excused'; remarks: string }>>({});
  const [gradesRecords, setGradesRecords] = useState<Record<string, { marks: number; remarks: string }>>({});

  // Assignment publish form
  const [assignForm, setAssignForm] = useState({
    title: '', description: '', due_date: '', max_marks: ''
  });

  // Grading form modal / helper
  const [activeSubmission, setActiveSubmission] = useState<any>(null);
  const [gradingInput, setGradingInput] = useState({ marks: '', remarks: '' });

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeacherSchedule();
    fetchSchoolData();
    fetchExams();
    fetchAssignments();
  }, []);

  // Fetch student lists when class/section matches
  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents(selectedClass, selectedSection);
    }
  }, [selectedClass, selectedSection]);

  const fetchTeacherSchedule = async () => {
    if (!profile?.id) return;
    try {
      const res = await api.get(`/timetables/teacher/${profile.id}`);
      setSchedule(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSchoolData = async () => {
    try {
      const cls = await api.get('/school/classes');
      const sec = await api.get('/school/sections');
      const sub = await api.get('/school/subjects');
      setClasses(cls.data.data);
      setSections(sec.data.data);
      setSubjects(sub.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await api.get('/exams');
      setExams(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await api.get('/assignments');
      setAssignments(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async (classId: string, sectionId: string) => {
    try {
      const res = await api.get(`/students?classId=${classId}&sectionId=${sectionId}`);
      setStudents(res.data.data);
      
      // Initialize empty logs maps
      const attInit: typeof attendanceRecords = {};
      const gradeInit: typeof gradesRecords = {};
      res.data.data.forEach((std: any) => {
        attInit[std.id] = { status: 'Present', remarks: '' };
        gradeInit[std.id] = { marks: 80, remarks: '' };
      });
      setAttendanceRecords(attInit);
      setGradesRecords(gradeInit);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSubmissions = async (assignId: string) => {
    try {
      const res = await api.get(`/assignments/submissions?assignmentId=${assignId}`);
      setSubmissions(res.data.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Submit attendance records
  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection) return;
    
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const records = Object.keys(attendanceRecords).map(studentId => ({
      student_id: studentId,
      status: attendanceRecords[studentId].status,
      remarks: attendanceRecords[studentId].remarks
    }));

    try {
      await api.post('/attendance', {
        date: attendanceDate,
        class_id: selectedClass,
        section_id: selectedSection,
        subject_id: selectedSubject || null,
        records
      });
      setSuccessMsg('Attendance sheet logged successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit attendance.');
    } finally {
      setLoading(false);
    }
  };

  // Submit Gradebook
  const handleGradesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam || !selectedSubject) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Record grade for each student synchronously
      for (const stdId of Object.keys(gradesRecords)) {
        await api.post('/exams/grade', {
          exam_id: selectedExam,
          student_id: stdId,
          subject_id: selectedSubject,
          marks_obtained: gradesRecords[stdId].marks,
          max_marks: 100, // standard conversion
          remarks: gradesRecords[stdId].remarks
        });
      }
      setSuccessMsg('Exam grades recorded successfully.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to record grades.');
    } finally {
      setLoading(false);
    }
  };

  // Publish Homework Assignment
  const handlePublishAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSection || !selectedSubject) {
      alert('Please select Class, Section, and Subject in selections top-bar first.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.post('/assignments', {
        title: assignForm.title,
        description: assignForm.description,
        subject_id: selectedSubject,
        class_id: selectedClass,
        section_id: selectedSection,
        due_date: new Date(assignForm.due_date).toISOString(),
        max_marks: parseFloat(assignForm.max_marks)
      });
      setSuccessMsg('Homework assignment published successfully.');
      fetchAssignments();
      setAssignForm({ title: '', description: '', due_date: '', max_marks: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish assignment.');
    } finally {
      setLoading(false);
    }
  };

  // Grade Homework Submission
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmission) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await api.put(`/assignments/grade/${activeSubmission.id}`, {
        marks_obtained: parseFloat(gradingInput.marks),
        teacher_remarks: gradingInput.remarks
      });
      setSuccessMsg('Homework graded.');
      fetchSubmissions(selectedAssignment);
      setActiveSubmission(null);
      setGradingInput({ marks: '', remarks: '' });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to grade submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Portal</h1>
          <p className="text-slate-400 text-sm mt-1">Hello Professor {profile?.last_name || 'Connor'}! Input roll calls, grade term papers, and post homework tasks.</p>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
          {[
            { id: 'attendance', label: 'Attendance', icon: <CheckSquare className="h-4 w-4" />, path: '/dashboard/attendance' },
            { id: 'grades', label: 'Grades book', icon: <Award className="h-4 w-4" />, path: '/dashboard/exams' },
            { id: 'assignments', label: 'Assignments', icon: <BookOpen className="h-4 w-4" />, path: '/dashboard/assignments' },
            { id: 'schedule', label: 'Schedule', icon: <Clock className="h-4 w-4" />, path: '/dashboard/timetable' },
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

      {/* Global Class Section Subject Selections Header */}
      {activeTab !== 'schedule' && (
        <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-semibold">
          <div className="space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Select Class</span>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSelectedSection('');
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 outline-none"
            >
              <option value="">Choose Class</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Select Section</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 outline-none"
            >
              <option value="">Choose Section</option>
              {sections.filter(s => s.class_id === selectedClass).map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 block uppercase tracking-wider text-[10px]">Subject (optional/required)</span>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 outline-none"
            >
              <option value="">All Subjects / Daily Roster</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div className="space-y-1 flex flex-col justify-end">
            {selectedClass && selectedSection ? (
              <span className="text-emerald-400 text-[10px] bg-emerald-950/60 border border-emerald-900 px-3 py-2.5 rounded-xl font-bold block text-center">
                ✓ Student Roster loaded ({students.length})
              </span>
            ) : (
              <span className="text-slate-500 text-[10px] bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl block text-center italic">
                Choose Class & Section above
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800/45 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-950/60 border border-rose-800/45 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB CONTENT: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold">Daily attendance sheet</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Date:</span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 outline-none font-mono text-xs text-slate-200"
              />
            </div>
          </div>

          {students.length > 0 ? (
            <form onSubmit={handleAttendanceSubmit} className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500">
                      <th className="py-2.5 font-semibold">Roll No</th>
                      <th className="py-2.5 font-semibold">Student Name</th>
                      <th className="py-2.5 text-center font-semibold">Status Selection</th>
                      <th className="py-2.5 font-semibold">Remarks (reasons/notes)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {students.map((std) => {
                      const record = attendanceRecords[std.id] || { status: 'Present', remarks: '' };
                      return (
                        <tr key={std.id} className="hover:bg-slate-850/20">
                          <td className="py-3 font-mono">{std.roll_number || 'N/A'}</td>
                          <td className="py-3 font-bold text-slate-200">{std.first_name} {std.last_name}</td>
                          <td className="py-3 text-center">
                            <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-850">
                              {(['Present', 'Absent', 'Late', 'Excused'] as const).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => setAttendanceRecords({
                                    ...attendanceRecords,
                                    [std.id]: { ...record, status: st }
                                  })}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                                    record.status === st
                                      ? st === 'Present' ? 'bg-emerald-500 text-slate-950' : 
                                        st === 'Absent' ? 'bg-rose-500 text-slate-950' : 
                                        st === 'Late' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-white'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              placeholder="e.g. sick leave"
                              value={record.remarks}
                              onChange={(e) => setAttendanceRecords({
                                ...attendanceRecords,
                                [std.id]: { ...record, remarks: e.target.value }
                              })}
                              className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 w-full text-xs outline-none focus:border-cyan-500 text-slate-300"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800/60">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition text-xs shadow-md flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Submit Attendance Sheet</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              Please choose a class and section from the selections bar above to load the student registry.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: GRADES */}
      {activeTab === 'grades' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold">Grade Book Score sheets</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Exam Code:</span>
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 outline-none text-xs text-slate-200"
              >
                <option value="">Select Exam</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
          </div>

          {students.length > 0 && selectedExam && selectedSubject ? (
            <form onSubmit={handleGradesSubmit} className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800/80 text-slate-500">
                      <th className="py-2.5 font-semibold">Roll No</th>
                      <th className="py-2.5 font-semibold">Student Name</th>
                      <th className="py-2.5 font-semibold">Marks Obtained (/100)</th>
                      <th className="py-2.5 font-semibold">Performance Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {students.map((std) => {
                      const grade = gradesRecords[std.id] || { marks: 80, remarks: '' };
                      return (
                        <tr key={std.id} className="hover:bg-slate-850/20">
                          <td className="py-3 font-mono">{std.roll_number || 'N/A'}</td>
                          <td className="py-3 font-bold text-slate-200">{std.first_name} {std.last_name}</td>
                          <td className="py-3">
                            <input
                              type="number"
                              min={0} max={100}
                              value={grade.marks}
                              onChange={(e) => setGradesRecords({
                                ...gradesRecords,
                                [std.id]: { ...grade, marks: parseFloat(e.target.value) || 0 }
                              })}
                              className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 w-24 text-xs font-mono font-bold text-cyan-400 outline-none focus:border-cyan-500 text-center"
                            />
                          </td>
                          <td className="py-3">
                            <input
                              type="text"
                              placeholder="e.g. Excellent chemistry concepts"
                              value={grade.remarks}
                              onChange={(e) => setGradesRecords({
                                ...gradesRecords,
                                [std.id]: { ...grade, remarks: e.target.value }
                              })}
                              className="bg-slate-950 border border-slate-850 rounded-lg p-1.5 w-full text-xs outline-none focus:border-cyan-500 text-slate-300"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800/60">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition text-xs shadow-md flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Gradebook Records</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs italic">
              Please choose Class, Section, Subject in the top bar, and choose an Exam in the dropdown, to load the Grade Book.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Create assignment form */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Plus className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold">Publish Assignment</h2>
            </div>

            <form onSubmit={handlePublishAssignment} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Assignment Title</label>
                <input
                  type="text" required
                  value={assignForm.title}
                  onChange={(e) => setAssignForm({ ...assignForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="e.g. Lab Report 2"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Description / Instructions</label>
                <textarea
                  value={assignForm.description}
                  onChange={(e) => setAssignForm({ ...assignForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="Write clear expectations..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Due Date & Time</label>
                  <input
                    type="datetime-local" required
                    value={assignForm.due_date}
                    onChange={(e) => setAssignForm({ ...assignForm, due_date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Max Marks</label>
                  <input
                    type="number" required
                    value={assignForm.max_marks}
                    onChange={(e) => setAssignForm({ ...assignForm, max_marks: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="e.g. 50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
              >
                {loading ? 'Publishing...' : 'Publish Homework'}
              </button>
            </form>
          </div>

          {/* Submissions tracking list */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">Homework submissions tracker</h2>
              <select
                value={selectedAssignment}
                onChange={(e) => {
                  setSelectedAssignment(e.target.value);
                  fetchSubmissions(e.target.value);
                }}
                className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 outline-none text-xs text-slate-200"
              >
                <option value="">Select Assignment</option>
                {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>

            {selectedAssignment ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-500">
                        <th className="py-2.5 font-semibold">Student Name</th>
                        <th className="py-2.5 font-semibold">Submission Date</th>
                        <th className="py-2.5 font-semibold">Files</th>
                        <th className="py-2.5 font-semibold">status</th>
                        <th className="py-2.5 font-semibold">Marks Score</th>
                        <th className="py-2.5 text-right font-semibold">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {submissions.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-850/20">
                          <td className="py-3 font-bold text-slate-200">{sub.student_name}</td>
                          <td className="py-3 font-mono">{sub.submission_date.split('T')[0]}</td>
                          <td className="py-3 text-cyan-400 hover:underline">
                            {sub.file_url ? (
                              <a href="#" onClick={(e) => { e.preventDefault(); alert(`Downloading simulated submission file: ${sub.file_url}`); }}>
                                View Report.pdf
                              </a>
                            ) : 'No file'}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                              sub.status === 'Graded' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 font-mono font-bold text-cyan-400">
                            {sub.marks_obtained !== null ? `${sub.marks_obtained}/${sub.max_marks}` : '—'}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => {
                                setActiveSubmission(sub);
                                setGradingInput({ marks: String(sub.marks_obtained || ''), remarks: sub.teacher_remarks || '' });
                              }}
                              className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5 ml-auto"
                            >
                              <span>Review</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {submissions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500">No submissions uploaded for this task yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Inline Review card */}
                {activeSubmission && (
                  <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                      <span className="font-extrabold text-xs">Review: {activeSubmission.student_name}</span>
                      <button onClick={() => setActiveSubmission(null)} className="text-slate-500 hover:text-white">✕ Close</button>
                    </div>
                    <form onSubmit={handleGradeSubmission} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="text-xs">
                        <label className="text-slate-500 block mb-1">Score Obtained (max: {activeSubmission.max_marks})</label>
                        <input
                          type="number" required
                          value={gradingInput.marks}
                          onChange={(e) => setGradingInput({ ...gradingInput, marks: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-2 w-full text-xs font-mono text-cyan-400 font-bold"
                          placeholder="e.g. 45"
                        />
                      </div>
                      <div className="text-xs">
                        <label className="text-slate-500 block mb-1">Teacher Feedback remarks</label>
                        <input
                          type="text"
                          value={gradingInput.remarks}
                          onChange={(e) => setGradingInput({ ...gradingInput, remarks: e.target.value })}
                          className="bg-slate-950 border border-slate-800 rounded-xl p-2 w-full text-xs text-slate-200"
                          placeholder="Well structured report"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2 rounded-xl text-xs flex justify-center items-center gap-1"
                      >
                        <Check className="h-4 w-4" /> Save Score
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs italic">
                Choose an assignment in the dropdown above to track homework uploads.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <CalendarDays className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold">My Timetable Schedule</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedule.map((slot) => (
              <div key={slot.id} className="p-4 bg-slate-950/40 border border-slate-800 rounded-2xl flex justify-between items-center">
                <div className="space-y-1">
                  <span className="font-extrabold text-slate-200 text-sm block">{slot.subject_name} ({slot.subject_code})</span>
                  <span className="text-xs text-slate-400 block">Class: <span className="font-bold text-slate-300">{slot.class_name} - {slot.section_name}</span></span>
                  <span className="text-[10px] text-cyan-400 font-semibold block">Room Location: {slot.room}</span>
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
                No timetable periods assigned to you this term.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
