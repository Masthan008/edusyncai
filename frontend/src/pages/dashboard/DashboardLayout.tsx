import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { 
  GraduationCap, LayoutDashboard, Users, BookOpen, Clock, 
  Landmark, Bell, LogOut, Menu, X, Sparkles, Building, CheckSquare, 
  CalendarDays, Settings, ShieldAlert, Award
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifications] = useState<Array<{ type: 'info' | 'warning'; title: string; message: string }>>([
    { type: 'info', title: 'Welcome to EduSync AI', message: 'The school management ERP portal is ready for your deployment.' },
    { type: 'warning', title: 'Midterm Exam Grades', message: 'Grades compilation for Grade 10 organic chemistry has been published.' },
  ]);
  const { user, profile, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationForRole = (role: string) => {
    const common = [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    ];

    switch (role) {
      case 'Admin':
        return [
          ...common,
          { path: '/dashboard/students', label: 'Students Directory', icon: <Users className="h-5 w-5" /> },
          { path: '/dashboard/teachers', label: 'Faculty Directory', icon: <BookOpen className="h-5 w-5" /> },
          { path: '/dashboard/departments', label: 'Departments', icon: <Building className="h-5 w-5" /> },
          { path: '/dashboard/attendance', label: 'Attendance logs', icon: <CheckSquare className="h-5 w-5" /> },
          { path: '/dashboard/timetable', label: 'Timetables', icon: <Clock className="h-5 w-5" /> },
          { path: '/dashboard/exams', label: 'Grades & Exams', icon: <Award className="h-5 w-5" /> },
          { path: '/dashboard/payments', label: 'Fee ledger', icon: <Landmark className="h-5 w-5" /> },
        ];
      case 'Principal':
      case 'HOD':
        return [
          ...common,
          { path: '/dashboard/teachers', label: 'Faculty Workload', icon: <BookOpen className="h-5 w-5" /> },
          { path: '/dashboard/departments', label: 'Departments', icon: <Building className="h-5 w-5" /> },
          { path: '/dashboard/timetable', label: 'Timetable Scheduling', icon: <Clock className="h-5 w-5" /> },
          { path: '/dashboard/exams', label: 'Performance Review', icon: <Award className="h-5 w-5" /> },
        ];
      case 'Teacher':
        return [
          ...common,
          { path: '/dashboard/attendance', label: 'Record Attendance', icon: <CheckSquare className="h-5 w-5" /> },
          { path: '/dashboard/exams', label: 'Enter Grades', icon: <Award className="h-5 w-5" /> },
          { path: '/dashboard/assignments', label: 'Homework Review', icon: <BookOpen className="h-5 w-5" /> },
          { path: '/dashboard/timetable', label: 'My Schedule', icon: <CalendarDays className="h-5 w-5" /> },
        ];
      case 'Student':
        return [
          ...common,
          { path: '/dashboard/exams', label: 'My Report Card', icon: <Award className="h-5 w-5" /> },
          { path: '/dashboard/assignments', label: 'Assignments', icon: <BookOpen className="h-5 w-5" /> },
          { path: '/dashboard/timetable', label: 'Class Timetable', icon: <Clock className="h-5 w-5" /> },
        ];
      case 'Parent':
        return [
          ...common,
          { path: '/dashboard/payments', label: 'School Bills', icon: <Landmark className="h-5 w-5" /> },
          { path: '/dashboard/exams', label: 'Performance', icon: <Award className="h-5 w-5" /> },
          { path: '/dashboard/attendance', label: 'Attendance logs', icon: <CheckSquare className="h-5 w-5" /> },
        ];
      case 'Accountant':
        return [
          ...common,
          { path: '/dashboard/payments', label: 'Fee Structures', icon: <Settings className="h-5 w-5" /> },
          { path: '/dashboard/payments/ledger', label: 'Payments Ledger', icon: <Landmark className="h-5 w-5" /> },
        ];
      default:
        return common;
    }
  };

  const navItems = getNavigationForRole(user?.role || 'Student');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-slate-800 rounded-lg transition"
            aria-label={sidebarOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-6 w-6 text-slate-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <span className="font-bold tracking-tight text-slate-200 hidden sm:inline">EduSync AI</span>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-4">
          {/* Active Role Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400">
            <Sparkles className="h-3 w-3" />
            <span>Role: {user?.role}</span>
          </div>

          {/* Notifications Panel */}
          <div className="relative">
            <button 
              onClick={() => setNotifPanelOpen(!notifPanelOpen)}
              className="p-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition relative"
              aria-label={notifPanelOpen ? 'Close notifications' : 'Open notifications'}
              aria-expanded={notifPanelOpen}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-cyan-500 rounded-full" />
            </button>

            {notifPanelOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-4 space-y-3 z-50" role="dialog" aria-label="Notifications panel">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                  <span className="font-bold text-sm">Notifications</span>
                  <button 
                    onClick={() => setNotifPanelOpen(false)}
                    className="text-xs text-slate-500 hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-3 text-xs leading-relaxed max-h-60 overflow-y-auto" role="log" aria-live="polite">
                  {notifications.length === 0 ? (
                    <div className="p-2.5 text-slate-500 text-center italic">No new notifications.</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/40">
                        <span className={`font-semibold block mb-0.5 ${n.type === 'info' ? 'text-cyan-400' : 'text-amber-400'}`}>{n.title}</span>
                        {n.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Signout */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-400 text-xs font-semibold hover:bg-slate-850 p-2 rounded-xl transition border border-slate-800/50 hover:border-rose-900/30"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex flex-1 relative">
        {/* Sidebar Container (Responsive) */}
        <aside aria-label="Main navigation" className={`w-64 bg-slate-900/40 border-r border-slate-800 p-6 space-y-8 flex flex-col justify-between transition-all shrink-0 z-30
          fixed md:sticky top-16 bottom-0 left-0 md:h-[calc(100vh-64px)] bg-slate-900 md:bg-slate-900/40
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-3">Navigation Menu</span>
              <nav className="space-y-1" aria-label="Page navigation">
                {navItems.map((item, idx) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={idx}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                        isActive 
                          ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/10' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-850'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Profile Card Footer */}
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="h-9 w-9 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center font-bold text-cyan-400">
              {profile?.first_name ? profile.first_name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold truncate">{profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'School User'}</span>
              <span className="block text-[10px] text-slate-500 truncate">{user?.email || 'N/A'}</span>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)} 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
            aria-hidden="true"
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
