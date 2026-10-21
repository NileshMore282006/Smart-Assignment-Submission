import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  GraduationCap, 
  FileCheck2, 
  Cpu, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [roleTab, setRoleTab] = useState('student'); // 'student' | 'teacher'
  const [email, setEmail] = useState('student@demo.com');
  const [password, setPassword] = useState('Student123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setRoleTab(role);
    setErrors({});
    if (role === 'student') {
      setEmail('student@demo.com');
      setPassword('Student123!');
    } else {
      setEmail('teacher@demo.com');
      setPassword('Teacher123!');
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const loggedUser = await login(email, password, roleTab);
      if (loggedUser.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      // error handled in AuthContext via toast
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex">
      {/* Left Split: Premium Branded Academic SaaS Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-900 text-white relative flex-col justify-between p-12 overflow-hidden border-r border-navy-800">
        {/* Decorative background glow & grid */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-900/50">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Smart Assignment Portal</h1>
            <p className="text-xs text-brand-300 font-medium">Submit • Compare • Learn</p>
          </div>
        </div>

        {/* Feature Showcase */}
        <div className="relative z-10 my-auto py-8 space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Document Intelligence
            </span>
            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-4 leading-tight">
              Automate Submissions with Deep Similarity Analytics.
            </h2>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-lg">
              Empowering students to verify citation integrity and educators to conduct thorough, neutral similarity audits with upcoming Amazon S3 and Textract capabilities.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-navy-800/60 border border-navy-700/60 backdrop-blur-xs">
              <div className="p-2 bg-brand-500/20 text-brand-300 rounded-lg shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Streamlined Submissions</h4>
                <p className="text-xs text-slate-400 mt-0.5">Drag-and-drop support for PDF, DOCX, TXT, PNG, and JPG formats with real-time size validation.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-navy-800/60 border border-navy-700/60 backdrop-blur-xs">
              <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Cloud OCR & Textract Pipeline</h4>
                <p className="text-xs text-slate-400 mt-0.5">Designed to interface smoothly with Python Flask and AWS cloud pipelines without frontend redesign.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-navy-800/60 border border-navy-700/60 backdrop-blur-xs">
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Ethical, Transparent Reporting</h4>
                <p className="text-xs text-slate-400 mt-0.5">Neutral match categorization emphasizing human academic judgment over automated accusations.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 pt-4 border-t border-navy-800 text-xs text-slate-400 flex items-center justify-between">
          <span>University Portal Version 1.0 (Demo Mode)</span>
          <span>© 2026 Academic Cloud Computing</span>
        </div>
      </div>

      {/* Right Split: Clean Interactive Authentication Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 max-w-xl mx-auto w-full">
        {/* Mobile branding */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-slate-900">Smart Assignment Portal</span>
        </div>

        <div className="space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to Portal
          </h2>
          <p className="text-sm text-slate-500">
            Select your academic role to proceed with demonstration access.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="p-1 bg-slate-100 rounded-xl grid grid-cols-2 gap-1 mb-6 border border-slate-200">
          <button
            type="button"
            onClick={() => handleRoleChange('student')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              roleTab === 'student'
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('teacher')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
              roleTab === 'teacher'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Faculty / Teacher</span>
          </button>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@demo.com"
                className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
                  errors.email ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all ${
                  errors.password ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-300'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 border-slate-300 focus:ring-brand-500"
              />
              <span className="text-xs font-medium text-slate-600">Remember demo session</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>Sign In as {roleTab === 'teacher' ? 'Faculty' : 'Student'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Credentials Card */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              Demo Credentials
            </span>
            <span className="text-[10px] text-slate-500">Frontend Prototype Mode</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                roleTab === 'student'
                  ? 'bg-brand-50/70 border-brand-300 ring-1 ring-brand-400'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold text-slate-900">Student Account</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">student@demo.com</p>
              <p className="text-[10px] text-brand-600 font-medium mt-1">Student123!</p>
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('teacher')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                roleTab === 'teacher'
                  ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <p className="text-xs font-bold text-slate-900">Teacher Account</p>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">teacher@demo.com</p>
              <p className="text-[10px] text-indigo-600 font-medium mt-1">Teacher123!</p>
            </button>
          </div>
        </div>

        {/* Register link */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Need a student account?{' '}
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
            Register as Student
          </Link>
        </p>
      </div>
    </div>
  );
}
