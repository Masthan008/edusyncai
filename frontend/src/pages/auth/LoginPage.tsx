import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { api } from '../../utils/api.js';
import { GraduationCap, Lock, Mail, Loader2, Sparkles, HelpCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, user, profile } = res.data.data;
      loginStore(accessToken, user, profile);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Connection failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setShortcut = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  const shortcuts = [
    { label: 'Admin', email: 'admin@edusync.com', pass: 'admin123', bg: 'bg-indigo-950/60 border-indigo-700/40 text-indigo-400' },
    { label: 'HOD', email: 'hod@edusync.com', pass: 'hod123', bg: 'bg-emerald-950/60 border-emerald-700/40 text-emerald-400' },
    { label: 'Teacher', email: 'teacher@edusync.com', pass: 'teacher123', bg: 'bg-amber-950/60 border-amber-700/40 text-amber-400' },
    { label: 'Student', email: 'student@edusync.com', pass: 'student123', bg: 'bg-cyan-950/60 border-cyan-700/40 text-cyan-400' },
    { label: 'Parent', email: 'parent@edusync.com', pass: 'parent123', bg: 'bg-rose-950/60 border-rose-700/40 text-rose-400' },
    { label: 'Accountant', email: 'accountant@edusync.com', pass: 'accountant123', bg: 'bg-violet-950/60 border-violet-700/40 text-violet-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="h-7 w-7 text-slate-950 stroke-[2.5]" />
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm mt-1">Sign in to your EduSync AI campus portal</p>
          </div>
        </div>

        {/* Login form panel */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-xl text-rose-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-5 w-5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-sm placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-10 pr-4 text-sm placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/10 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          {/* Role shortcut helper */}
          <div className="pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Demo Role Shortcuts (One-Click)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {shortcuts.map((sh, idx) => (
                <button
                  key={idx}
                  onClick={() => setShortcut(sh.email, sh.pass)}
                  className={`text-[10px] font-extrabold py-2 px-1.5 rounded-lg border text-center transition hover:brightness-110 active:scale-95 outline-none ${sh.bg}`}
                >
                  {sh.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs">
          Forgot credentials? Contact school registrar office for temporary pin.
        </p>
      </div>
    </div>
  );
}
