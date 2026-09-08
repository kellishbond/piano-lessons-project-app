import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import {
  Music,
  Lock,
  User,
  Mail,
  KeyRound,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();

  // Mode: 'student-login' | 'student-register' | 'instructor-admin'
  const [activePortal, setActivePortal] = useState<'student' | 'instructor'>('student');
  const [studentMode, setStudentMode] = useState<'signin' | 'register'>('signin');

  // Student Sign In form
  const [studentIdentifier, setStudentIdentifier] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  // Student Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regSkillLevel, setRegSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [regGoal, setRegGoal] = useState('Master Keyboard Foundations & Song Repertoire');

  // Instructor Form (hardcoded credentials: Kellish / piano)
  const [adminUsername, setAdminUsername] = useState('Kellish');
  const [adminPassword, setAdminPassword] = useState('piano');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleStudentSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!studentIdentifier.trim()) {
      setError('Please enter your student username or email.');
      return;
    }

    setLoading(true);
    try {
      await login(studentIdentifier.trim(), studentPassword || undefined, 'STUDENT');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!regName.trim()) {
      setError('Please provide your name.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim() || undefined,
        password: regPassword.trim() || 'piano',
        role: 'STUDENT',
        skillLevel: regSkillLevel,
        learningGoal: regGoal,
      });
      setSuccessMsg('Student profile created successfully! Welcome to your piano studio.');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstructorSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    if (!adminUsername.trim() || !adminPassword.trim()) {
      setError('Please enter the instructor username and password.');
      return;
    }

    setLoading(true);
    try {
      await login(adminUsername.trim(), adminPassword.trim(), 'INSTRUCTOR');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Access denied. Please check instructor credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-100 via-stone-50 to-stone-100 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-900 text-amber-200 shadow-md mb-4 ring-4 ring-amber-100">
          <Music className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Digital Piano Studio
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Structured Piano Curriculum & Interactive Practice for PC & Laptop
        </p>

        {/* Top Role Selector Tabs */}
        <div className="mt-6 inline-flex p-1 bg-stone-200/80 rounded-xl border border-stone-300/80 shadow-2xs">
          <button
            id="portal-tab-student"
            type="button"
            onClick={() => {
              setActivePortal('student');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activePortal === 'student'
                ? 'bg-white text-stone-900 shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-700" />
            Student Portal
          </button>
          <button
            id="portal-tab-instructor"
            type="button"
            onClick={() => {
              setActivePortal('instructor');
              setError(null);
              setSuccessMsg(null);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activePortal === 'instructor'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Instructor Admin
          </button>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-stone-200/80 sm:px-10">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="font-medium">{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="font-medium">{successMsg}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 1. STUDENT PORTAL */}
          {/* ========================================================================= */}
          {activePortal === 'student' && (
            <div>
              {/* Toggle: Sign In vs Register */}
              <div className="flex border-b border-stone-200 mb-6">
                <button
                  type="button"
                  id="student-signin-tab"
                  onClick={() => {
                    setStudentMode('signin');
                    setError(null);
                  }}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition ${
                    studentMode === 'signin'
                      ? 'border-amber-700 text-amber-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Student Sign In
                </button>
                <button
                  type="button"
                  id="student-register-tab"
                  onClick={() => {
                    setStudentMode('register');
                    setError(null);
                  }}
                  className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition ${
                    studentMode === 'register'
                      ? 'border-amber-700 text-amber-900'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Student Sign In Form */}
              {studentMode === 'signin' && (
                <form onSubmit={handleStudentSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Student Name or Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="student-identifier-input"
                        type="text"
                        required
                        value={studentIdentifier}
                        onChange={(e) => setStudentIdentifier(e.target.value)}
                        placeholder="e.g., Alex Morgan or alex@example.com"
                        className="block w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="student-password-input"
                        type="password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="block w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <button
                    id="student-submit-signin-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block animate-spin">⏳</span>
                    ) : (
                      <>
                        <span>Enter Student Studio</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center text-xs text-stone-500">
                    New to the studio?{' '}
                    <button
                      type="button"
                      onClick={() => setStudentMode('register')}
                      className="text-amber-800 font-bold hover:underline"
                    >
                      Create your student profile
                    </button>
                  </div>
                </form>
              )}

              {/* Student Register Form */}
              {studentMode === 'register' && (
                <form onSubmit={handleStudentRegister} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-name-input"
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g., Alex Rivers"
                        className="block w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address <span className="text-stone-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-email-input"
                        type="email"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="alex@example.com"
                        className="block w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        id="reg-password-input"
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Choose a password (e.g., piano)"
                        className="block w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Starting Skill Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setRegSkillLevel(lvl)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                            regSkillLevel === lvl
                              ? 'bg-amber-100 border-amber-400 text-amber-900'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Learning Goal
                    </label>
                    <select
                      value={regGoal}
                      onChange={(e) => setRegGoal(e.target.value)}
                      className="block w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-600/30 focus:border-amber-600 transition"
                    >
                      <option value="Master Keyboard Foundations & Song Repertoire">
                        Master Keyboard Foundations & Songs
                      </option>
                      <option value="Learn to Read Sheet Music & Notes">
                        Learn to Read Sheet Music & Notes
                      </option>
                      <option value="Play Chords, Pop & Accompaniment">
                        Play Chords, Pop & Accompaniment
                      </option>
                      <option value="Classical Technique & Finger Dexterity">
                        Classical Technique & Finger Dexterity
                      </option>
                    </select>
                  </div>

                  <button
                    id="student-submit-register-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full mt-3 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="inline-block animate-spin">⏳</span>
                    ) : (
                      <>
                        <span>Register Student & Start Learning</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. INSTRUCTOR ADMIN PORTAL */}
          {/* ========================================================================= */}
          {activePortal === 'instructor' && (
            <div>
              <div className="mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-stone-900 text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-900">
                      Instructor Admin Portal
                    </h2>
                    <p className="text-xs text-stone-500">
                      Faculty access to manage students, assignments & progress
                    </p>
                  </div>
                </div>

                {/* Hardcoded credential notice requested by user */}
                <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-0.5 text-amber-950">
                    <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                    <span>Admin Credentials:</span>
                  </div>
                  <div className="font-mono text-[11px] text-amber-900 mt-1 flex items-center justify-between bg-white/70 px-2 py-1 rounded-md border border-amber-200">
                    <span>Username: <strong>Kellish</strong></span>
                    <span>Password: <strong>piano</strong></span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleInstructorSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Instructor Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-username-input"
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="Kellish"
                      className="block w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-600/30 focus:border-stone-800 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Instructor Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password-input"
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="piano"
                      className="block w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-600/30 focus:border-stone-800 transition"
                    />
                  </div>
                </div>

                <button
                  id="admin-login-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  {loading ? (
                    <span className="inline-block animate-spin">⏳</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                      <span>Access Instructor Admin Portal</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
