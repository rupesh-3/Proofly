import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/mockData';
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
    signInAsDemo, 
    isConfigured 
  } = useAuth();
  const { setActiveTab, triggerCelebration } = useApp();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  
  // Sign In state
  const [signInEmail, setSignInEmail] = useState('alex.rivera@stanford.edu');
  const [signInPassword, setSignInPassword] = useState('Proofly@2026');
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
        // Fallback to matching demo persona if Supabase not configured in .env yet
        const matchedDemo = MOCK_USERS.find(
          u => u.email.toLowerCase() === signInEmail.trim().toLowerCase()
        ) || MOCK_USERS[0];
        signInAsDemo(matchedDemo);
        triggerCelebration();
        if (onSuccess) onSuccess();
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
            'Account created! If email confirmation is enabled for your Supabase project, check your inbox to confirm your email before signing in.'
          );
        } else {
          setSuccessMessage('Account created and verified! Redirecting to workspace...');
          if (onSuccess) onSuccess();
        }
      } else {
        // Fallback mock signup
        const newDemo = {
          id: `usr-${Date.now()}`,
          name: signUpName.trim(),
          email: signUpEmail.trim(),
          role: selectedRole,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80`,
          college: 'Stanford University',
          department: department,
          headline: `${selectedRole === 'student' ? 'Student' : selectedRole === 'faculty' ? 'Faculty Professor' : 'Placement Director'} · ${department}`,
          bio: 'Registered campus capability account.',
          batch: `Class of ${batch}`,
        };
        signInAsDemo(newDemo);
        triggerCelebration();
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      console.error('[AuthPage] Sign up failed:', err);
      setErrorMessage(err?.message || 'Unable to register account. Please check details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstantDemo = (userId: string) => {
    const demo = MOCK_USERS.find(u => u.id === userId);
    if (demo) {
      signInAsDemo(demo);
      triggerCelebration();
      if (onSuccess) onSuccess();
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
    <div className="min-h-screen w-full bg-[#161B2E] text-[#F1F4FA] flex flex-col justify-between relative overflow-hidden selection:bg-[#7C8CFF]/30 selection:text-white">
      
      {/* Background Ambience Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#7C8CFF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#2DD4BF]/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#8B7CFF]/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation / Brand Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-tr from-[#7C8CFF] to-[#2DD4BF] flex items-center justify-center text-white shadow-lg shadow-[#7C8CFF]/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-xl font-bold tracking-tight text-[#F1F4FA]">PROOFLY</span>
              <span className="text-[10px] uppercase font-mono-data px-2 py-0.5 rounded-full bg-[#7C8CFF]/15 text-[#7C8CFF] border border-[#7C8CFF]/30">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-[#8A94AD] hidden sm:block">Campus Professional Capability & Originality Protocol</p>
          </div>
        </div>

        {onExplorePublic && (
          <button
            onClick={onExplorePublic}
            className="text-xs text-[#BAC2DC] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Learn about platform</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 flex-1 flex flex-col justify-center w-full">
        
        {/* Supabase Connection Status Bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-3 rounded-[12px] bg-[#1C2233]/80 border border-[rgba(255,255,255,0.08)] backdrop-blur-md text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-[#2DD4BF]" />
            <span className="text-[#B4BCD0]">Supabase Instance:</span>
            <code className="text-[#2DD4BF] font-mono-data bg-[#242C41] px-2 py-0.5 rounded text-[11px]">
              pbexpyjmsdltjhnmejjk.supabase.co
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
            <span className="text-[#8A94AD] font-mono-data text-[11px]">
              {isConfigured ? 'Supabase Auth Ready' : 'Demo Mode Active (Ready for Anon Key)'}
            </span>
          </div>
        </div>

        {/* Auth Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-[20px] bg-[#242C41]/90 border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Left Column: Brand Pitch & Highlights */}
          <div className="lg:col-span-5 p-6 sm:p-8 bg-[#1C2233]/90 border-b lg:border-b-0 lg:border-r border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
            <div className="space-y-6">
              
              <div>
                <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#7C8CFF] block mb-1">
                  Institutional Identity Gateway
                </span>
                <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F1F4FA] leading-tight">
                  Capabilities Proven. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C8CFF] to-[#2DD4BF]">
                    Zero Unverified Claims.
                  </span>
                </h1>
                <p className="text-xs text-[#8A94AD] mt-2.5 leading-relaxed">
                  Every skill, project, and milestone on Proofly is cryptographically anchored, verified by faculty, and benchmarked against departmental capstone archives.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-[12px] bg-[#242C41]/60 border border-[rgba(255,255,255,0.04)]">
                  <div className="p-2 rounded-[8px] bg-[#4ADE80]/10 text-[#4ADE80] shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#F1F4FA]">Faculty Review Attestations</h3>
                    <p className="text-[11px] text-[#8A94AD] mt-0.5">
                      Submissions evaluated for code presence, authorship, and execution rigor.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[12px] bg-[#242C41]/60 border border-[rgba(255,255,255,0.04)]">
                  <div className="p-2 rounded-[8px] bg-[#7C8CFF]/10 text-[#7C8CFF] shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#F1F4FA]">Institutional Originality Engine</h3>
                    <p className="text-[11px] text-[#8A94AD] mt-0.5">
                      pgvector 384-dim semantic similarity to identify duplicate capstone projects.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-[12px] bg-[#242C41]/60 border border-[rgba(255,255,255,0.04)]">
                  <div className="p-2 rounded-[8px] bg-[#38BDF8]/10 text-[#38BDF8] shrink-0 mt-0.5">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-[#F1F4FA]">Evidence-Driven Opportunity Fit</h3>
                    <p className="text-[11px] text-[#8A94AD] mt-0.5">
                      Students matched based on verified skill proof depth rather than resume keywords.
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Instant Persona Explorer */}
            <div className="pt-6 mt-6 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono-data text-[#BAC2DC] font-semibold uppercase tracking-wider">
                  Instant Demo Access
                </span>
                <span className="text-[10px] text-[#7C8CFF] font-mono-data">1-Click Sign In</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {MOCK_USERS.map(demo => (
                  <button
                    key={demo.id}
                    onClick={() => handleInstantDemo(demo.id)}
                    className="p-2 rounded-[10px] bg-[#242C41] hover:bg-[#2D3650] border border-[rgba(255,255,255,0.06)] hover:border-[#7C8CFF]/50 transition-all text-left group cursor-pointer"
                    title={`Sign in as ${demo.name} (${demo.role})`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <img src={demo.avatar} alt={demo.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-[10px] font-mono-data uppercase text-[#7C8CFF] group-hover:text-white">
                        {demo.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-[#F1F4FA] truncate group-hover:text-[#7C8CFF] transition-colors">
                      {demo.name.split(' ')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sign In / Sign Up Form */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            
            <div>
              {/* Tab Switcher */}
              <div className="flex items-center p-1 rounded-[12px] bg-[#1C2233] border border-[rgba(255,255,255,0.08)] mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-[10px] transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'bg-[#7C8CFF] text-white shadow-md'
                      : 'text-[#8A94AD] hover:text-[#F1F4FA]'
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
                  className={`flex-1 py-2 text-xs font-semibold rounded-[10px] transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#7C8CFF] text-white shadow-md'
                      : 'text-[#8A94AD] hover:text-[#F1F4FA]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Alert Feedback Messages */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-[10px] bg-red-500/15 border border-red-500/30 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {successMessage && (
                <div className="mb-4 p-3 rounded-[10px] bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{successMessage}</div>
                </div>
              )}

              {/* SIGN IN FORM */}
              {mode === 'signin' && (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#BAC2DC] mb-1.5">
                      Institutional Email (.edu or campus domain)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#8A94AD] absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={signInEmail}
                        onChange={e => setSignInEmail(e.target.value)}
                        placeholder="alex.rivera@stanford.edu"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF] focus:ring-1 focus:ring-[#7C8CFF] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-medium text-[#BAC2DC]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-[11px] text-[#7C8CFF] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8A94AD] absolute left-3.5 top-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signInPassword}
                        onChange={e => setSignInPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-[10px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF] focus:ring-1 focus:ring-[#7C8CFF] transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-[#8A94AD] hover:text-[#F1F4FA] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-[10px] bg-[#7C8CFF] hover:bg-[#6a7bff] text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
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
                  
                  {/* Role Selector Cards */}
                  <div>
                    <label className="block text-xs font-medium text-[#BAC2DC] mb-1.5">
                      Select Institutional Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRole('student')}
                        className={`p-2.5 rounded-[10px] border text-left transition-all cursor-pointer ${
                          selectedRole === 'student'
                            ? 'bg-[#7C8CFF]/20 border-[#7C8CFF] text-[#F1F4FA]'
                            : 'bg-[#1C2233] border-[rgba(255,255,255,0.08)] text-[#8A94AD] hover:text-[#F1F4FA]'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4 mb-1 text-[#7C8CFF]" />
                        <div className="text-xs font-semibold">Student</div>
                        <div className="text-[10px] opacity-75">Build proof graph</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('faculty')}
                        className={`p-2.5 rounded-[10px] border text-left transition-all cursor-pointer ${
                          selectedRole === 'faculty'
                            ? 'bg-[#7C8CFF]/20 border-[#7C8CFF] text-[#F1F4FA]'
                            : 'bg-[#1C2233] border-[rgba(255,255,255,0.08)] text-[#8A94AD] hover:text-[#F1F4FA]'
                        }`}
                      >
                        <Building2 className="w-4 h-4 mb-1 text-[#4ADE80]" />
                        <div className="text-xs font-semibold">Faculty</div>
                        <div className="text-[10px] opacity-75">Verify & review</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRole('placement')}
                        className={`p-2.5 rounded-[10px] border text-left transition-all cursor-pointer ${
                          selectedRole === 'placement'
                            ? 'bg-[#7C8CFF]/20 border-[#7C8CFF] text-[#F1F4FA]'
                            : 'bg-[#1C2233] border-[rgba(255,255,255,0.08)] text-[#8A94AD] hover:text-[#F1F4FA]'
                        }`}
                      >
                        <Briefcase className="w-4 h-4 mb-1 text-[#38BDF8]" />
                        <div className="text-xs font-semibold">Placement</div>
                        <div className="text-[10px] opacity-75">Post & hire</div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#BAC2DC] mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={signUpName}
                          onChange={e => setSignUpName(e.target.value)}
                          placeholder="Maya Chen"
                          className="w-full pl-9 pr-3 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#BAC2DC] mb-1">
                        Campus Email (.edu)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          value={signUpEmail}
                          onChange={e => setSignUpEmail(e.target.value)}
                          placeholder="maya.chen@berkeley.edu"
                          className="w-full pl-9 pr-3 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[#BAC2DC] mb-1">
                        Department / Major
                      </label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        placeholder="Computer Science & Engineering"
                        className="w-full px-3 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#BAC2DC] mb-1">
                        Batch / Year
                      </label>
                      <select
                        value={batch}
                        onChange={e => setBatch(parseInt(e.target.value) || 2026)}
                        className="w-full px-3 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                      >
                        <option value={2025}>Class of 2025</option>
                        <option value={2026}>Class of 2026</option>
                        <option value={2027}>Class of 2027</option>
                        <option value={2028}>Class of 2028</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#BAC2DC] mb-1">
                      Choose Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={signUpPassword}
                        onChange={e => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-9 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.12)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-[#8A94AD] hover:text-[#F1F4FA] cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-[10px] bg-gradient-to-r from-[#7C8CFF] to-[#2DD4BF] hover:opacity-95 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-1"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Institutional Account in Supabase</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>

            {/* Bottom FERPA & Security Footer */}
            <div className="pt-6 mt-6 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-[11px] text-[#8A94AD]">
              <span className="font-mono-data">FERPA & Academic Integrity Protocol</span>
              <span>Encrypted via Supabase Auth</span>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-4 text-center text-xs text-[#8A94AD]">
        Proofly Platform © 2026 · Connected to Supabase <code className="text-[#7C8CFF]">pbexpyjmsdltjhnmejjk</code>
      </footer>

    </div>
  );
};

