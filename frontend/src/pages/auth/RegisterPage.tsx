import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../utils/api.js';
import { GraduationCap, Lock, Mail, Loader2, Sparkles, User, Phone } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 text-slate-800 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Liquid Glass Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-sky-200/40 to-indigo-200/40 blur-[100px] animate-blob pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-pink-200/35 to-purple-200/35 blur-[100px] animate-blob animation-delay-2000 pointer-events-none z-0" />
      <div className="absolute top-[35%] left-[25%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-teal-100/30 to-cyan-200/40 blur-[90px] animate-blob animation-delay-4000 pointer-events-none z-0" />

      <div className="w-full max-w-lg space-y-8 z-10">
        {/* Top Logo */}
        <div className="flex flex-col items-center text-center space-y-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-12 w-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GraduationCap className="h-7 w-7 text-slate-950 stroke-[2.5]" />
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Create your account</h2>
            <p className="text-slate-400 text-sm mt-1">Get instant access to your EduSync AI portal</p>
          </div>
        </div>

        {/* Register Form Panel */}
        <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md space-y-6">
          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800/40 rounded-xl text-rose-400 text-sm text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-950/60 border border-emerald-800/40 rounded-xl text-emerald-400 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-2">First Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xs placeholder-slate-600 outline-none transition text-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-2">Last Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xs placeholder-slate-600 outline-none transition text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xs placeholder-slate-600 outline-none transition text-slate-200"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xs placeholder-slate-600 outline-none transition text-slate-200"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-2">Phone Number (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 pl-9 pr-4 text-xs placeholder-slate-600 outline-none transition text-slate-200"
                />
              </div>
            </div>

            {/* Portal Role */}
            <div>
              <label className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider block mb-2">Your Portal Role</label>
              <select
                value={role}
                onChange={(e: any) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-xs outline-none transition text-slate-200"
              >
                <option value="Admin">Administrator</option>
                <option value="Teacher">Faculty Teacher</option>
                <option value="Student">Enrolled Student</option>
                <option value="Parent">linked Parent/Guardian</option>
                <option value="Accountant">Campus Accountant</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-cyan-500/10 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Register Account'
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/60 text-center">
            <p className="text-slate-400 text-xs">
              Already have an account?{' '}
              <Link to="/login" className="text-cyan-400 hover:underline font-bold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
