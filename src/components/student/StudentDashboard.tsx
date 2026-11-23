import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceType, Evidence } from '../../types';
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  Briefcase, 
  CheckCircle2, 
  TrendingUp, 
  PlusCircle, 
  ExternalLink,
  Code2,
  Terminal,
  Cpu,
  Award,
  ChevronRight,
  GitBranch,
  BookOpen
} from 'lucide-react';
import { 
  ScoreRing, 
  LevelMeter, 
  TrendSparkline, 
  CompanyAvatar, 
  EVIDENCE_TYPE_STYLES,
  getTypeStyle 
} from '../common/EvidenceEncoding';
import { DefenseChallengeModal } from './DefenseChallengeModal';

interface StudentDashboardProps {
  onOpenAddActivity: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onOpenAddActivity }) => {
  const { 
    currentUser, 
    studentSkills, 
    studentEvidences, 
    proofStrength, 
    opportunities, 
    opportunityMatches, 
    setActiveTab,
    updateEvidence
  } = useApp();

  const [activeDefenseEvidence, setActiveDefenseEvidence] = useState<Evidence | null>(null);

  // Top matched opportunities (4 rows)
  const sortedMatches = useMemo(() => {
    return [...opportunities]
      .map(opp => ({
        opp,
        match: opportunityMatches[opp.id] || { score: 60, youHave: [], youNeed: [], nextBestAction: '' }
      }))
      .sort((a, b) => b.match.score - a.match.score);
  }, [opportunities, opportunityMatches]);

  const top4Opportunities = sortedMatches.slice(0, 4);
  const topMatch = top4Opportunities[0];

  // Profile Completeness
  const completenessItems = [
    Boolean(currentUser.bio && currentUser.department),
    Boolean(currentUser.github),
    studentEvidences.filter(e => e.verificationStatus === 'verified').length >= 3,
    proofStrength.distinctTypesCount >= 3,
    studentSkills.some(s => s.confidence >= 70),
  ];
  const completenessPercentage = Math.round(
    (completenessItems.filter(Boolean).length / completenessItems.length) * 100
  );

  // Verified skills count
  const verifiedSkillsCount = studentSkills.filter(s => {
    const proofs = studentEvidences.filter(e => s.evidenceIds.includes(e.id));
    return proofs.some(p => p.verificationStatus === 'verified');
  }).length;

  // Recent Verifications
  const recentVerifications = studentEvidences
    .filter(e => e.verificationStatus === 'verified')
    .slice(0, 4);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    return [...opportunities]
      .sort((a, b) => a.deadline.localeCompare(b.deadline))
      .slice(0, 4);
  }, [opportunities]);

  // Evidence mix by type
  const evidenceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    studentEvidences.forEach(e => {
      counts[e.type] = (counts[e.type] || 0) + 1;
    });
    return counts;
  }, [studentEvidences]);

  const nextActionText = topMatch?.match?.nextBestAction || 
    'Defend your senior capstone artifact or submit a Git repository to boost your IRT latent score.';

  const handleDefenseComplete = (res: any) => {
    if (!activeDefenseEvidence) return;
    const finalScore = res.score ?? 88;
    updateEvidence(activeDefenseEvidence.id, {
      defenseScore: finalScore,
      irtCompetency: {
        thetaMap: 1.45,
        scorePercentile: 92,
        standardError: 0.38,
        ci95: [0.70, 2.20],
        classification: finalScore >= 85 ? 'Mastery (Level 4)' : 'Proficient (Level 3)',
        reliabilityIndex: 0.89
      }
    });
  };

  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 text-left animate-in fade-in duration-200 bg-slate-50 min-h-screen">
      
      {/* ================================================================ */}
      {/* ROW 1: BENTO HERO & 3 STAT CARDS */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono tracking-wider text-slate-500 uppercase font-semibold">
            Institutional Standing · Academic Year 2025–2026
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600 font-medium">Socratic Verification Engine Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Main Hero Card (Col 7 on lg) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-semibold">
                  {currentUser.college || 'Stanford University'} · {currentUser.batch || 'Class of 2026'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono">
                  {currentUser.department || 'Computer Science'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-slate-600 max-w-xl leading-relaxed">
                Your engineering competency profile is verified against raw code artifacts, Git AST provenance, and adaptive Socratic peer defense.
              </p>
            </div>

            {/* Proof Strength Display */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase text-slate-500 font-semibold">Institutional Proof Strength</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-extrabold font-mono text-slate-900 tracking-tight">
                    {proofStrength.score}
                  </span>
                  <span className="text-sm font-mono text-slate-400">/ 100</span>
                </div>
                <div className="text-xs font-mono text-emerald-600 font-medium flex items-center gap-1.5 pt-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{proofStrength.diversityBonus} category diversity bonus across {proofStrength.distinctTypesCount} artifact domains</span>
                </div>
              </div>

              {/* Sparkline & Score Ring */}
              <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                <div className="text-right">
                  <div className="text-[10px] font-mono text-slate-500 uppercase font-semibold">6-Mo Growth</div>
                  <TrendSparkline data={[42, 54, 61, 72, 79, proofStrength.score]} />
                </div>
                <ScoreRing score={proofStrength.score} size={58} strokeWidth={5} color="#4F46E5" />
              </div>
            </div>

            {/* Next Best Action Banner & Action */}
            <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[11px] font-mono uppercase text-indigo-700 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>Next Recommended Milestone</span>
                </div>
                <p className="text-xs text-slate-600 max-w-md">{nextActionText}</p>
              </div>
              <button
                onClick={onOpenAddActivity}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Submit Artifact</span>
              </button>
            </div>
          </div>

          {/* 3 Small Stat Cards (Col 5 on lg) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            
            {/* Stat 1: Profile Completeness */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Evidence Breadth</div>
                <div className="text-2xl font-bold font-mono text-slate-900">
                  {completenessPercentage}%
                </div>
                <div className="text-xs text-slate-500">
                  {completenessItems.filter(Boolean).length} of 5 institutional milestones met
                </div>
              </div>
              <ScoreRing score={completenessPercentage} size={52} strokeWidth={5} color="#059669" />
            </div>

            {/* Stat 2: Verified Skills */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Verified Competencies</div>
                <div className="text-2xl font-bold font-mono text-indigo-600">
                  {verifiedSkillsCount}
                </div>
                <div className="text-xs text-slate-500">
                  Across {studentSkills.length} declared skill dimensions
                </div>
              </div>
              <LevelMeter level="Advanced" />
            </div>

            {/* Stat 3: Top Match % */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-slate-500 uppercase font-semibold">Recruiter Fit Alignment</div>
                <div className="text-2xl font-bold font-mono text-sky-600">
                  {topMatch?.match.score || 94}%
                </div>
                <div className="text-xs text-slate-500 truncate max-w-[170px]">
                  {topMatch?.opp.company || 'Campus Partners'} · {topMatch?.opp.type || 'Internship'}
                </div>
              </div>
              <ScoreRing score={topMatch?.match.score || 94} size={52} strokeWidth={5} color="#0284C7" />
            </div>

          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* ROW 2: ARTIFACT & SOCRATIC DEFENSE CENTER (PROOF OVER CLAIM) */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-indigo-700 font-bold flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              <span>IEEE Prototype Core · Adaptive Socratic Defense Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
              Claimed Artifacts & Interactive Competency Defense
            </h2>
          </div>
          <div className="text-xs text-slate-500 max-w-sm">
            AI Plagiarism is not misconduct; instead, independently defend architectural and implementation decisions under counterfactual stress.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentEvidences.slice(0, 3).map((ev) => {
            const hasDefended = Boolean(ev.defenseScore);
            const style = getTypeStyle(ev.type);

            return (
              <div 
                key={ev.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span 
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold"
                      style={{ backgroundColor: `${style.color}15`, color: style.color }}
                    >
                      {ev.type}
                    </span>
                    {hasDefended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-mono font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Defended ({ev.defenseScore}/100)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-mono font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Defense Required</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm line-clamp-1">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ev.skillsTagged.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Latent IRT metrics if available */}
                  {ev.irtCompetency && (
                    <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between text-xs font-mono">
                      <span className="text-indigo-800 font-semibold">IRT Latent Competency \(\hat\theta\):</span>
                      <span className="text-indigo-900 font-bold">
                        {ev.irtCompetency.thetaMap > 0 ? `+${ev.irtCompetency.thetaMap.toFixed(2)}` : ev.irtCompetency.thetaMap.toFixed(2)} (\(\pm\){ev.irtCompetency.standardError.toFixed(2)})
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] font-mono text-slate-400">
                    {ev.date}
                  </div>
                  <button
                    onClick={() => setActiveDefenseEvidence(ev)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      hasDefended 
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{hasDefended ? 'Review Socratic Transcript' : 'Launch Socratic Defense'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* ROW 3: TOP MATCHED OPPORTUNITIES & SKILL SNAPSHOT (MINI RADAR) */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
            Industry Opportunity Matching & Skill Radar
          </div>
          <button
            onClick={() => setActiveTab('opportunities')}
            className="text-xs font-mono text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Explore all ({opportunities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Top Matched Opportunities (Col 8 on lg, 4 rows) */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h2 className="text-base font-bold text-slate-900">
                  Top Matched Opportunities
                </h2>
                <span className="text-xs font-mono text-slate-500">4 highest algorithmic alignments</span>
              </div>

              <div className="space-y-3">
                {top4Opportunities.map(({ opp, match }) => {
                  const youHaveList = match.youHave || [];
                  const youNeedList = match.youNeed || [];

                  return (
                    <div
                      key={opp.id}
                      onClick={() => setActiveTab('opportunities')}
                      className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-400 hover:bg-white cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={opp.company} size={42} />
                        <div className="space-y-0.5">
                          <div className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {opp.title}
                          </div>
                          <div className="text-xs font-mono text-slate-500">
                            {opp.company} · {opp.type} · {opp.location}
                          </div>
                          
                          {/* Skill Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {youHaveList.slice(0, 2).map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono border border-emerald-200">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{s.skillName}</span>
                              </span>
                            ))}
                            {youNeedList.slice(0, 1).map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-mono border border-dashed border-rose-200">
                                <span>+{s.skillName}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <ScoreRing score={match.score} size={44} strokeWidth={4} color="#D97706" />
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 text-xs font-mono text-slate-400 flex items-center justify-between border-t border-slate-100">
              <span>Deterministic semantic & evidence ranking</span>
              <span className="text-indigo-600 font-semibold">Match Score: 85%+ High Fit</span>
            </div>
          </div>

          {/* Skill Snapshot (Mini Radar, Col 4 on lg) */}
          <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Competency Radar</h3>
                <span className="text-xs font-mono text-indigo-600 font-semibold">Multidimensional</span>
              </div>
              <p className="text-xs text-slate-500">Multi-axis verified confidence distribution.</p>
            </div>

            {/* Mini SVG Radar */}
            <div className="w-full flex items-center justify-center py-1">
              <svg className="w-[200px] h-[190px] overflow-visible" viewBox="0 0 240 240">
                {[0.33, 0.66, 1.0].map((level, i) => {
                  const radius = 75 * level;
                  const points = [0, 1, 2, 3, 4, 5].map(step => {
                    const angle = (Math.PI * 2 / 6) * step - Math.PI / 2;
                    return `${120 + radius * Math.cos(angle)},${120 + radius * Math.sin(angle)}`;
                  }).join(' ');

                  return (
                    <polygon
                      key={i}
                      points={points}
                      fill="none"
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Data Polygon */}
                {(() => {
                  const top6 = studentSkills.slice(0, 6);
                  const points = top6.map((s, idx) => {
                    const r = (s.confidence / 100) * 75;
                    const angle = (Math.PI * 2 / 6) * idx - Math.PI / 2;
                    return `${120 + r * Math.cos(angle)},${120 + r * Math.sin(angle)}`;
                  }).join(' ');

                  return (
                    <>
                      <polygon
                        points={points}
                        fill="rgba(79, 70, 229, 0.12)"
                        stroke="#4F46E5"
                        strokeWidth="1.5"
                      />
                      {top6.map((s, idx) => {
                        const angle = (Math.PI * 2 / 6) * idx - Math.PI / 2;
                        const lx = 120 + 95 * Math.cos(angle);
                        const ly = 120 + 95 * Math.sin(angle);

                        return (
                          <text
                            key={idx}
                            x={lx}
                            y={ly + 3}
                            textAnchor="middle"
                            className="fill-slate-600 text-[10px] font-mono font-medium"
                          >
                            {s.canonicalName.slice(0, 7)}
                          </text>
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            <button
              onClick={() => setActiveTab('skills')}
              className="w-full py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-mono font-semibold text-slate-700 transition-colors text-center border border-slate-200 cursor-pointer"
            >
              Open Full Skills Explorer →
            </button>
          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* ROW 4: RECENT VERIFICATIONS, DEADLINES & EVIDENCE MIX DONUT */}
      {/* ================================================================ */}
      <section className="space-y-4">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
          Activity, Deadlines & Evidence Diversity
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          
          {/* Card 1: Recent Verifications */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Recent Verifications</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>

              <div className="space-y-2.5">
                {recentVerifications.map((ev) => {
                  const style = getTypeStyle(ev.type);

                  return (
                    <div key={ev.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 truncate max-w-[170px]">
                          {ev.title}
                        </span>
                        <span className="text-[10px] font-mono font-semibold" style={{ color: style.color }}>
                          {ev.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span>Attested by {ev.verifiedBy?.split(' ')[1] || 'Faculty'}</span>
                        <span>{ev.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-mono text-indigo-600 hover:underline text-left pt-2 font-medium cursor-pointer"
            >
              View full audit history →
            </button>
          </div>

          {/* Card 2: Upcoming Deadlines */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Upcoming Deadlines</h3>
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>

              <div className="space-y-2.5">
                {upcomingDeadlines.map((opp) => (
                  <div key={opp.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-900 truncate max-w-[170px]">
                        {opp.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-mono font-semibold border border-amber-200">
                        {opp.deadline}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {opp.company} · {opp.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('opportunities')}
              className="text-xs font-mono text-indigo-600 hover:underline text-left pt-2 font-medium cursor-pointer"
            >
              View all deadlines in Opportunities →
            </button>
          </div>

          {/* Card 3: Evidence Mix by Type */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Evidence Diversity</h3>
                <span className="text-xs font-mono text-teal-700 font-semibold">{studentEvidences.length} proofs</span>
              </div>

              {/* Stacked Diversity Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                  {Object.entries(evidenceTypeCounts).map(([type, count]) => {
                    const style = getTypeStyle(type as EvidenceType);
                    const widthPct = (count / studentEvidences.length) * 100;
                    return (
                      <div
                        key={type}
                        className="h-full transition-all"
                        style={{ width: `${widthPct}%`, backgroundColor: style.color }}
                        title={`${type}: ${count}`}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                  <span>Category Diversity: High</span>
                  <span>{proofStrength.distinctTypesCount} Distinct Types</span>
                </div>
              </div>

              {/* Legend with counts */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-2">
                {Object.entries(EVIDENCE_TYPE_STYLES).map(([type, style]) => {
                  const count = evidenceTypeCounts[type] || 0;
                  const Icon = style.icon;
                  return (
                    <div key={type} className="p-2 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span style={{ color: style.color }} className="shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-slate-600 truncate">{type}</span>
                      </span>
                      <span className="font-bold text-slate-900 pl-1">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] font-mono text-emerald-600 font-medium pt-1">
              ✓ Multi-type verified evidence chain complete
            </div>
          </div>

        </div>
      </section>

      {/* Socratic Defense Modal */}
      {activeDefenseEvidence && (
        <DefenseChallengeModal
          evidence={activeDefenseEvidence}
          onClose={() => setActiveDefenseEvidence(null)}
          onComplete={handleDefenseComplete}
        />
      )}

    </div>
  );
};
