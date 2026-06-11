import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../../utils/api.js';
import {
  Users, BookOpen, Landmark, Building, Calendar, ArrowRight,
  TrendingUp, Activity, Plus, Search, Filter, AlertCircle, Trash2,
  CalendarDays, ShieldCheck, CheckCircle2, CreditCard, Clock, Award, BookCopy
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useAuthStore } from '../../../store/authStore.js';

interface Overview {
  counters?: {
    students?: number;
    teachers?: number;
    departments?: number;
    totalRevenue?: number;
  };
  revenueTrends?: { name: string; value: number }[];
  attendanceStats?: { name: string; value: number }[];
  recentActivities?: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: string;
  text: string;
  time: string;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  admission_number: string;
  roll_number: string;
  class_id: string;
  section_id: string;
  class_name: string;
  section_name: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  status: string;
  dob: string;
  gender: string;
  address: string;
}

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: string;
  department_name: string;
  qualification?: string;
  workload: number;
  status: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  hod_id: string;
  hod_name?: string;
  faculty_count: number;
  student_count: number;
  subjects_count: number;
}

interface ClassItem {
  id: string;
  name: string;
}

interface Section {
  id: string;
  name: string;
  class_id: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
  department_name?: string;
  credits: number;
}

interface FeeStructure {
  id: string;
  name: string;
  class_id: string;
  class_name: string;
  amount: number;
  due_date: string;
  academic_year_id: string;
  academic_year_name: string;
}

interface Timetable {
  id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  subject_name: string;
  teacher_id: string;
  teacher_name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  room: string;
}

interface StudentFormState {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  admission_number: string;
  roll_number: string;
  class_id: string;
  section_id: string;
  parent_email: string;
  dob: string;
  gender: string;
  address: string;
}

interface TeacherFormState {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  department_id: string;
  qualification: string;
}

interface DepartmentFormState {
  name: string;
  code: string;
  hod_id: string;
}

interface TimetableFormState {
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  room: string;
}

interface FeeFormState {
  name: string;
  class_id: string;
  amount: string;
  due_date: string;
  academic_year_id: string;
}

interface SubjectFormState {
  name: string;
  code: string;
  department_id: string;
  credits: string;
}

interface Notification {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface TabDef {
  id: TabId;
  label: string;
}

type TabId = 'overview' | 'students' | 'teachers' | 'departments' | 'timetables' | 'billing';

const TABS: TabDef[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'students', label: 'Students' },
  { id: 'teachers', label: 'Faculty' },
  { id: 'departments', label: 'Departments' },
  { id: 'timetables', label: 'Timetables' },
  { id: 'billing', label: 'Finance' },
];

const COLORS = ['#06b6d4', '#3b82f6', '#f59e0b', '#ef4444'];

const DEFAULT_STUDENT_FORM: StudentFormState = {
  first_name: '', last_name: '', email: '', password: '',
  admission_number: '', roll_number: '', class_id: '', section_id: '',
  parent_email: '', dob: '2010-01-01', gender: 'Male', address: '',
};

const DEFAULT_TEACHER_FORM: TeacherFormState = {
  first_name: '', last_name: '', email: '', password: '',
  phone: '', department_id: '', qualification: '',
};

const DEFAULT_DEPT_FORM: DepartmentFormState = { name: '', code: '', hod_id: '' };

const DEFAULT_TT_FORM: TimetableFormState = {
  class_id: '', section_id: '', subject_id: '', teacher_id: '',
  day_of_week: '1', start_time: '09:00', end_time: '10:00', room: '',
};

const DEFAULT_FEE_FORM: FeeFormState = {
  name: '', class_id: '', amount: '', due_date: '2026-07-01', academic_year_id: 'ay-1',
};

const DEFAULT_SUB_FORM: SubjectFormState = {
  name: '', code: '', department_id: '', credits: '3',
};

function AdminDashboard() {
  const { user } = useAuthStore();
  const userRole = user?.role;
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const nextNotifId = useRef(0);

  const addNotification = useCallback((type: 'success' | 'error', message: string) => {
    const id = nextNotifId.current++;
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  }, []);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetables, setTimetables] = useState<Timetable[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  const [studentSearch, setStudentSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [loading, setLoading] = useState(false);

  const [stdForm, setStdForm] = useState<StudentFormState>(DEFAULT_STUDENT_FORM);
  const [teaForm, setTeaForm] = useState<TeacherFormState>(DEFAULT_TEACHER_FORM);
  const [deptForm, setDeptForm] = useState<DepartmentFormState>(DEFAULT_DEPT_FORM);
  const [ttForm, setTtForm] = useState<TimetableFormState>(DEFAULT_TT_FORM);
  const [feeForm, setFeeForm] = useState<FeeFormState>(DEFAULT_FEE_FORM);
  const [subForm, setSubForm] = useState<SubjectFormState>(DEFAULT_SUB_FORM);

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null);
  const [editingTimetable, setEditingTimetable] = useState<Timetable | null>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const [overviewRes, studentsRes, teachersRes, departmentsRes] = await Promise.all([
          api.get('/analytics/overview', { signal: controller.signal }),
          api.get('/students', { signal: controller.signal }),
          api.get('/teachers', { signal: controller.signal }),
          api.get('/departments', { signal: controller.signal }),
        ]);
        if (!controller.signal.aborted) {
          setOverview(overviewRes.data.data);
          setStudents(studentsRes.data.data);
          setTeachers(teachersRes.data.data);
          setDepartments(departmentsRes.data.data);
        }

        const [classesRes, sectionsRes, subjectsRes, feeRes] = await Promise.all([
          api.get('/school/classes', { signal: controller.signal }),
          api.get('/school/sections', { signal: controller.signal }),
          api.get('/school/subjects', { signal: controller.signal }),
          api.get('/payments/structures', { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setClasses(classesRes.data.data);
        setSections(sectionsRes.data.data);
        setSubjects(subjectsRes.data.data);
        setFeeStructures(feeRes.data.data);

        if (classesRes.data.data.length > 0 && sectionsRes.data.data.length > 0) {
          const ttRes = await api.get(`/timetables/class/${classesRes.data.data[0].id}/${sectionsRes.data.data[0].id}`, {
            signal: controller.signal,
          });
          if (!controller.signal.aborted) {
            setTimetables(ttRes.data.data);
          }
        }
      } catch (e: any) {
        if (e?.name !== 'AbortError' && !controller.signal.aborted) {
          addNotification('error', 'Failed to load dashboard data. Please refresh the page.');
        }
      }
    };

    load();

    return () => controller.abort();
  }, [addNotification]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab as TabId);
    }
  }, [location.state?.tab]);

  const fetchClassTimetable = useCallback(async (classId: string, sectionId: string) => {
    try {
      const res = await api.get(`/timetables/class/${classId}/${sectionId}`);
      setTimetables(res.data.data);
    } catch {
      addNotification('error', 'Failed to load timetable data.');
    }
  }, [addNotification]);

  const handleStudentAdmission = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingStudent) {
        const payload = { ...stdForm };
        if (!payload.password) delete (payload as any).password;
        await api.put(`/students/${editingStudent.id}`, payload);
        addNotification('success', 'Student updated successfully.');
      } else {
        await api.post('/students', stdForm);
        addNotification('success', 'Student admitted successfully.');
      }
      const res = await api.get('/students');
      setStudents(res.data.data);
      const overviewRes = await api.get('/analytics/overview');
      setOverview(overviewRes.data.data);
      setStdForm(DEFAULT_STUDENT_FORM);
      setEditingStudent(null);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || (editingStudent ? 'Failed to update student.' : 'Failed to admit student.'));
    } finally {
      setLoading(false);
    }
  }, [stdForm, editingStudent, addNotification]);

  const handleTeacherRegistration = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const phonePattern = /^\d{10}$/;
    if (teaForm.phone && !phonePattern.test(teaForm.phone)) {
      addNotification('error', 'Phone must be exactly 10 digits.');
      setLoading(false);
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(teaForm.email)) {
      addNotification('error', 'Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      if (editingTeacher) {
        const payload = { ...teaForm };
        if (!payload.password) delete (payload as any).password;
        await api.put(`/teachers/${editingTeacher.id}`, payload);
        addNotification('success', 'Teacher updated successfully.');
      } else {
        await api.post('/teachers', teaForm);
        addNotification('success', 'Teacher registered successfully.');
      }
      const res = await api.get('/teachers');
      setTeachers(res.data.data);
      const overviewRes = await api.get('/analytics/overview');
      setOverview(overviewRes.data.data);
      setTeaForm(DEFAULT_TEACHER_FORM);
      setEditingTeacher(null);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || (editingTeacher ? 'Failed to update teacher.' : 'Failed to register teacher.'));
    } finally {
      setLoading(false);
    }
  }, [teaForm, editingTeacher, addNotification]);

  const handleCreateDept = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingDepartment) {
        await api.put(`/departments/${editingDepartment.id}/hod`, { hod_id: deptForm.hod_id || null });
        addNotification('success', 'Department HOD updated.');
      } else {
        await api.post('/departments', deptForm);
        addNotification('success', 'Department created.');
      }
      const res = await api.get('/departments');
      setDepartments(res.data.data);
      const overviewRes = await api.get('/analytics/overview');
      setOverview(overviewRes.data.data);
      setDeptForm(DEFAULT_DEPT_FORM);
      setEditingDepartment(null);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || (editingDepartment ? 'Failed to update department.' : 'Failed to create department.'));
    } finally {
      setLoading(false);
    }
  }, [deptForm, editingDepartment, addNotification]);

  const handleScheduleSlot = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTimetable) {
        await api.put(`/timetables/${editingTimetable.id}`, {
          ...ttForm,
          day_of_week: parseInt(ttForm.day_of_week, 10),
          start_time: `${ttForm.start_time}:00`,
          end_time: `${ttForm.end_time}:00`,
        });
        addNotification('success', 'Timetable slot updated.');
      } else {
        await api.post('/timetables', {
          ...ttForm,
          day_of_week: parseInt(ttForm.day_of_week, 10),
          start_time: `${ttForm.start_time}:00`,
          end_time: `${ttForm.end_time}:00`,
        });
        addNotification('success', 'Timetable slot scheduled.');
      }
      if (ttForm.class_id && ttForm.section_id) {
        fetchClassTimetable(ttForm.class_id, ttForm.section_id);
      }
      setTtForm(DEFAULT_TT_FORM);
      setEditingTimetable(null);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || 'Conflict detected or slot scheduling failed.');
    } finally {
      setLoading(false);
    }
  }, [ttForm, editingTimetable, fetchClassTimetable, addNotification]);

  const handleCreateFee = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountVal = feeForm.amount ? parseFloat(feeForm.amount) : 0;
      if (editingFee) {
        await api.put(`/payments/structures/${editingFee.id}`, {
          name: feeForm.name,
          class_id: feeForm.class_id || null,
          amount: amountVal,
          due_date: feeForm.due_date,
          academic_year_id: feeForm.academic_year_id || 'ay-1',
        });
        addNotification('success', 'Fee structure updated.');
      } else {
        await api.post('/payments/structures', {
          name: feeForm.name,
          class_id: feeForm.class_id || null,
          amount: amountVal,
          due_date: feeForm.due_date,
          academic_year_id: 'ay-1',
        });
        addNotification('success', 'Fee structure declared.');
      }
      const res = await api.get('/payments/structures');
      setFeeStructures(res.data.data);
      setFeeForm(DEFAULT_FEE_FORM);
      setEditingFee(null);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || (editingFee ? 'Failed to update fee structure.' : 'Failed to create fee structure.'));
    } finally {
      setLoading(false);
    }
  }, [feeForm, editingFee, addNotification]);

  const handleCreateSubject = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSubject) {
        await api.put(`/school/subjects/${editingSubject.id}`, {
          ...subForm,
          credits: parseInt(subForm.credits, 10) || 3,
        });
        addNotification('success', 'Subject updated successfully.');
      } else {
        await api.post('/school/subjects', {
          ...subForm,
          credits: parseInt(subForm.credits, 10) || 3,
        });
        addNotification('success', 'Subject declared successfully.');
      }
      const res = await api.get('/school/subjects');
      setSubjects(res.data.data);
      setSubForm(DEFAULT_SUB_FORM);
      setEditingSubject(null);
    } catch (err: any) {
      addNotification('error', err.response?.data?.message || (editingSubject ? 'Failed to update subject.' : 'Failed to create subject.'));
    } finally {
      setLoading(false);
    }
  }, [subForm, editingSubject, addNotification]);

  const startEditStudent = useCallback((std: Student) => {
    setEditingStudent(std);
    setStdForm({
      first_name: std.first_name,
      last_name: std.last_name,
      email: std.email,
      password: '',
      admission_number: std.admission_number,
      roll_number: std.roll_number,
      class_id: std.class_id,
      section_id: std.section_id,
      parent_email: std.parent_email || '',
      dob: std.dob?.split('T')[0] || '2010-01-01',
      gender: std.gender,
      address: std.address || '',
    });
  }, []);

  const cancelEditStudent = useCallback(() => {
    setEditingStudent(null);
    setStdForm(DEFAULT_STUDENT_FORM);
  }, []);

  const startEditTeacher = useCallback((t: Teacher) => {
    setEditingTeacher(t);
    setTeaForm({
      first_name: t.first_name,
      last_name: t.last_name,
      email: t.email,
      password: '',
      phone: t.phone || '',
      department_id: t.department_id,
      qualification: t.qualification || '',
    });
  }, []);

  const cancelEditTeacher = useCallback(() => {
    setEditingTeacher(null);
    setTeaForm(DEFAULT_TEACHER_FORM);
  }, []);

  const startEditDept = useCallback((dept: Department) => {
    setEditingDepartment(dept);
    setDeptForm({
      name: dept.name,
      code: dept.code,
      hod_id: dept.hod_id || '',
    });
  }, []);

  const cancelEditDept = useCallback(() => {
    setEditingDepartment(null);
    setDeptForm(DEFAULT_DEPT_FORM);
  }, []);

  const startEditSubject = useCallback((sub: Subject) => {
    setEditingSubject(sub);
    setSubForm({
      name: sub.name,
      code: sub.code,
      department_id: sub.department_id,
      credits: String(sub.credits),
    });
  }, []);

  const cancelEditSubject = useCallback(() => {
    setEditingSubject(null);
    setSubForm(DEFAULT_SUB_FORM);
  }, []);

  const startEditFee = useCallback((fee: FeeStructure) => {
    setEditingFee(fee);
    setFeeForm({
      name: fee.name,
      class_id: fee.class_id || '',
      amount: String(fee.amount),
      due_date: fee.due_date?.split('T')[0] || '2026-07-01',
      academic_year_id: fee.academic_year_id,
    });
  }, []);

  const cancelEditFee = useCallback(() => {
    setEditingFee(null);
    setFeeForm(DEFAULT_FEE_FORM);
  }, []);

  const startEditTimetable = useCallback((slot: Timetable) => {
    setEditingTimetable(slot);
    setTtForm({
      class_id: slot.class_id,
      section_id: slot.section_id,
      subject_id: slot.subject_id,
      teacher_id: slot.teacher_id,
      day_of_week: String(slot.day_of_week),
      start_time: slot.start_time?.slice(0, 5) || '09:00',
      end_time: slot.end_time?.slice(0, 5) || '10:00',
      room: slot.room,
    });
  }, []);

  const cancelEditTimetable = useCallback(() => {
    setEditingTimetable(null);
    setTtForm(DEFAULT_TT_FORM);
  }, []);

  const handleDeleteStudent = useCallback(async (id: string) => {
    try {
      await api.delete(`/students/${id}`);
      addNotification('success', 'Student deleted successfully.');
      const res = await api.get('/students');
      setStudents(res.data.data);
      const overviewRes = await api.get('/analytics/overview');
      setOverview(overviewRes.data.data);
    } catch {
      addNotification('error', 'Failed to delete student record.');
    }
  }, [addNotification]);

  const handleDeleteTeacher = useCallback(async (id: string) => {
    try {
      await api.delete(`/teachers/${id}`);
      addNotification('success', 'Teacher deleted successfully.');
      const res = await api.get('/teachers');
      setTeachers(res.data.data);
      const overviewRes = await api.get('/analytics/overview');
      setOverview(overviewRes.data.data);
    } catch {
      addNotification('error', 'Failed to delete teacher record.');
    }
  }, [addNotification]);

  const handleDeleteDept = useCallback(async (id: string) => {
    try {
      await api.delete(`/departments/${id}`);
      addNotification('success', 'Department deleted successfully.');
      const res = await api.get('/departments');
      setDepartments(res.data.data);
      const overviewRes = await api.get('/analytics/overview');
      setOverview(overviewRes.data.data);
    } catch {
      addNotification('error', 'Failed to delete department.');
    }
  }, [addNotification]);

  const requestDeleteConfirm = useCallback((message: string, onConfirm: () => void) => {
    setConfirmDialog({ message, onConfirm });
  }, []);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.toLowerCase();
    return students.filter(s => {
      const matchesSearch = `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.admission_number.toLowerCase().includes(q);
      const matchesClass = classFilter ? s.class_id === classFilter : true;
      return matchesSearch && matchesClass;
    });
  }, [students, studentSearch, classFilter]);

  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.toLowerCase();
    return teachers.filter(t => {
      const matchesSearch = `${t.first_name} ${t.last_name}`.toLowerCase().includes(q);
      const matchesDept = deptFilter ? t.department_id === deptFilter : true;
      return matchesSearch && matchesDept;
    });
  }, [teachers, teacherSearch, deptFilter]);

  return (
    <div className="space-y-8 text-slate-100">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm" role="alert" aria-live="polite">
          {notifications.map(n => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl text-sm flex items-center gap-2 shadow-lg border ${
                n.type === 'success'
                  ? 'bg-emerald-950/90 border-emerald-800/40 text-emerald-400'
                  : 'bg-rose-950/90 border-rose-800/40 text-rose-400'
              }`}
            >
              {n.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span>{n.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl max-w-md w-full mx-4 shadow-2xl space-y-4">
            <h3 id="confirm-title" className="text-lg font-bold text-slate-100">Confirm Action</h3>
            <p className="text-sm text-slate-400">{confirmDialog.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-500 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Control Center</h1>
          <p className="text-slate-400 text-sm mt-1">Configure campus registries, schedules, payments, and view real-time stats.</p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-2xl max-w-full" role="tablist" aria-label="Dashboard sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeTab === tab.id ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6" id="tabpanel-overview" role="tabpanel" aria-label="Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Active Students</span>
                <div className="h-9 w-9 bg-slate-850 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-800">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-extrabold">{overview?.counters?.students || 0}</h3>
                <p className="text-[10px] text-slate-500">Currently enrolled academic year</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Faculty Members</span>
                <div className="h-9 w-9 bg-slate-850 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-800">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-extrabold">{overview?.counters?.teachers || 0}</h3>
                <p className="text-[10px] text-slate-500">Full-time department faculty</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Departments</span>
                <div className="h-9 w-9 bg-slate-850 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-800">
                  <Building className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-extrabold">{overview?.counters?.departments || 0}</h3>
                <p className="text-[10px] text-slate-500">Science & Humanities wings</p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Payments Revenue</span>
                <div className="h-9 w-9 bg-slate-850 rounded-xl flex items-center justify-center text-cyan-400 border border-slate-800">
                  <Landmark className="h-5 w-5" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-4xl font-extrabold">₹{overview?.counters?.totalRevenue?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}</h3>
                <p className="text-[10px] text-slate-500">Collected tuition dues</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Financial Performance</span>
                  <h2 className="text-lg font-bold">Invoiced Dues Revenue</h2>
                </div>
                <div className="flex items-center gap-1 text-xs text-cyan-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Real-time pool sync</span>
                </div>
              </div>
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overview?.revenueTrends || []}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Campus Operations</span>
                <h2 className="text-lg font-bold">Attendance Share</h2>
              </div>
              <div className="h-[180px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={overview?.attendanceStats || []}
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(overview?.attendanceStats || []).map((entry: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(overview?.attendanceStats || []).map((entry: { name: string; value: number }, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-400 truncate">{entry.name}: {entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="h-5 w-5 text-cyan-400" />
              <h2 className="text-lg font-bold">Recent Institutional Activities</h2>
            </div>
            <div className="divide-y divide-slate-800/60">
              {(overview?.recentActivities || []).map((act: ActivityItem) => (
                <div key={act.id} className="py-3.5 flex justify-between items-start gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      act.type === 'admission' ? 'bg-cyan-500' : act.type === 'payment' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <span className="text-slate-300">{act.text}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-medium">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {activeTab === 'students' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="tabpanel-students" role="tabpanel" aria-label="Students">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              {editingStudent ? (
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              ) : (
                <Plus className="h-5 w-5 text-cyan-400" />
              )}
              <h2 className="text-lg font-bold font-sans">{editingStudent ? `Edit Student: ${editingStudent.first_name} ${editingStudent.last_name}` : 'Admit New Student'}</h2>
            </div>

            <form onSubmit={handleStudentAdmission} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-first-name">First Name</label>
                  <input
                    id="std-first-name"
                    type="text" required
                    value={stdForm.first_name}
                    onChange={(e) => setStdForm({ ...stdForm, first_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="e.g. John"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-last-name">Last Name</label>
                  <input
                    id="std-last-name"
                    type="text" required
                    value={stdForm.last_name}
                    onChange={(e) => setStdForm({ ...stdForm, last_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="e.g. Doe"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-email">Portal Login Email</label>
                <input
                  id="std-email"
                  type="email" required
                  value={stdForm.email}
                  onChange={(e) => setStdForm({ ...stdForm, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="name@school.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-adm-no">Admission No.</label>
                  <input
                    id="std-adm-no"
                    type="text" required
                    value={stdForm.admission_number}
                    onChange={(e) => setStdForm({ ...stdForm, admission_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="e.g. ADM-001"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-roll-no">Roll Number</label>
                  <input
                    id="std-roll-no"
                    type="text"
                    value={stdForm.roll_number}
                    onChange={(e) => setStdForm({ ...stdForm, roll_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="e.g. 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-class">Grade Class</label>
                  <select
                    id="std-class"
                    required
                    value={stdForm.class_id}
                    onChange={(e) => setStdForm({ ...stdForm, class_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="">Select class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-section">Grade Section</label>
                  <select
                    id="std-section"
                    required
                    value={stdForm.section_id}
                    onChange={(e) => setStdForm({ ...stdForm, section_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="">Select section</option>
                    {sections.filter(s => s.class_id === stdForm.class_id).map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-parent-email">Parent Email (Optional)</label>
                <input
                  id="std-parent-email"
                  type="email"
                  value={stdForm.parent_email}
                  onChange={(e) => setStdForm({ ...stdForm, parent_email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="parent@school.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-dob">Birth Date</label>
                  <input
                    id="std-dob"
                    type="date" required
                    value={stdForm.dob}
                    onChange={(e) => setStdForm({ ...stdForm, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-gender">Gender</label>
                  <select
                    id="std-gender"
                    value={stdForm.gender}
                    onChange={(e) => setStdForm({ ...stdForm, gender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="std-address">Residential Address</label>
                <textarea
                  id="std-address"
                  value={stdForm.address}
                  onChange={(e) => setStdForm({ ...stdForm, address: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="Enter full address"
                />
              </div>

              <div className="flex gap-2">
                {editingStudent && (
                  <button
                    type="button"
                    onClick={cancelEditStudent}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${editingStudent ? 'flex-1' : 'w-full'} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md`}
                >
                  {loading ? (editingStudent ? 'Updating...' : 'Admitting...') : (editingStudent ? 'Update Student' : 'Complete Admission')}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">Students Directory</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search name or ID..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-cyan-500"
                    aria-label="Search students by name or admission number"
                  />
                </div>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs outline-none"
                  aria-label="Filter students by class"
                >
                  <option value="">All Classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500">
                    <th className="py-3 font-semibold">Student Name</th>
                    <th className="py-3 font-semibold">Admission No</th>
                    <th className="py-3 font-semibold">Class</th>
                    <th className="py-3 font-semibold">Parent Contact</th>
                    <th className="py-3 font-semibold">status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-850/30">
                      <td className="py-3">
                        <span className="font-bold text-slate-200">{std.first_name} {std.last_name}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">{std.email}</span>
                      </td>
                      <td className="py-3 font-mono">{std.admission_number}</td>
                      <td className="py-3">{std.class_name} - {std.section_name}</td>
                      <td className="py-3">
                        <span className="block">{std.parent_name || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500">{std.parent_phone}</span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                          std.status === 'Active' ? 'bg-emerald-950 border border-emerald-800 text-emerald-400' : 'bg-rose-950 text-rose-400'
                        }`}>
                          {std.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => startEditStudent(std)}
                          className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition mr-1"
                          aria-label={`Edit student ${std.first_name} ${std.last_name}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {userRole !== 'HOD' && (
                          <button
                            onClick={() => requestDeleteConfirm(
                              `Are you sure you want to delete student "${std.first_name} ${std.last_name}"?`,
                              () => handleDeleteStudent(std.id)
                            )}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            aria-label={`Delete student ${std.first_name} ${std.last_name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">No student records found matching filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEACHERS */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="tabpanel-teachers" role="tabpanel" aria-label="Teachers">
          {userRole !== 'HOD' ? (
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                {editingTeacher ? (
                  <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                ) : (
                  <Plus className="h-5 w-5 text-cyan-400" />
                )}
                <h2 className="text-lg font-bold">{editingTeacher ? `Edit Faculty: ${editingTeacher.first_name} ${editingTeacher.last_name}` : 'Register Faculty'}</h2>
              </div>

              <form onSubmit={handleTeacherRegistration} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="tea-first-name">First Name</label>
                    <input
                      id="tea-first-name"
                      type="text" required
                      value={teaForm.first_name}
                      onChange={(e) => setTeaForm({ ...teaForm, first_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                      placeholder="Sarah"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="tea-last-name">Last Name</label>
                    <input
                      id="tea-last-name"
                      type="text" required
                      value={teaForm.last_name}
                      onChange={(e) => setTeaForm({ ...teaForm, last_name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                      placeholder="Connor"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tea-email">Faculty Email</label>
                  <input
                    id="tea-email"
                    type="email" required
                    value={teaForm.email}
                    onChange={(e) => setTeaForm({ ...teaForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="teacher@school.com"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tea-phone">Phone Number</label>
                  <input
                    id="tea-phone"
                    type="text"
                    value={teaForm.phone}
                    onChange={(e) => setTeaForm({ ...teaForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="+1 (555) 019-2834"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tea-dept">Department assignment</label>
                  <select
                    id="tea-dept"
                    value={teaForm.department_id}
                    onChange={(e) => setTeaForm({ ...teaForm, department_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="">Unassigned</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tea-qual">Qualification</label>
                  <input
                    id="tea-qual"
                    type="text"
                    value={teaForm.qualification}
                    onChange={(e) => setTeaForm({ ...teaForm, qualification: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                    placeholder="Ph.D. in CS, M.Sc. Chemistry"
                  />
                </div>

                <div className="flex gap-2">
                  {editingTeacher && (
                    <button
                      type="button"
                      onClick={cancelEditTeacher}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`${editingTeacher ? 'flex-1' : 'w-full'} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md`}
                  >
                    {loading ? (editingTeacher ? 'Updating...' : 'Registering...') : (editingTeacher ? 'Update Teacher' : 'Register Teacher')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 text-center py-12 flex flex-col items-center justify-center">
              <ShieldCheck className="h-12 w-12 text-slate-600 mb-3" />
              <h3 className="font-bold text-slate-350 text-sm">Access Restricted</h3>
              <p className="text-slate-500 text-[11px] mt-1 max-w-[200px] mx-auto leading-relaxed">
                Faculty registration & staff assignment is restricted to Administrators and Principals.
              </p>
            </div>
          )}

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">Faculty directory & workload</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Search name..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs outline-none focus:border-cyan-500"
                    aria-label="Search teachers by name"
                  />
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-1.5 text-xs outline-none"
                  aria-label="Filter teachers by department"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800/80 text-slate-500">
                    <th className="py-3 font-semibold">Teacher Name</th>
                    <th className="py-3 font-semibold">Department</th>
                    <th className="py-3 font-semibold">Qualification</th>
                    <th className="py-3 font-semibold">Workload (periods)</th>
                    <th className="py-3 font-semibold">status</th>
                    <th className="py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/30">
                      <td className="py-3">
                        <span className="font-bold text-slate-200">{t.first_name} {t.last_name}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">{t.email}</span>
                      </td>
                      <td className="py-3">{t.department_name}</td>
                      <td className="py-3">{t.qualification || 'N/A'}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded font-bold ${
                          t.workload > 4 ? 'bg-amber-950 text-amber-400' : 'bg-cyan-950 text-cyan-400'
                        }`}>
                          {t.workload} periods/week
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-950 text-emerald-400">
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => startEditTeacher(t)}
                          className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition mr-1"
                          aria-label={`Edit teacher ${t.first_name} ${t.last_name}`}
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        {userRole !== 'HOD' && (
                          <button
                            onClick={() => requestDeleteConfirm(
                              `Are you sure you want to delete teacher "${t.first_name} ${t.last_name}"?`,
                              () => handleDeleteTeacher(t.id)
                            )}
                            className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                            aria-label={`Delete teacher ${t.first_name} ${t.last_name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredTeachers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">No teacher records found matching filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: DEPARTMENTS */}
      {activeTab === 'departments' && (
        <div className="space-y-8" id="tabpanel-departments" role="tabpanel" aria-label="Departments">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {userRole !== 'HOD' ? (
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  {editingDepartment ? (
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  ) : (
                    <Plus className="h-5 w-5 text-cyan-400" />
                  )}
                  <h2 className="text-lg font-bold">{editingDepartment ? `Edit Department: ${editingDepartment.name}` : 'Create Department'}</h2>
                </div>

                <form onSubmit={handleCreateDept} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="dept-name">Department Name</label>
                    <input
                      id="dept-name"
                      type="text" required
                      value={deptForm.name}
                      onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                      disabled={!!editingDepartment}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. Life Sciences"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="dept-code">Department Code</label>
                    <input
                      id="dept-code"
                      type="text" required
                      value={deptForm.code}
                      onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                      disabled={!!editingDepartment}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="e.g. LSCI"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="dept-hod">Assign HOD Faculty (Optional)</label>
                    <select
                      id="dept-hod"
                      value={deptForm.hod_id}
                      onChange={(e) => setDeptForm({ ...deptForm, hod_id: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                    >
                      <option value="">Select HOD</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-2">
                    {editingDepartment && (
                      <button
                        type="button"
                        onClick={cancelEditDept}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`${editingDepartment ? 'flex-1' : 'w-full'} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md`}
                    >
                      {loading ? (editingDepartment ? 'Updating...' : 'Creating...') : (editingDepartment ? 'Update HOD' : 'Create Wing')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 text-center py-12 flex flex-col items-center justify-center">
                <ShieldCheck className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="font-bold text-slate-350 text-sm">Access Restricted</h3>
                <p className="text-slate-500 text-[11px] mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Department configuration and wing adjustments are restricted to Administrators and Principals.
                </p>
              </div>
            )}

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Departments wing statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departments.map((dept) => (
                  <div key={dept.id} className="p-5 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-extrabold text-slate-200 text-sm">{dept.name}</h3>
                        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-1.5 py-0.5 rounded uppercase mt-1 inline-block">Code: {dept.code}</span>
                      </div>
                      <button
                        onClick={() => startEditDept(dept)}
                        className="text-slate-600 hover:text-cyan-400 transition mr-2"
                        aria-label={`Edit department ${dept.name}`}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      {userRole !== 'HOD' && (
                        <button
                          onClick={() => requestDeleteConfirm(
                            `Are you sure you want to delete department "${dept.name}"?`,
                            () => handleDeleteDept(dept.id)
                          )}
                          className="text-slate-600 hover:text-rose-400 transition"
                          aria-label={`Delete department ${dept.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400">
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                        <span className="block font-black text-slate-200 text-xs">{dept.faculty_count}</span>
                        <span>Faculty</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                        <span className="block font-black text-slate-200 text-xs">{dept.student_count}</span>
                        <span>Students</span>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-2 rounded-lg">
                        <span className="block font-black text-slate-200 text-xs">{dept.subjects_count}</span>
                        <span>Subjects</span>
                      </div>
                    </div>

                    <div className="text-[10px] border-t border-slate-850 pt-2 text-slate-500">
                      HOD: <span className="font-bold text-slate-400">{dept.hod_name || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start border-t border-slate-800/60 pt-8">
            {userRole !== 'HOD' ? (
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  {editingSubject ? (
                    <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  ) : (
                    <Plus className="h-5 w-5 text-cyan-400" />
                  )}
                  <h2 className="text-lg font-bold">{editingSubject ? `Edit Subject: ${editingSubject.name}` : 'Declare New Subject'}</h2>
                </div>

                <form onSubmit={handleCreateSubject} className="space-y-3.5 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="sub-name">Subject Name</label>
                    <input
                      id="sub-name"
                      type="text" required
                      value={subForm.name}
                      onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                      placeholder="e.g. Inorganic Chemistry"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="sub-code">Subject Code</label>
                    <input
                      id="sub-code"
                      type="text" required
                      value={subForm.code}
                      onChange={(e) => setSubForm({ ...subForm, code: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                      placeholder="e.g. CHEM-301"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="sub-dept">Department Scope</label>
                    <select
                      id="sub-dept"
                      required
                      value={subForm.department_id}
                      onChange={(e) => setSubForm({ ...subForm, department_id: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1" htmlFor="sub-credits">Credits</label>
                    <input
                      id="sub-credits"
                      type="number" required min="1" max="10"
                      value={subForm.credits}
                      onChange={(e) => setSubForm({ ...subForm, credits: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                      placeholder="3"
                    />
                  </div>

                  <div className="flex gap-2">
                    {editingSubject && (
                      <button
                        type="button"
                        onClick={cancelEditSubject}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className={`${editingSubject ? 'flex-1' : 'w-full'} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md`}
                    >
                      {loading ? (editingSubject ? 'Updating...' : 'Creating...') : (editingSubject ? 'Update Subject' : 'Declare Subject')}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4 text-center py-12 flex flex-col items-center justify-center">
                <ShieldCheck className="h-12 w-12 text-slate-600 mb-3" />
                <h3 className="font-bold text-slate-350 text-sm">Access Restricted</h3>
                <p className="text-slate-500 text-[11px] mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Declaring new academic subjects is restricted to Administrators and Principals.
                </p>
              </div>
            )}

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <BookCopy className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold">Academic Subjects Catalog</h2>
              </div>
              <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-500">
                        <th className="py-3 font-semibold">Subject Name</th>
                        <th className="py-3 font-semibold">Code</th>
                        <th className="py-3 font-semibold">Credits</th>
                        <th className="py-3 font-semibold">Department</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-200">
                      {subjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-850/30">
                          <td className="py-3 font-bold">{sub.name}</td>
                          <td className="py-3 font-mono text-cyan-400">{sub.code}</td>
                          <td className="py-3">{sub.credits} cr</td>
                          <td className="py-3 text-slate-400">{sub.department_name || 'N/A'}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => startEditSubject(sub)}
                              className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              aria-label={`Edit subject ${sub.name}`}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {subjects.length === 0 && (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-500">No subjects declared yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: TIMETABLES */}
      {activeTab === 'timetables' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="tabpanel-timetables" role="tabpanel" aria-label="Timetables">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              {editingTimetable ? (
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              ) : (
                <Plus className="h-5 w-5 text-cyan-400" />
              )}
              <h2 className="text-lg font-bold">{editingTimetable ? 'Edit Period Slot' : 'Schedule Period Slot'}</h2>
            </div>

            <form onSubmit={handleScheduleSlot} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-class">Class Grade</label>
                  <select
                    id="tt-class"
                    required
                    value={ttForm.class_id}
                    onChange={(e) => setTtForm({ ...ttForm, class_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="">Select class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-section">Section</label>
                  <select
                    id="tt-section"
                    required
                    value={ttForm.section_id}
                    onChange={(e) => setTtForm({ ...ttForm, section_id: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="">Select section</option>
                    {sections.filter(s => s.class_id === ttForm.class_id).map(sec => (
                      <option key={sec.id} value={sec.id}>{sec.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-subject">Subject</label>
                <select
                  id="tt-subject"
                  required
                  value={ttForm.subject_id}
                  onChange={(e) => setTtForm({ ...ttForm, subject_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                >
                  <option value="">Select subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-teacher">Teacher</label>
                <select
                  id="tt-teacher"
                  required
                  value={ttForm.teacher_id}
                  onChange={(e) => setTtForm({ ...ttForm, teacher_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                >
                  <option value="">Select teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-day">Day</label>
                  <select
                    id="tt-day"
                    value={ttForm.day_of_week}
                    onChange={(e) => setTtForm({ ...ttForm, day_of_week: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-start">Start Time</label>
                  <input
                    id="tt-start"
                    type="time" required
                    value={ttForm.start_time}
                    onChange={(e) => setTtForm({ ...ttForm, start_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-end">End Time</label>
                  <input
                    id="tt-end"
                    type="time" required
                    value={ttForm.end_time}
                    onChange={(e) => setTtForm({ ...ttForm, end_time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="tt-room">Classroom / Laboratory</label>
                <input
                  id="tt-room"
                  type="text" required
                  value={ttForm.room}
                  onChange={(e) => setTtForm({ ...ttForm, room: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="e.g. Room 301, Lab A"
                />
              </div>

              <div className="flex gap-2">
                {editingTimetable && (
                  <button
                    type="button"
                    onClick={cancelEditTimetable}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${editingTimetable ? 'flex-1' : 'w-full'} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md`}
                >
                  {loading ? (editingTimetable ? 'Updating...' : 'Scheduling...') : (editingTimetable ? 'Update Slot' : 'Schedule Period')}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold">Timetables schedules calendar</h2>
              <button
                onClick={() => {
                  if (classes.length > 0 && sections.length > 0) {
                    fetchClassTimetable(classes[0].id, sections[0].id);
                  }
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                Reload Schedule
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((dayName, idx) => {
                const dayNum = idx + 1;
                const slots = timetables.filter((t: Timetable) => t.day_of_week === dayNum);
                return (
                  <div key={dayNum} className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-24 font-extrabold text-slate-300 text-xs border-r border-slate-800 shrink-0 pr-2 uppercase tracking-wider">{dayName}</div>
                    <div className="flex flex-wrap gap-2 flex-1">
                      {slots.map((s: Timetable) => (
                        <div key={s.id} className="bg-slate-900 border border-slate-800/80 px-3 py-2 rounded-xl text-left space-y-1 min-w-[140px] relative group">
                          <button
                            onClick={() => startEditTimetable(s)}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-700 rounded-full opacity-0 group-hover:opacity-100 transition text-[9px]"
                            aria-label={`Edit timetable slot for ${s.subject_name}`}
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <span className="font-bold text-slate-200 block text-xs truncate">{s.subject_name}</span>
                          <span className="text-[10px] text-cyan-400 font-medium block">Room: {s.room}</span>
                          <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                            <span>{s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)}</span>
                            <span>{s.teacher_name.split(' ')[0]}</span>
                          </div>
                        </div>
                      ))}
                      {slots.length === 0 && <span className="text-[10px] text-slate-600 italic">No periods scheduled for this day.</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BILLING */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start" id="tabpanel-billing" role="tabpanel" aria-label="Billing">
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              {editingFee ? (
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              ) : (
                <Plus className="h-5 w-5 text-cyan-400" />
              )}
              <h2 className="text-lg font-bold">{editingFee ? `Edit Fee: ${editingFee.name}` : 'Declare Fee Structure'}</h2>
            </div>

            <form onSubmit={handleCreateFee} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="fee-name">Fee Description Name</label>
                <input
                  id="fee-name"
                  type="text" required
                  value={feeForm.name}
                  onChange={(e) => setFeeForm({ ...feeForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="e.g. Annual Tuition - Grade 10"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="fee-class">Applicable Class (Optional)</label>
                <select
                  id="fee-class"
                  value={feeForm.class_id}
                  onChange={(e) => setFeeForm({ ...feeForm, class_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                >
                  <option value="">Apply to all classes</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="fee-amount">Dues Amount (₹)</label>
                <input
                  id="fee-amount"
                  type="number" required
                  value={feeForm.amount}
                  onChange={(e) => setFeeForm({ ...feeForm, amount: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none focus:border-cyan-500 text-xs"
                  placeholder="e.g. 1200.00"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1" htmlFor="fee-due-date">Payment Due Date</label>
                <input
                  id="fee-due-date"
                  type="date" required
                  value={feeForm.due_date}
                  onChange={(e) => setFeeForm({ ...feeForm, due_date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 outline-none text-xs"
                />
              </div>

              <div className="flex gap-2">
                {editingFee && (
                  <button
                    type="button"
                    onClick={cancelEditFee}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition text-xs shadow-md"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${editingFee ? 'flex-1' : 'w-full'} bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-2.5 rounded-xl transition text-xs shadow-md`}
                >
                  {loading ? (editingFee ? 'Updating...' : 'Creating...') : (editingFee ? 'Update Fee' : 'Declare Fee')}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold border-b border-slate-800 pb-3">Active Tuition Invoices & Fee Structures</h2>
            <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 text-slate-500">
                        <th className="py-3 font-semibold">Structure Name</th>
                        <th className="py-3 font-semibold">Grade Scope</th>
                        <th className="py-3 font-semibold">Dues Amount</th>
                        <th className="py-3 font-semibold">Due Date</th>
                        <th className="py-3 font-semibold">Period</th>
                        <th className="py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {feeStructures.map((f) => (
                        <tr key={f.id} className="hover:bg-slate-850/30">
                          <td className="py-3 font-bold text-slate-200">{f.name}</td>
                          <td className="py-3">{f.class_name || 'All Classes'}</td>
                          <td className="py-3 font-mono font-bold text-cyan-400">${(f.amount ? parseFloat(String(f.amount)) : 0).toFixed(2)}</td>
                          <td className="py-3 font-mono">{f.due_date.split('T')[0]}</td>
                          <td className="py-3 text-slate-400">{f.academic_year_name}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => startEditFee(f)}
                              className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                              aria-label={`Edit fee structure ${f.name}`}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {feeStructures.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-500">No fee structures declared yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default React.memo(AdminDashboard);
