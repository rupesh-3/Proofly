import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Mail,
  Lock,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setActiveTab, triggerCelebration } = useApp();
  const { signInWithEmail, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your institutional email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isConfigured) {
        await signInWithEmail(email.trim(), password);
        triggerCelebration();
        setActiveTab('dashboard');
        onClose();
      } else {
        setErrorMsg('Authentication service is not configured.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-[16px] bg-[#242C41] border border-[rgba(255,255,255,0.18)] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side: Brand Visual Atmosphere */}
        <div className="md:col-span-5 p-6 bg-[#1C2233] border-b md:border-b-0 md:border-r border-[rgba(255,255,255,0.10)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-10 h-10 rounded-[10px] bg-[#7C8CFF] flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>

            <div>
              <span className="font-display text-xl font-bold text-[#F1F4FA] tracking-tight">PROOFLY</span>
              <p className="text-xs text-[#8A94AD] mt-0.5">Campus Professional Intelligence</p>
            </div>

            <div className="pt-4 space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-[#B4BCD0]">
                <CheckCircle2 className="w-4 h-4 text-[#4ADE80] shrink-0" />
                <span>Zero unverified claims</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#B4BCD0]">
                <CheckCircle2 className="w-4 h-4 text-[#7C8CFF] shrink-0" />
                <span>Deterministic proposal checks</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#B4BCD0]">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Evidence-based matching</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[10px] font-mono-data text-[#8A94AD]">
            Secured via Supabase Row-Level Security
          </div>
        </div>

        {/* Right Side: Account Sign In Form */}
        <div className="md:col-span-7 p-6 space-y-5 flex flex-col justify-between relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-1 text-[#8A94AD] hover:text-[#F1F4FA] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="text-xs font-mono-data text-[#7C8CFF] uppercase tracking-wider mb-1">
              Institutional Gateway
            </div>
            <h2 className="font-display text-xl font-bold text-[#F1F4FA] mb-1">
              Sign In to Proofly
            </h2>
            <p className="text-xs text-[#B4BCD0] mb-4">
              Enter your verified credentials to access your academic portfolio.
            </p>

            {errorMsg && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono-data text-[#8A94AD] block mb-1">Institutional Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-9 pr-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono-data text-[#8A94AD] block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-[8px] bg-[#7C8CFF] hover:bg-[#6a7bff] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="text-[10px] font-mono-data text-[#8A94AD] text-center">
            FERPA & Academic Integrity Compliant Protocol
          </div>
        </div>

      </div>
    </div>
  );
};
