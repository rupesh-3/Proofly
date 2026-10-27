import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Search, 
  Bell, 
  PlusCircle, 
  Briefcase,
  ChevronDown,
  Sparkles,
  Layers,
  GraduationCap,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';

interface HeaderProps {
  onOpenAddActivity: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddActivity, onOpenAuth }) => {
  const { 
    currentUser, 
    allUsers, 
    switchUser, 
    activeTab, 
    setActiveTab, 
    notifications,
    setCommandPaletteOpen 
  } = useApp();

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadNotifications = notifications.filter(n => !n.read);

  // If in public portfolio mode (/p/[handle] or recruiter view), render strictly the requested minimal top bar:
  // "student name on the left, 'Verified on Proofly' mark, then 'Download PDF' and 'Copy link'. Nothing else."
  if (activeTab === 'public-portfolio') {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-[rgba(255,255,255,0.10)] bg-[#1A2040]/95 backdrop-blur-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Back to Dashboard & Student Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[#8B7CFF]/20 hover:bg-[#8B7CFF]/30 text-[#8B7CFF] border border-[#8B7CFF]/40 text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              title="Return to Student Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="h-5 w-px bg-[rgba(255,255,255,0.12)] hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <span className="font-display text-base sm:text-lg font-bold text-[#F4F6FF] tracking-tight">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 text-[11px] font-mono-data">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Verified on Proofly</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-[10px] bg-[#222A52] hover:bg-[#2B3563] text-[#F4F6FF] border border-[rgba(255,255,255,0.12)] text-xs font-medium transition-colors cursor-pointer"
            >
              Download PDF
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/p/${currentUser.id}`);
              }}
              className="px-3.5 py-1.5 rounded-[10px] bg-[#8B7CFF] hover:bg-[#7b6be8] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              Copy link
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(255,255,255,0.10)] bg-[#1A2040]/90 backdrop-blur-md no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Zone 1: Brand Title - Clicking PROOFLY logo opens Website Overview */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('overview')}
            title="Go to Website Overview"
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-[10px] bg-[#8B7CFF] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display text-lg md:text-xl font-bold tracking-tight text-[#F4F6FF] group-hover:text-[#FFC773] transition-colors">
                PROOFLY
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-[#1A2040]/70 border border-[rgba(255,255,255,0.08)]">
          {currentUser.role === 'student' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-[0_0_16px_rgba(139,124,255,0.35)]'
                    : 'text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52]/60'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'opportunities'
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-[0_0_16px_rgba(139,124,255,0.35)]'
                    : 'text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52]/60'
                }`}
              >
                Opportunities
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'skills'
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-[0_0_16px_rgba(139,124,255,0.35)]'
                    : 'text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52]/60'
                }`}
              >
                Skills & Evidence
              </button>
              <button
                onClick={() => setActiveTab('checker')}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'checker'
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-[0_0_16px_rgba(139,124,255,0.35)]'
                    : 'text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52]/60'
                }`}
              >
                Idea Checker
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 text-xs rounded-full transition-all whitespace-nowrap ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-[0_0_16px_rgba(139,124,255,0.35)]'
                    : 'text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52]/60'
                }`}
              >
                Portfolio
              </button>
            </>
          ) : currentUser.role === 'faculty' ? (
            <>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors whitespace-nowrap ${
                  activeTab === 'faculty'
                    ? 'text-[#F4F6FF] bg-[#8B7CFF]'
                    : 'text-[#8F99B8] hover:text-[#F4F6FF] hover:bg-[#222A52]'
                }`}
              >
                Faculty Review Hub
              </button>
              <button
                onClick={() => setActiveTab('checker')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors whitespace-nowrap ${
                  activeTab === 'checker'
                    ? 'text-[#F4F6FF] bg-[#8B7CFF]'
                    : 'text-[#8F99B8] hover:text-[#F4F6FF] hover:bg-[#222A52]'
                }`}
              >
                Archive Checker
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('placement')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors whitespace-nowrap ${
                  activeTab === 'placement'
                    ? 'text-[#F4F6FF] bg-[#8B7CFF]'
                    : 'text-[#8F99B8] hover:text-[#F4F6FF] hover:bg-[#222A52]'
                }`}
              >
                Placement Hub
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors whitespace-nowrap ${
                  activeTab === 'opportunities'
                    ? 'text-[#F4F6FF] bg-[#8B7CFF]'
                    : 'text-[#8F99B8] hover:text-[#F4F6FF] hover:bg-[#222A52]'
                }`}
              >
                Opportunities
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick Command Palette trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs text-[#B4BCD0] hover:text-[#F1F4FA] bg-[#242C41] hover:bg-[#2D3650] rounded-[10px] border border-[rgba(255,255,255,0.10)] transition-colors"
            title="Search & Jump (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="font-mono-data text-[11px] text-[#8A94AD]">⌘K</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-[#B4BCD0] hover:text-[#F1F4FA] rounded-[10px] hover:bg-[#242C41] transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#4ADE80] ring-2 ring-[#1C2233]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-[#242C41] border border-[rgba(255,255,255,0.18)] rounded-[16px] shadow-xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(255,255,255,0.10)]">
                  <span className="text-xs font-semibold text-[#F1F4FA]">Notifications & Alerts</span>
                  <span className="text-[11px] font-mono-data text-[#8A94AD]">{unreadNotifications.length} unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.slice(0, 4).map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-2.5 rounded-[10px] text-xs transition-colors ${
                        notif.read ? 'bg-transparent text-[#8A94AD]' : 'bg-[#2D3650] text-[#F1F4FA]'
                      }`}
                    >
                      <div className="font-medium text-[#F1F4FA] mb-0.5">{notif.title}</div>
                      <p className="text-[11px] text-[#B4BCD0] leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] font-mono-data text-[#8A94AD] mt-1 block">{notif.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 bg-[#242C41] hover:bg-[#2D3650] rounded-full border border-[rgba(255,255,255,0.10)] text-xs transition-colors"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-[#7C8CFF]" 
              />
              <span className="font-medium text-[#F1F4FA] max-w-[90px] sm:max-w-none truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-[#2D3650] text-[#B4BCD0]">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-[#8A94AD]" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-[#242C41] border border-[rgba(255,255,255,0.18)] rounded-[16px] shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-[11px] text-[#8A94AD] uppercase tracking-wider font-mono-data">
                  Switch Demo Persona
                </div>
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-[10px] text-left text-xs transition-colors ${
                      u.id === currentUser.id 
                        ? 'bg-[#7C8CFF]/20 text-[#7C8CFF] font-semibold' 
                        : 'text-[#B4BCD0] hover:bg-[#2D3650] hover:text-[#F1F4FA]'
                    }`}
                  >
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover" 
                    />
                    <div className="flex-1 truncate">
                      <div className="font-medium text-[#F1F4FA] truncate">{u.name}</div>
                      <div className="text-[10px] text-[#8A94AD] capitalize">{u.role} · {u.department}</div>
                    </div>
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.10)] px-2">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onOpenAuth();
                    }}
                    className="text-[11px] text-[#7C8CFF] hover:underline"
                  >
                    Sign in with another ID
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {currentUser.role === 'student' ? (
            <button
              onClick={onOpenAddActivity}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C8CFF] hover:bg-[#6a7bff] text-white font-medium text-xs rounded-[10px] transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Proof</span>
            </button>
          ) : currentUser.role === 'faculty' ? (
            <button
              onClick={() => setActiveTab('faculty')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C8CFF] hover:bg-[#6a7bff] text-white font-medium text-xs rounded-[10px] transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review Queue</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('placement')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C8CFF] hover:bg-[#6a7bff] text-white font-medium text-xs rounded-[10px] transition-all shadow-sm active:scale-95 whitespace-nowrap"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Post Role</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
