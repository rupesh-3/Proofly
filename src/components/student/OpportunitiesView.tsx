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
  MapPin
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
      
      // Text search
      const matchesSearch = 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        opp.company.toLowerCase().includes(searchQuery.toLowerCase());

      // Segment filter
      let matchesSegment = true;
      if (segmentFilter === 'best_match') {
        matchesSegment = match.score >= 80;
      } else if (segmentFilter === 'closing_soon') {
        matchesSegment = opp.deadline <= '2026-11-30';
      } else if (segmentFilter === 'saved') {
        matchesSegment = app?.status === 'Saved' || app?.status === 'Applied';
      }

      // Skill chip filter
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
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left animate-in fade-in duration-200">
      
      {/* ================================================================ */}
      {/* TOP CONTROLS & FILTER BAR */}
      {/* Segmented bar: All | Best match | Closing soon | Saved + Search */}
      {/* ================================================================ */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FF] tracking-tight">
              Opportunity Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#BAC2DC] mt-0.5">
              Ranked dynamically by verified code artifacts, capstones, and institutional credentials.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#8F99B8] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search roles or companies..."
              className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#222A52] border border-[rgba(255,255,255,0.12)] text-xs text-[#F4F6FF] placeholder:text-[#8F99B8] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>
        </div>

        {/* Segmented Filter Pills & Skill Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Segmented Tabs */}
          <div className="flex p-1 rounded-full bg-[#1A2040] border border-[rgba(255,255,255,0.08)]">
            {[
              { id: 'all', label: 'All Postings' },
              { id: 'best_match', label: 'Best Match (80%+)' },
              { id: 'closing_soon', label: 'Closing Soon' },
              { id: 'saved', label: 'Saved / Applied' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSegmentFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-mono-data transition-all ${
                  segmentFilter === tab.id
                    ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-sm'
                    : 'text-[#BAC2DC] hover:text-[#F4F6FF]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Skill Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-data">
            <span className="text-[#8F99B8] text-[11px] mr-1">Skill:</span>
            {popularSkills.map(sk => (
              <button
                key={sk}
                onClick={() => setSelectedSkillFilter(sk)}
                className={`px-2.5 py-1 rounded-full text-[11px] transition-colors ${
                  selectedSkillFilter === sk
                    ? 'bg-[#8B7CFF] text-white font-semibold'
                    : 'bg-[#222A52] text-[#8F99B8] hover:text-[#F4F6FF]'
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2-COLUMN OPPORTUNITY CARDS GRID */}
      {/* company gradient logo, role, match ring, chip row (green checks, coral gap), */}
      {/* deadline chip, status pill */}
      {/* ================================================================ */}
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
              className="p-6 rounded-[22px] bg-[#222A52] card-glass hover:border-[#8B7CFF]/50 cursor-pointer transition-all shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Header: Company Avatar, Titles & Match Ring */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <CompanyAvatar name={opp.company} size={44} />
                    <div>
                      <h2 className="font-display text-base font-bold text-[#F4F6FF] group-hover:text-[#8B7CFF] transition-colors line-clamp-1">
                        {opp.title}
                      </h2>
                      <div className="text-xs font-mono-data text-[#BAC2DC] flex items-center gap-2">
                        <span>{opp.company}</span>
                        <span>·</span>
                        <span>{opp.type}</span>
                        <span>·</span>
                        <span>{opp.workplaceType}</span>
                      </div>
                    </div>
                  </div>

                  <ScoreRing score={match.score} size={48} strokeWidth={4} color="#FFC773" />
                </div>

                {/* "You have X of Y skills" chip row */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono-data text-[#8F99B8] flex items-center justify-between">
                    <span>Skill Coverage: {haveCount} of {totalReq} verified</span>
                    <span className="text-[#FFC773] font-bold">{match.score}% fit</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* Green check chips for skills candidate has */}
                    {match.youHave.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 text-[11px] font-mono-data"
                      >
                        <Check className="w-3 h-3" />
                        <span>{item.skillName}</span>
                      </span>
                    ))}

                    {/* Coral dashed chips for missing skills */}
                    {match.youNeed.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FB7185]/10 text-[#FB7185] border border-dashed border-[#FB7185]/40 text-[11px] font-mono-data"
                      >
                        <AlertCircle className="w-3 h-3" />
                        <span>{item.skillName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Deadline Chip & Status Pill */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-mono-data">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#1A2040] text-[#BAC2DC] flex items-center gap-1.5 text-[11px]">
                    <Clock className="w-3 h-3 text-[#FFC773]" />
                    <span>Deadline: {opp.deadline}</span>
                  </span>

                  {appStatus && (
                    <span className="px-2.5 py-1 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] border border-[#8B7CFF]/30 font-semibold text-[11px]">
                      {appStatus}
                    </span>
                  )}
                </div>

                <span className="text-[#8B7CFF] group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                  <span>Audit breakdown</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================================================================ */}
      {/* STICKY / RIGHT DRAWER: 5 TABS */}
      {/* Match breakdown | You have | You need | Why you matched | Next best action */}
      {/* ================================================================ */}
      {selectedOpportunity && selectedMatch && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-xl h-full bg-[#1A2040] border-l border-[rgba(255,255,255,0.18)] p-6 sm:p-8 overflow-y-auto space-y-6 text-left shadow-2xl flex flex-col justify-between"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.10)]">
                <div className="flex items-center gap-3">
                  <CompanyAvatar name={selectedOpportunity.company} size={48} />
                  <div>
                    <h2 className="font-display text-xl font-bold text-[#F4F6FF]">
                      {selectedOpportunity.title}
                    </h2>
                    <div className="text-xs font-mono-data text-[#8F99B8]">
                      {selectedOpportunity.company} · {selectedOpportunity.location} · {selectedOpportunity.stipendOrSalary}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedOpportunity(null)}
                  className="p-1 rounded-[8px] text-[#8F99B8] hover:text-[#F4F6FF] hover:bg-[#222A52]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score Tile with 3 dimension bars */}
              <div className="p-5 rounded-[18px] bg-[#222A52] card-glass space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono-data uppercase text-[#8F99B8] block">CALCULATED MATCH FIT</span>
                    <span className="font-display text-3xl font-bold text-[#FFC773] font-mono-data">
                      {selectedMatch.score}%
                    </span>
                  </div>
                  <ScoreRing score={selectedMatch.score} size={54} strokeWidth={5} color="#FFC773" />
                </div>

                {/* Match Breakdown Progress Bars */}
                <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.06)] font-mono-data text-xs">
                  <div>
                    <div className="flex justify-between text-[#BAC2DC] mb-1">
                      <span>Structural Skill Fit</span>
                      <span className="text-[#4ADE80] font-bold">{selectedMatch.structuralSkillFit}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A2040]">
                      <div className="h-full bg-[#4ADE80] rounded-full" style={{ width: `${selectedMatch.structuralSkillFit}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#BAC2DC] mb-1">
                      <span>Semantic Background Fit</span>
                      <span className="text-[#38BDF8] font-bold">{selectedMatch.semanticFit}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A2040]">
                      <div className="h-full bg-[#38BDF8] rounded-full" style={{ width: `${selectedMatch.semanticFit}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[#BAC2DC] mb-1">
                      <span>Evidence Quality Strength</span>
                      <span className="text-[#8B7CFF] font-bold">{selectedMatch.evidenceStrength}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1A2040]">
                      <div className="h-full bg-[#8B7CFF] rounded-full" style={{ width: `${selectedMatch.evidenceStrength}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Segmented Tabs inside Drawer */}
              <div className="flex rounded-full bg-[#222A52] p-1 border border-[rgba(255,255,255,0.08)] overflow-x-auto">
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
                    className={`flex-1 py-1 px-2.5 rounded-full text-xs font-mono-data whitespace-nowrap transition-all ${
                      drawerTab === t.id
                        ? 'bg-[#8B7CFF] text-white font-semibold'
                        : 'text-[#BAC2DC] hover:text-[#F4F6FF]'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content by Tab */}
              <div className="space-y-3">
                {drawerTab === 'breakdown' && (
                  <div className="space-y-3 text-xs leading-relaxed text-[#BAC2DC]">
                    <div className="p-4 rounded-[14px] bg-[#222A52] space-y-1">
                      <div className="font-mono-data uppercase text-[#8F99B8] text-[10px]">Position Overview</div>
                      <p>{selectedOpportunity.description}</p>
                    </div>
                    <div className="p-4 rounded-[14px] bg-[#222A52] space-y-1.5 font-mono-data">
                      <div className="text-[10px] uppercase text-[#8F99B8]">Compensation & Window</div>
                      <div className="flex justify-between text-[#F4F6FF]">
                        <span>Stipend:</span>
                        <span>{selectedOpportunity.stipendOrSalary}</span>
                      </div>
                      <div className="flex justify-between text-[#F4F6FF]">
                        <span>Application Deadline:</span>
                        <span className="text-[#FFC773]">{selectedOpportunity.deadline}</span>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'have' && (
                  <div className="space-y-2">
                    {selectedMatch.youHave.map((item, idx) => (
                      <div key={idx} className="p-3.5 rounded-[12px] bg-[#222A52] flex items-center justify-between text-xs font-mono-data">
                        <span className="flex items-center gap-2 text-[#F4F6FF] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4ADE80]" />
                          <span>{item.skillName}</span>
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[#8F99B8]">{item.evidenceCount} verified proofs</span>
                          <span className="text-[#4ADE80] font-bold">{item.confidence}/100</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'need' && (
                  <div className="space-y-2">
                    {selectedMatch.youNeed.length > 0 ? (
                      selectedMatch.youNeed.map((item, idx) => (
                        <div key={idx} className="p-3.5 rounded-[12px] bg-[#222A52] flex items-center justify-between text-xs font-mono-data">
                          <span className="flex items-center gap-2 text-[#FB7185] font-semibold">
                            <AlertCircle className="w-3.5 h-3.5 text-[#FB7185]" />
                            <span>{item.skillName}</span>
                          </span>
                          <div className="text-right">
                            <span className="text-[#8F99B8]">Required Weight: </span>
                            <span className="text-[#FFC773] font-bold">{item.weight}/5</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 rounded-[14px] bg-[#222A52] text-center text-xs font-mono-data text-[#4ADE80]">
                        ✓ All required technical competencies are fully verified!
                      </div>
                    )}
                  </div>
                )}

                {drawerTab === 'why' && (
                  <div className="space-y-2.5">
                    {selectedMatch.whyMatched.map((reason, idx) => (
                      <div key={idx} className="p-3.5 rounded-[12px] bg-[#222A52] text-xs text-[#BAC2DC] flex items-start gap-2.5 leading-relaxed">
                        <Sparkles className="w-4 h-4 text-[#8B7CFF] shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                )}

                {drawerTab === 'action' && (
                  <div className="p-5 rounded-[16px] bg-[#222A52] space-y-3 text-xs">
                    <div className="font-mono-data uppercase text-[#FFC773] text-[10px] font-semibold">
                      Recommended Next Step
                    </div>
                    <p className="text-[#BAC2DC] leading-relaxed">
                      {selectedMatch.nextBestAction}
                    </p>
                    <div className="text-[11px] font-mono-data text-[#4ADE80] pt-1">
                      Applying shares your verified skill confidence audit with the recruiter.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Drawer Action */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.10)]">
              {getApplicationStatus(selectedOpportunity.id) ? (
                <div className="p-3 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] border border-[#4ADE80]/30 text-center text-xs font-mono-data font-semibold">
                  ✓ Profile Submitted ({getApplicationStatus(selectedOpportunity.id)})
                </div>
              ) : (
                <button
                  onClick={() => applyForOpportunity(selectedOpportunity.id)}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white text-xs font-semibold shadow-lg hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-2"
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
