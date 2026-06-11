import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore.js';
import LandingPage from './pages/landing/LandingPage.js';
import LoginPage from './pages/auth/LoginPage.js';
import RegisterPage from './pages/auth/RegisterPage.js';
import DashboardLayout from './pages/dashboard/DashboardLayout.js';
import AdminDashboard from './pages/dashboard/admin/AdminDashboard.js';
import TeacherDashboard from './pages/dashboard/teacher/TeacherDashboard.js';
import StudentDashboard from './pages/dashboard/student/StudentDashboard.js';
import ParentDashboard from './pages/dashboard/parent/ParentDashboard.js';
import AccountantDashboard from './pages/dashboard/accountant/AccountantDashboard.js';

// Auth Route Guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

// Dynamic Dashboard Dispatcher
function DashboardDispatcher() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Admin':
    case 'Principal':
    case 'HOD':
      return <AdminDashboard />;
    case 'Teacher':
      return <TeacherDashboard />;
    case 'Student':
      return <StudentDashboard />;
    case 'Parent':
      return <ParentDashboard />;
    case 'Accountant':
      return <AccountantDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Marketing Site */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Portal Authentication */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Private Dashboard Workspace */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Default index path automatically dispatches by active user role */}
          <Route index element={<DashboardDispatcher />} />
          
          {/* Sub-routing configuration fallback */}
          <Route path="*" element={<DashboardDispatcher />} />
        </Route>

        {/* Catch-all global redirects */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
