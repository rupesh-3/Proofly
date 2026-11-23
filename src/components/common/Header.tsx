import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  LayoutDashboard,
  LogOut
} from 'lucide-react';

interface HeaderProps {
  onOpenAddActivity: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddActivity, onOpenAuth }) => {
  const { logOut } = useAuth();
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

  // If in public portfolio mode
  if (activeTab === 'public-portfolio') {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              title="Return to Student Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <span className="font-display text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {currentUser.name}
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono-data">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Verified on Proofly</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium transition-colors cursor-pointer shadow-xs"
            >
              Download PDF
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.origin + `/p/${currentUser.id}`);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Copy link
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md no-print shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            onClick={() => setActiveTab('overview')}
            title="Go to Website Overview"
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-600 transition-colors">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-display text-lg md:text-xl font-bold tracking-tight text-slate-900">
                PROOFLY
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {currentUser.role === 'student' ? (
            <>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                  activeTab === 'dashboard'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                  activeTab === 'opportunities'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Opportunities
              </button>
              <button
                onClick={() => setActiveTab('skills')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                  activeTab === 'skills'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Skills & Evidence
              </button>
              <button
                onClick={() => setActiveTab('checker')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                  activeTab === 'checker'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Idea Checker
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                  activeTab === 'profile'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                Portfolio
              </button>
            </>
          ) : currentUser.role === 'faculty' ? (
            <>
              <button
                onClick={() => setActiveTab('faculty')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'faculty'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Faculty Review Hub
              </button>
              <button
                onClick={() => setActiveTab('checker')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'checker'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Archive Checker
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('placement')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'placement'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Placement Hub
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                  activeTab === 'opportunities'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Opportunities
              </button>
            </>
          )}
        </nav>

        {/* Actions & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Quick Command Palette trigger */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg border border-slate-200 transition-colors"
            title="Search & Jump (Cmd+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-mono-data text-[11px] text-slate-400">⌘K</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="text-xs font-semibold text-slate-900">Notifications & Alerts</span>
                  <span className="text-[11px] font-mono-data text-slate-500">{unreadNotifications.length} unread</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.slice(0, 4).map(notif => (
                    <div 
                      key={notif.id} 
                      className={`p-2.5 rounded-lg text-xs transition-colors ${
                        notif.read ? 'bg-transparent text-slate-500' : 'bg-slate-50 text-slate-900'
                      }`}
                    >
                      <div className="font-medium text-slate-900 mb-0.5">{notif.title}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] font-mono-data text-slate-400 mt-1 block">{notif.timestamp}</span>
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
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 bg-slate-100 hover:bg-slate-200/80 rounded-full border border-slate-200 text-xs transition-colors"
            >
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                referrerPolicy="no-referrer"
                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-300" 
              />
              <span className="font-medium text-slate-900 max-w-[90px] sm:max-w-none truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono-data uppercase px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                {currentUser.role}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                <div className="px-3 py-2 text-[11px] text-slate-400 uppercase tracking-wider font-mono-data">
                  Switch Demo Persona
                </div>
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                      u.id === currentUser.id 
                        ? 'bg-blue-50 text-blue-700 font-semibold' 
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <img 
                      src={u.avatar} 
                      alt={u.name} 
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover" 
                    />
                    <div className="flex-1 truncate">
                      <div className="font-medium text-slate-900 truncate">{u.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{u.role} · {u.department}</div>
                    </div>
                  </button>
                ))}
                <div className="mt-2 pt-2 border-t border-slate-100 px-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onOpenAuth();
                    }}
                    className="w-full text-left text-[11px] text-blue-600 hover:underline py-1 block cursor-pointer"
                  >
                    Switch or connect another ID
                  </button>
                  <button
                    onClick={async () => {
                      setShowRoleDropdown(false);
                      await logOut();
                    }}
                    className="w-full text-left text-[11px] text-red-600 hover:bg-red-50 rounded-md px-1.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Workspace</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          {currentUser.role === 'student' ? (
            <button
              onClick={onOpenAddActivity}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Proof</span>
            </button>
          ) : currentUser.role === 'faculty' ? (
            <button
              onClick={() => setActiveTab('faculty')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Review Queue</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('placement')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition-all shadow-xs active:scale-95 whitespace-nowrap"
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
