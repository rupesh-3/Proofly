import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Sparkles, 
  Compass, 
  Briefcase, 
  ArrowRight, 
  X
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const { 
    isCommandPaletteOpen, 
    setCommandPaletteOpen, 
    setActiveTab, 
    switchUser, 
    allUsers,
    studentSkills,
    opportunities
  } = useApp();

  const [query, setQuery] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    if (isCommandPaletteOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  // Reset query on open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  const filteredNavigation = useMemo(() => {
    const items = [
      { id: 'nav-dashboard', label: 'Go to Student Dashboard', action: () => setActiveTab('dashboard') },
      { id: 'nav-profile', label: 'Open Skill Evidence Explorer & Profile', action: () => setActiveTab('profile') },
      { id: 'nav-skills', label: 'Explore Verified Skills Radar', action: () => setActiveTab('skills') },
      { id: 'nav-opps', label: 'View Matched Opportunities & Gap Analysis', action: () => setActiveTab('opportunities') },
      { id: 'nav-checker', label: 'Run Project Idea Similarity Checker', action: () => setActiveTab('checker') },
      { id: 'nav-faculty', label: 'Open Faculty Review Hub', action: () => setActiveTab('faculty') },
      { id: 'nav-placement', label: 'Open Placement Portal & Analytics', action: () => setActiveTab('placement') },
    ];
    if (!query) return items;
    return items.filter(i => i.label.toLowerCase().includes(query.toLowerCase()));
  }, [query, setActiveTab]);

  const filteredSkills = useMemo(() => {
    if (!query) return studentSkills.slice(0, 4);
    return studentSkills.filter(s => s.canonicalName.toLowerCase().includes(query.toLowerCase())).slice(0, 4);
  }, [query, studentSkills]);

  const filteredOpportunities = useMemo(() => {
    if (!query) return opportunities.slice(0, 3);
    return opportunities.filter(o => 
      o.title.toLowerCase().includes(query.toLowerCase()) || 
      o.company.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 3);
  }, [query, opportunities]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl bg-[#242C41] border border-[rgba(255,255,255,0.18)] rounded-[16px] shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[rgba(255,255,255,0.10)]">
          <Search className="w-5 h-5 text-[#8A94AD]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a skill, role, tool, or action..."
            className="w-full px-3 py-3.5 text-sm text-[#F1F4FA] bg-transparent focus:outline-none placeholder:text-[#8A94AD] font-sans"
          />
          <button 
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 text-[#8A94AD] hover:text-[#F1F4FA] rounded-[6px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          
          {/* Navigation Items */}
          <div>
            <div className="px-3 py-1 text-[11px] font-mono-data uppercase tracking-wider text-[#8A94AD]">
              Quick Navigation
            </div>
            <div className="space-y-0.5 mt-1">
              {filteredNavigation.slice(0, 5).map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-[10px] text-[#B4BCD0] hover:text-[#F1F4FA] hover:bg-[#2D3650] transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-3.5 h-3.5 text-[#7C8CFF]" />
                    <span>{item.label}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8A94AD] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Persona Switcher */}
          <div>
            <div className="px-3 py-1 text-[11px] font-mono-data uppercase tracking-wider text-[#8A94AD]">
              Switch Persona
            </div>
            <div className="grid grid-cols-2 gap-1.5 mt-1 px-1">
              {allUsers.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u.id);
                    setCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-[10px] text-left text-xs bg-[#1C2233] hover:bg-[#2D3650] border border-[rgba(255,255,255,0.06)] transition-colors"
                >
                  <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover" />
                  <div className="truncate">
                    <div className="font-medium text-[#F1F4FA] truncate">{u.name}</div>
                    <div className="text-[10px] text-[#8A94AD] capitalize">{u.role}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Skills Matches */}
          {filteredSkills.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono-data uppercase tracking-wider text-[#8A94AD]">
                Skills in Profile
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredSkills.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveTab('skills');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-[10px] text-[#B4BCD0] hover:text-[#F1F4FA] hover:bg-[#2D3650] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <span className="font-medium text-[#F1F4FA]">{s.canonicalName}</span>
                      <span className="text-[11px] text-[#8A94AD]">· {s.level}</span>
                    </div>
                    <div className="font-mono-data text-xs text-[#7C8CFF]">
                      {s.confidence}/100
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Opportunities Matches */}
          {filteredOpportunities.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-mono-data uppercase tracking-wider text-[#8A94AD]">
                Matched Opportunities
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredOpportunities.map(o => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setActiveTab('opportunities');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs text-left rounded-[10px] text-[#B4BCD0] hover:text-[#F1F4FA] hover:bg-[#2D3650] transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Briefcase className="w-3.5 h-3.5 text-[#7C8CFF] shrink-0" />
                      <span className="truncate text-[#F1F4FA]">{o.title} · <span className="text-[#8A94AD]">{o.company}</span></span>
                    </div>
                    <span className="text-[11px] font-mono-data text-[#8A94AD] shrink-0">{o.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-[#1C2233] border-t border-[rgba(255,255,255,0.10)] flex items-center justify-between text-[11px] text-[#8A94AD] font-mono-data">
          <span>Esc to close</span>
          <span>Tab / Arrows to navigate</span>
        </div>
      </div>
    </div>
  );
};
