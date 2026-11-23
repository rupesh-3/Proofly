import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User as UserIcon, 
  ArrowRight, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ChevronRight,
  Database,
  Info
} from 'lucide-react';
import { resetPassword } from '../../lib/supabase-auth';

interface AuthPageProps {
  onSuccess?: () => void;
  onExplorePublic?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onExplorePublic }) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    isConfigured 
  } = useAuth();
  const { setActiveTab, triggerCelebration } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up state
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'placement'>('student');
  const [department, setDepartment] = useState('Computer Science & AI');
  const [batch, setBatch] = useState<number>(2026);

  // Status feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signInEmail.trim() || !signInPassword) {
      setErrorMessage('Please provide both your institutional email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isConfigured) {
        await signInWithEmail(signInEmail.trim(), signInPassword);
        triggerCelebration();
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage('Authentication service is not configured. Please check environment variables.');
      }
    } catch (err: any) {
      console.error('[AuthPage] Sign in failed:', err);
      const msg = err?.message || 'Invalid login credentials. Please verify your email and password.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!signUpEmail.trim()) {
      setErrorMessage('Please enter an institutional email address.');
      return;
    }
    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      if (isConfigured) {
        const result = await signUpWithEmail(
          signUpEmail.trim(),
          signUpPassword,
          signUpName.trim(),
          selectedRole,
          department,
          batch
        );
        triggerCelebration();
        if (result?.needsConfirmation) {
          setSuccessMessage(
            'Account created! Check your inbox to confirm your email before signing in.'
          );
        } else {
          setSuccessMessage('Account created and verified! Redirecting to workspace...');
          if (onSuccess) onSuccess();
        }
      } else {
        setErrorMessage('Registration service is not configured.');
      }
    } catch (err: any) {
      console.error('[AuthPage] Sign up failed:', err);
      setErrorMessage(err?.message || 'Unable to register account. Please check details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!signInEmail) {
      setErrorMessage('Please enter your email above first to send a password reset link.');
      return;
    }
    if (!isConfigured) {
      setErrorMessage('Supabase is not configured yet. Set VITE_SUPABASE_ANON_KEY to send reset emails.');
      return;
    }
    try {
      await resetPassword(signInEmail);
      setResetSent(true);
      setSuccessMessage(`Password reset link sent to ${signInEmail}!`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col justify-between relative overflow-hidden">
      
      {/* Top Navigation / Brand Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">PROOFLY</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                Institutional Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Proof Over Claim · Competency & Originality Verification</p>
          </div>
        </div>

        {onExplorePublic && (
          <button
            onClick={onExplorePublic}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Learn about platform</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 py-6 flex-1 flex flex-col justify-center w-full">
        
        {/* Security & Cryptographic Trust Banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-slate-800 font-semibold">Zero-Trust Credentialing Network</span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">W3C Verifiable Credentials · Ed25519 Signed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-mono text-[11px]">
              Adaptive Defense & Provenance Active
            </span>
          </div>
        </div>

        {/* Auth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
          
          {/* Left Column: Brand Pitch */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 font-bold block mb-1">
                  Institutional Identity Gateway
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  Proof Over Claim. <br />
                  <span className="text-indigo-600">
                    Independently Verified.
                  </span>
                </h1>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  Competencies are evaluated via AST provenance analysis, adaptive Socratic peer defense, and sovereign faculty review.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-3 pt-1">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Sovereign Faculty Authority</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Direct academic review with rubric scoring and overrides.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Adaptive Socratic Defense</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Counterfactual challenge & live code challenge verification.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <div className="p-2 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 shrink-0 mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Ed25519 Merkle Attestation</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      W3C Verifiable Credentials with tamper-proof signatures.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Security Notice */}
            <div className="pt-6 mt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-indigo-600" />
                <span className="text-[11px] font-mono text-slate-700 font-semibold uppercase tracking-wider">
                  Campus Identity Protection
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Direct authentication via Supabase Auth and Row Level Security ensures institutional credentials and student portfolios remain tamper-proof.
              </p>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Tab Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Feedback messages */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{successMessage}</div>
                </div>
              )}

              {/* SIGN IN FORM */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Institutional Email (.edu or campus domain)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        placeholder="alex.rivera@stanford.edu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-slate-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] text-indigo-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Institutional Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* SIGN UP FORM */}
              {mode === 'signup' && (
                <form onSubmit={handleSignUp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">
                      Select Institutional Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedRole === 'student'
                            ? 'bg-indigo-50 border-indigo-400 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 mb-1 text-indigo-600" />
                        <div className="text-xs font-semibold">Student</div>
                        <div className="text-[10px] text-slate-500">Build proof graph</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('faculty')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedRole === 'faculty'
                            ? 'bg-indigo-50 border-indigo-400 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mb-1 text-emerald-600" />
                        <div className="text-xs font-semibold">Faculty</div>
                        <div className="text-[10px] text-slate-500">Verify & review</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('placement')}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedRole === 'placement'
                            ? 'bg-indigo-50 border-indigo-400 text-slate-900'
                            : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Briefcase className="w-4 h-4 mb-1 text-sky-600" />
                        <div className="text-xs font-semibold">Placement</div>
                        <div className="text-[10px] text-slate-500">Post & hire</div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={signUpName}
                          onChange={e => setSignUpName(e.target.value)}
                          placeholder="Maya Chen"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Campus Email (.edu)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={e => setSignUpEmail(e.target.value)}
                          placeholder="maya.chen@berkeley.edu"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Department / Major
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="Computer Science & Engineering"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Batch / Year
                      </label>
                      <select
                        value={batch}
                        onChange={e => setBatch(parseInt(e.target.value) || 2026)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      >
                        <option value={2025}>Class of 2025</option>
                        <option value={2026}>Class of 2026</option>
                        <option value={2027}>Class of 2027</option>
                        <option value={2028}>Class of 2028</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Choose Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Institutional Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">FERPA & Academic Integrity Protocol</span>
              <span>Encrypted via Supabase Auth</span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-slate-400">
        Proofly Platform © 2026 · Institutional Competency & Credentialing Network
      </footer>

    </div>
  );
};
