import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Mail
} from 'lucide-react';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { allUsers, switchUser, setActiveTab, triggerCelebration } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('alex.rivera@stanford.edu');

  if (!isOpen) return null;

  const handleSelectDemoUser = (userId: string) => {
    switchUser(userId);
    const user = allUsers.find(u => u.id === userId);
    if (user?.role === 'student') setActiveTab('dashboard');
    else if (user?.role === 'faculty') setActiveTab('faculty');
    else setActiveTab('placement');
    triggerCelebration();
    onClose();
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = allUsers.find(u => u.role === selectedRole);
    if (matched) {
      handleSelectDemoUser(matched.id);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl rounded-[16px] bg-[#242C41] border border-[rgba(255,255,255,0.18)] shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 text-left"
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
                <span>Institutional proposal originality</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#B4BCD0]">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8] shrink-0" />
                <span>Evidence-based matching</span>
              </div>
            </div>
          </div>

          <div className="pt-6 text-[10px] font-mono-data text-[#8A94AD]">
            Single Sign-On enabled for 140+ institutional university domains.
          </div>
        </div>

        {/* Right Side: Role & Account Switcher Form */}
        <div className="md:col-span-7 p-6 space-y-5 flex flex-col justify-between relative">
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 p-1 text-[#8A94AD] hover:text-[#F1F4FA]"
          >
            <X className="w-5 h-5" />
          </button>

          <div>
            <div className="text-xs font-mono-data text-[#7C8CFF] uppercase tracking-wider mb-1">
              Select Demo Persona
            </div>
            <h2 className="font-display text-xl font-bold text-[#F1F4FA] mb-1">
              Instant Institutional Access
            </h2>
            <p className="text-xs text-[#B4BCD0] mb-4">
              Switch directly into realistic profiles with verified evidence graphs already seeded.
            </p>

            {/* Quick Demo Persona Tiles */}
            <div className="space-y-2 mb-4">
              {allUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectDemoUser(u.id)}
                  className="w-full p-2.5 rounded-[10px] bg-[#1C2233] hover:bg-[#2D3650] border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] transition-all flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-[8px] object-cover" />
                    <div>
                      <div className="font-semibold text-xs text-[#F1F4FA] group-hover:text-[#7C8CFF] transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[10px] text-[#8A94AD] font-mono-data">
                        {u.role.toUpperCase()} · {u.department}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8A94AD] group-hover:text-[#F1F4FA] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </div>

            {/* Custom institutional email login simulation */}
            <form onSubmit={handleCustomLogin} className="space-y-2.5 pt-3 border-t border-[rgba(255,255,255,0.10)]">
              <span className="text-[11px] font-mono-data text-[#8A94AD] block">Or log in with .edu email:</span>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your.name@university.edu"
                  className="w-full pl-9 pr-3.5 py-1.5 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-[8px] bg-[#7C8CFF] hover:bg-[#6a7bff] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Continue with Institutional SSO</span>
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
