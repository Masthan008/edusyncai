import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api.js';
import { useLanguageStore } from '../../store/languageStore.js';
import { GraduationCap, Lock, Mail, Loader2, Sparkles, User, Phone, Globe } from 'lucide-react';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'Admin' | 'Teacher' | 'Student' | 'Parent' | 'Accountant'>('Parent');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { language, toggleLanguage, t } = useLanguageStore();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName || !role) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/register', {
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Dynamic Vibrant Liquid Glass Backdrops */}
      <div className="fixed top-[-15%] left-[-15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-emerald-400/40 via-teal-300/35 to-blue-500/40 blur-[70px] animate-blob-1 pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-15%] w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-blue-500/40 via-indigo-400/35 to-emerald-400/40 blur-[80px] animate-blob-2 pointer-events-none z-0" />
      <div className="fixed top-[30%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-teal-300/30 via-emerald-400/30 to-sky-400/30 blur-[90px] animate-blob-1 pointer-events-none z-0" />

      {/* Top Navbar Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 hover:bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 transition shadow-sm"
        >
          <Globe className="h-4 w-4 text-emerald-600" />
          <span>{language === 'en' ? 'العربية 🇸🇦' : 'English 🇬🇧'}</span>
        </button>
      </div>

      <div className="w-full max-w-lg space-y-8 z-10">
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-tr from-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <GraduationCap className="h-7 w-7 text-white stroke-[2.5]" />
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {language === 'ar' ? 'إنشاء حساب جديد' : 'Create an Account'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {language === 'ar' ? 'انضم إلى منصة إيدوسينك الذكية لإدارة المدارس والجامعات' : 'Join the EduSync AI campus ecosystem'}
            </p>
          </div>
        </div>

        {/* Register form panel */}
        <div className="bg-white/85 border border-slate-200 p-8 rounded-3xl shadow-xl backdrop-blur-md space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm text-center font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider block mb-2">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider block mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm text-slate-900 outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider block mb-2">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition shadow-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 text-xs font-semibold uppercase tracking-wider block mb-2">Account Portal Role</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 rounded-xl py-2.5 px-3 text-sm text-slate-900 outline-none transition shadow-xs"
              >
                <option value="Parent">Parent / Guardian Portal</option>
                <option value="Student">Enrolled Student Portal</option>
                <option value="Teacher">Faculty Teacher Portal</option>
                <option value="Accountant">Campus Accountant Portal</option>
                <option value="Admin">Administrator System Portal</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-emerald-blue disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Portal Account...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>

          {/* Login redirect */}
          <div className="pt-4 border-t border-slate-200 text-center">
            <p className="text-slate-600 text-xs">
              Already have a campus account?{' '}
              <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-bold hover:underline">
                Sign In Instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
