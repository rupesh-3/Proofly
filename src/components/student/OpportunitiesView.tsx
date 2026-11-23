import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Search, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Bookmark, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  MapPin,
  Building
} from 'lucide-react';
import { Opportunity, MatchResult, ApplicationStatus } from '../../types';
import { 
  ScoreRing, 
  CompanyAvatar, 
  StatusIndicator 
} from '../common/EvidenceEncoding';

export const OpportunitiesView: React.FC = () => {
  const { 
    opportunities, 
    opportunityMatches, 
    applyForOpportunity, 
    studentApplications,
    studentSkills
  } = useApp();

  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'best_match' | 'closing_soon' | 'saved'>('all');
  const [selectedSkillFilter, setSelectedSkillFilter] = useState<string>('all');
  
  // Drawer tab
  const [drawerTab, setDrawerTab] = useState<'breakdown' | 'have' | 'need' | 'why' | 'action'>('breakdown');

  // Available skills for filter chips
  const popularSkills = ['all', 'Python', 'PyTorch', 'TypeScript', 'Docker', 'React'];

  // Filter logic
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const match = opportunityMatches[opp.id] || { score: 60 };
      const app = studentApplications.find(a => a.opportunityId === opp.id);
      
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        opp.company.toLowerCase().includes(searchQuery.toLowerCase());

      let matchesSegment = true;
      if (segmentFilter === 'best_match') {
        matchesSegment = match.score >= 80;
      } else if (segmentFilter === 'closing_soon') {
        matchesSegment = opp.deadline <= '2026-11-30';
      } else if (segmentFilter === 'saved') {
        matchesSegment = app?.status === 'Saved' || app?.status === 'Applied';
      }

      let matchesSkill = true;
      if (selectedSkillFilter !== 'all') {
        matchesSkill = opp.requiredSkills.some(rs => 
          rs.skillName.toLowerCase() === selectedSkillFilter.toLowerCase()
        );
      }

      return matchesSearch && matchesSegment && matchesSkill;
    });
  }, [opportunities, opportunityMatches, studentApplications, searchQuery, segmentFilter, selectedSkillFilter]);

  const selectedMatch: MatchResult | undefined = selectedOpportunity 
    ? opportunityMatches[selectedOpportunity.id] 
    : undefined;

  const getApplicationStatus = (oppId: string): ApplicationStatus | undefined => {
    return studentApplications.find(a => a.opportunityId === oppId)?.status;
  };

  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left bg-slate-50 min-h-screen animate-in fade-in duration-200">
      
      {/* TOP CONTROLS & FILTER BAR */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Opportunity Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Ranked dynamically by verified code artifacts, capstones, and institutional credentials.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search roles or companies..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 shadow-xs"
            />
          </div>
        </div>

        {/* Segmented Filter Pills & Skill Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Segmented Tabs */}
          <div className="flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/70">
            {[
              { id: 'all', label: 'All Postings' },
              { id: 'best_match', label: 'Best Match (80%+)' },
              { id: 'closing_soon', label: 'Closing Soon' },
              { id: 'saved', label: 'Saved / Applied' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSegmentFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  segmentFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Skill Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400 text-[11px] mr-1">Filter by skill:</span>
            {popularSkills.map(sk => (
              <button
                key={sk}
                onClick={() => setSelectedSkillFilter(sk)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                  selectedSkillFilter === sk
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2-COLUMN OPPORTUNITY CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOpportunities.map(opp => {
          const match = opportunityMatches[opp.id] || { score: 65, youHave: [], youNeed: [] };
          const appStatus = getApplicationStatus(opp.id);
          const haveCount = match.youHave?.length || 0;
          const needCount = match.youNeed?.length || 0;
          const totalReq = haveCount + needCount || 4;

          return (
            <div
              key={opp.id}
              onClick={() => setSelectedOpportunity(opp)}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all shadow-xs flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CompanyAvatar name={opp.company} size={44} />
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {opp.title}
                      </h2>
                      <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                        <span>{opp.company}</span>
                        <span>·</span>
                        <span>{opp.type}</span>
                        <span>·</span>
                        <span>{opp.workplaceType}</span>
                      </div>
                    </div>
                  </div>

                  <ScoreRing score={match.score} size={48} strokeWidth={4} color="#D97706" />
                </div>

                {/* Skill Chips */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Skill Coverage: {haveCount} of {totalReq} verified</span>
                    <span className="text-amber-700 font-bold">{match.score}% fit</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {match.youHave.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono"
                      >
                        <Check className="w-3 h-3" />
                        <span>{item.skillName}</span>
                      </span>
                    ))}

                    {match.youNeed.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-dashed border-rose-200 text-[11px] font-mono"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{item.skillName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>Deadline: {opp.deadline}</span>
                  </span>

                  {appStatus && (
                    <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-[11px]">
                      {appStatus}
                    </span>
                  )}
                </div>

                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  <span>Audit breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER */}
      {selectedOpportunity && selectedMatch && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-xl h-full bg-white border-l border-slate-200 p-6 sm:p-8 overflow-y-auto space-y-6 text-left shadow-2xl flex flex-col justify-between"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <CompanyAvatar name={selectedOpportunity.company} size={48} />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      {selectedOpportunity.title}
                    </h2>
                    <div className="text-xs font-mono text-slate-500">
                      {selectedOpportunity.company} · {selectedOpportunity.location} · {selectedOpportunity.stipendOrSalary}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score Tile with 3 dimension bars */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-500 block font-semibold">CALCULATED MATCH FIT</span>
                    <span className="text-3xl font-bold text-amber-700 font-mono">
                      {selectedMatch.score}%
                    </span>
                  </div>
                  <ScoreRing score={selectedMatch.score} size={54} strokeWidth={5} color="#D97706" />
                </div>

                {/* Match Breakdown Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-slate-200 font-mono text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Structural Skill Fit</span>
                      <span className="text-emerald-700 font-bold">{selectedMatch.structuralSkillFit}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${selectedMatch.structuralSkillFit}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Semantic Background Fit</span>
                      <span className="text-sky-700 font-bold">{selectedMatch.semanticFit}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${selectedMatch.semanticFit}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Evidence Quality Strength</span>
                      <span className="text-indigo-700 font-bold">{selectedMatch.evidenceStrength}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${selectedMatch.evidenceStrength}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Segmented Tabs inside Drawer */}
              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 overflow-x-auto">
                {[
                  { id: 'breakdown', label: 'Overview' },
                  { id: 'have', label: `You Have (${selectedMatch.youHave.length})` },
                  { id: 'need', label: `You Need (${selectedMatch.youNeed.length})` },
                  { id: 'why', label: 'Why Matched' },
                  { id: 'action', label: 'Action' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setDrawerTab(t.id as any)}
                    className={`flex-1 py-1 px-2.5 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                      drawerTab === t.id
                        ? 'bg-white text-slate-900 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content by Tab */}
              <div className="space-y-3">
                {drawerTab === 'breakdown' && (
                  <div className="space-y-3 text-xs leading-relaxed text-slate-600">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="font-mono uppercase text-slate-500 text-[10px] font-semibold">Position Overview</div>
                      <p>{selectedOpportunity.description}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono">
                      <div className="text-[10px] uppercase text-slate-500 font-semibold">Compensation & Window</div>
                      <div className="flex justify-between text-slate-800">
                        <span>Stipend:</span>
                        <span>{selectedOpportunity.stipendOrSalary}</span>
                      </div>
                      <div className="flex justify-between text-slate-800">
                        <span>Application Deadline:</span>
                        <span className="text-amber-700 font-semibold">{selectedOpportunity.deadline}</span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'have' && (
                  <div className="space-y-2">
                    {selectedMatch.youHave.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                        <span className="flex items-center gap-2 text-slate-900 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{item.skillName}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500">{item.evidenceCount} verified proofs</span>
                          <span className="text-emerald-700 font-bold">{item.confidence}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'need' && (
                  <div className="space-y-2">
                    {selectedMatch.youNeed.length > 0 ? (
                      selectedMatch.youNeed.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                          <span className="flex items-center gap-2 text-rose-700 font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{item.skillName}</span>
                          </span>
                          <div className="text-right">
                            <span className="text-slate-500">Required Weight: </span>
                            <span className="text-amber-700 font-bold">{item.weight}/5</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-mono text-emerald-800 font-medium">
                        ✓ All required technical competencies are fully verified!
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'why' && (
                  <div className="space-y-2.5">
                    {selectedMatch.whyMatched.map((reason, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 leading-relaxed">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'action' && (
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="font-mono uppercase text-amber-800 text-[10px] font-bold">
                      Recommended Next Step
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedMatch.nextBestAction}
                    </p>
                    <div className="text-[11px] font-mono text-emerald-700 font-medium pt-1">
                      Applying shares your verified skill confidence audit with the recruiter.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Drawer Action */}
            <div className="pt-4 border-t border-slate-100">
              {getApplicationStatus(selectedOpportunity.id) ? (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-center text-xs font-mono font-semibold">
                  ✓ Profile Submitted ({getApplicationStatus(selectedOpportunity.id)})
                </div>
              ) : (
                <button
                  onClick={() => applyForOpportunity(selectedOpportunity.id)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Apply with Verified Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
