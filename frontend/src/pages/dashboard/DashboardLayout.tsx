import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { useLanguageStore } from '../../store/languageStore.js';
import { api } from '../../utils/api.js';
import { 
  GraduationCap, LayoutDashboard, Users, BookOpen, Clock, 
  Landmark, Bell, LogOut, Menu, X, Sparkles, Building, CheckSquare, 
  CalendarDays, Settings, ShieldAlert, Award, ClipboardList, Globe
} from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ type: string; title: string; message: string }>>([]);
  const { user, profile, logout } = useAuthStore();
  const { language, toggleLanguage, t } = useLanguageStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/school/notifications')
      .then((res) => {
        if (res.data && res.data.data) {
          setNotifications(res.data.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavigationForRole = (role: string) => {
    const common = [
      { tab: null, label: t('dashboard'), icon: <LayoutDashboard className="h-5 w-5" /> },
      { tab: 'sops', label: t('sops'), icon: <ClipboardList className="h-5 w-5" /> },
    ];

    switch (role) {
      case 'Admin':
        return [
          ...common,
          { tab: 'students', label: t('students'), icon: <Users className="h-5 w-5" /> },
          { tab: 'teachers', label: t('teachers'), icon: <BookOpen className="h-5 w-5" /> },
          { tab: 'departments', label: t('departments'), icon: <Building className="h-5 w-5" /> },
          { tab: 'attendance', label: t('attendance'), icon: <CheckSquare className="h-5 w-5" /> },
          { tab: 'timetables', label: t('timetables'), icon: <Clock className="h-5 w-5" /> },
          { tab: 'exams', label: t('exams_grades'), icon: <Award className="h-5 w-5" /> },
          { tab: 'billing', label: t('tuition_fees'), icon: <Landmark className="h-5 w-5" /> },
          { tab: 'transport', label: t('transport'), icon: <Clock className="h-5 w-5" /> },
          { tab: 'hostel', label: t('hostel'), icon: <Building className="h-5 w-5" /> },
          { tab: 'library', label: t('library'), icon: <BookOpen className="h-5 w-5" /> },
        ];
      case 'Principal':
      case 'HOD':
        return [
          ...common,
          { tab: 'teachers', label: t('teachers'), icon: <BookOpen className="h-5 w-5" /> },
          { tab: 'departments', label: t('departments'), icon: <Building className="h-5 w-5" /> },
          { tab: 'timetables', label: t('timetables'), icon: <Clock className="h-5 w-5" /> },
          { tab: 'exams', label: t('exams_grades'), icon: <Award className="h-5 w-5" /> },
          { tab: 'transport', label: t('transport'), icon: <Clock className="h-5 w-5" /> },
          { tab: 'hostel', label: t('hostel'), icon: <Building className="h-5 w-5" /> },
          { tab: 'library', label: t('library'), icon: <BookOpen className="h-5 w-5" /> },
        ];
      case 'Teacher':
        return [
          ...common,
          { tab: 'attendance', label: t('attendance'), icon: <CheckSquare className="h-5 w-5" /> },
          { tab: 'grades', label: t('exams_grades'), icon: <Award className="h-5 w-5" /> },
          { tab: 'assignments', label: t('assignments'), icon: <BookOpen className="h-5 w-5" /> },
          { tab: 'library', label: t('library'), icon: <BookOpen className="h-5 w-5" /> },
        ];
      case 'Student':
        return [
          ...common,
          { tab: 'grades', label: t('exams_grades'), icon: <Award className="h-5 w-5" /> },
          { tab: 'assignments', label: t('assignments'), icon: <BookOpen className="h-5 w-5" /> },
          { tab: 'schedule', label: t('timetables'), icon: <Clock className="h-5 w-5" /> },
        ];
      case 'Parent':
        return [
          ...common,
          { tab: 'payments', label: t('tuition_fees'), icon: <Landmark className="h-5 w-5" /> },
          { tab: 'exams', label: t('exams_grades'), icon: <Award className="h-5 w-5" /> },
          { tab: 'attendance', label: t('attendance'), icon: <CheckSquare className="h-5 w-5" /> },
        ];
      case 'Accountant':
        return [
          ...common,
          { tab: 'structures', label: t('tuition_fees'), icon: <Settings className="h-5 w-5" /> },
          { tab: 'ledger', label: t('tuition_fees'), icon: <Landmark className="h-5 w-5" /> },
        ];
      default:
        return common;
    }
  };

  const navItems = getNavigationForRole(user?.role || 'Student');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative overflow-hidden">
      {/* Liquid Glass Background Blobs - Green & Blue */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-emerald-300/30 to-teal-200/30 blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-300/35 to-indigo-200/35 blur-[100px] animate-blob animation-delay-2000 pointer-events-none z-0" />
      <div className="absolute top-[35%] left-[25%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-emerald-200/25 to-blue-200/30 blur-[90px] animate-blob animation-delay-4000 pointer-events-none z-0" />

      {/* Top Navbar */}
      <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40 relative shadow-sm">

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-slate-100 rounded-lg transition"
            aria-label={sidebarOpen ? 'Close sidebar menu' : 'Open sidebar menu'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-6 w-6 text-slate-600" />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="h-5 w-5 text-white stroke-[2.5]" />
            </div>
            <span className="font-bold tracking-tight text-slate-900 text-lg hidden sm:inline">{t('app_title')}</span>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Global Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold text-emerald-800 transition shadow-xs"
            title="Switch Language / تغيير اللغة"
          >
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === 'en' ? t('arabic') : t('english')}</span>
          </button>

          {/* Active Role Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3 w-3 text-blue-600" />
            <span>{t('role')}: {user?.role}</span>
          </div>

          {/* Notifications Panel */}
          <div className="relative">
            <button 
              onClick={() => setNotifPanelOpen(!notifPanelOpen)}
              className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition relative"
              aria-label={notifPanelOpen ? 'Close notifications' : 'Open notifications'}
              aria-expanded={notifPanelOpen}
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full" />
            </button>

            {notifPanelOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 space-y-3 z-50" role="dialog" aria-label="Notifications panel">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <span className="font-bold text-sm text-slate-800">{t('notifications')}</span>
                  <button 
                    onClick={() => setNotifications([])}
                    className="text-xs text-slate-500 hover:text-emerald-700 font-semibold"
                  >
                    {t('clear_all')}
                  </button>
                </div>
                <div className="space-y-3 text-xs leading-relaxed max-h-60 overflow-y-auto" role="log" aria-live="polite">
                  {notifications.length === 0 ? (
                    <div className="p-2.5 text-slate-500 text-center italic">{t('no_records')}</div>
                  ) : (
                    notifications.map((n, i) => (
                      <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className={`font-semibold block mb-0.5 ${n.type === 'info' ? 'text-emerald-700' : 'text-amber-700'}`}>{n.title}</span>
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
            className="flex items-center gap-1.5 text-slate-600 hover:text-rose-600 text-xs font-semibold hover:bg-rose-50 p-2 rounded-xl transition border border-slate-200 hover:border-rose-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">{t('logout')}</span>
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex flex-1 relative">
        {/* Sidebar Container (Responsive) */}
        <aside aria-label="Main navigation" className={`w-64 bg-white/80 backdrop-blur-md border-r border-slate-200 p-6 space-y-8 flex flex-col justify-between transition-all shrink-0 z-30
          fixed md:sticky top-16 bottom-0 left-0 md:h-[calc(100vh-64px)] shadow-xs
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-3">{t('app_title')}</span>
              <nav className="space-y-1" aria-label="Page navigation">
                {navItems.map((item, idx) => {
                  const isActive = item.tab === null
                    ? !location.state?.tab
                    : location.state?.tab === item.tab;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        navigate('/dashboard', { state: { tab: item.tab } });
                        setSidebarOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition w-full text-left ${
                        isActive 
                          ? 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white shadow-md shadow-emerald-600/10' 
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Profile Card Footer */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
            <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-full flex items-center justify-center font-bold text-white shadow-xs">
              {profile?.first_name ? profile.first_name[0] : 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-bold truncate text-slate-800">{profile?.first_name ? `${profile.first_name} ${profile.last_name}` : 'School User'}</span>
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
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-full relative z-10">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
