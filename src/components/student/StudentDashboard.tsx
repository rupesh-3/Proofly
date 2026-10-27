import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { EvidenceType } from '../../types';
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
  ExternalLink 
} from 'lucide-react';
import { 
  ScoreRing, 
  LevelMeter, 
  StatusIndicator, 
  TrendSparkline, 
  CompanyAvatar, 
  EVIDENCE_TYPE_STYLES,
  getTypeStyle 
} from '../common/EvidenceEncoding';

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
    setActiveTab 
  } = useApp();

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

  // Recent Verifications (timeline items)
  const recentVerifications = studentEvidences
    .filter(e => e.verificationStatus === 'verified')
    .slice(0, 4);

  // Upcoming deadlines (with countdown)
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
    'Add a verified capstone or internship to reach Advanced standing.';

  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 text-left animate-in fade-in duration-300">
      
      {/* ================================================================ */}
      {/* ROW 1: BENTO HERO & 3 STAT CARDS */}
      {/* ================================================================ */}
      <section className="space-y-3">
        <div className="text-xs font-mono-data uppercase tracking-wider text-[#8F99B8]">
          Performance & Standing
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Main Hero Card (Col 7 on lg) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-[24px] bg-[#222A52] card-glass-glow bg-mesh relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span className="text-xs font-mono-data text-[#FFC773] font-semibold">
                  Stanford University · {currentUser.batch || 'Class of 2026'}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FF] tracking-tight">
                Welcome back, {currentUser.name.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-[#BAC2DC] max-w-lg leading-relaxed">
                Your credentials and activity are backed by institutional faculty signatures.
              </p>
            </div>

            {/* Proof Strength Display */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-2">
              <div className="space-y-1">
                <div className="text-xs font-mono-data text-[#8F99B8] uppercase">Proof Strength</div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl sm:text-6xl font-bold font-mono-data bg-gradient-to-r from-[#FFC773] via-[#F472B6] to-[#8B7CFF] bg-clip-text text-transparent">
                    {proofStrength.score}
                  </span>
                  <span className="text-sm font-mono-data text-[#8F99B8]">/ 100</span>
                </div>
                <div className="text-[11px] font-mono-data text-[#4ADE80] flex items-center gap-1.5 pt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{proofStrength.diversityBonus} category diversity bonus</span>
                </div>
              </div>

              {/* Sparkline & Score Ring */}
              <div className="flex items-center gap-4 bg-[#1A2040]/70 p-3.5 rounded-[16px] border border-[rgba(255,255,255,0.08)]">
                <div className="text-right">
                  <div className="text-[10px] font-mono-data text-[#8F99B8] uppercase">6-Mo Growth</div>
                  <TrendSparkline data={[42, 54, 61, 72, 79, proofStrength.score]} />
                </div>
                <ScoreRing score={proofStrength.score} size={58} strokeWidth={5} color="#8B7CFF" />
              </div>
            </div>

            {/* Next Best Action Banner & Action */}
            <div className="p-4 rounded-[16px] bg-[#1A2040]/80 border border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono-data uppercase text-[#FFC773] font-semibold">Recommended Action</div>
                <p className="text-xs text-[#BAC2DC] truncate max-w-md">{nextActionText}</p>
              </div>
              <button
                onClick={onOpenAddActivity}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white text-xs font-semibold shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Proof</span>
              </button>
            </div>
          </div>

          {/* 3 Small Stat Cards (Col 5 on lg) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            
            {/* Stat 1: Profile Completeness */}
            <div className="p-5 rounded-[20px] bg-[#222A52] card-glass flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono-data text-[#8F99B8] uppercase">Completeness</div>
                <div className="font-display text-2xl font-bold font-mono-data text-[#F4F6FF]">
                  {completenessPercentage}%
                </div>
                <div className="text-[11px] text-[#BAC2DC]">
                  {completenessItems.filter(Boolean).length} of 5 milestones met
                </div>
              </div>
              <ScoreRing score={completenessPercentage} size={52} strokeWidth={5} color="#4ADE80" />
            </div>

            {/* Stat 2: Verified Skills */}
            <div className="p-5 rounded-[20px] bg-[#222A52] card-glass flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono-data text-[#8F99B8] uppercase">Verified Skills</div>
                <div className="font-display text-2xl font-bold font-mono-data text-[#8B7CFF]">
                  {verifiedSkillsCount}
                </div>
                <div className="text-[11px] text-[#BAC2DC]">
                  Across {studentSkills.length} total mapped competencies
                </div>
              </div>
              <LevelMeter level="Advanced" />
            </div>

            {/* Stat 3: Top Match % */}
            <div className="p-5 rounded-[20px] bg-[#222A52] card-glass flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono-data text-[#8F99B8] uppercase">Top Match Fit</div>
                <div className="font-display text-2xl font-bold font-mono-data text-[#38BDF8]">
                  {topMatch?.match.score || 94}%
                </div>
                <div className="text-[11px] text-[#BAC2DC] truncate max-w-[170px]">
                  {topMatch?.opp.company || 'Campus Partners'} · {topMatch?.opp.type || 'Internship'}
                </div>
              </div>
              <ScoreRing score={topMatch?.match.score || 94} size={52} strokeWidth={5} color="#38BDF8" />
            </div>

          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* ROW 2: TOP MATCHED OPPORTUNITIES & SKILL SNAPSHOT (MINI RADAR) */}
      {/* ================================================================ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-mono-data uppercase tracking-wider text-[#8F99B8]">
            Opportunity Fit & Competency Distribution
          </div>
          <button
            onClick={() => setActiveTab('opportunities')}
            className="text-xs font-mono-data text-[#8B7CFF] hover:underline flex items-center gap-1"
          >
            <span>Explore all ({opportunities.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          
          {/* Top Matched Opportunities (Col 8 on lg, 4 rows) */}
          <div className="lg:col-span-8 p-6 rounded-[22px] bg-[#222A52] card-glass space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.08)] mb-3">
                <h2 className="font-display text-base font-bold text-[#F4F6FF]">
                  Top Matched Opportunities
                </h2>
                <span className="text-xs font-mono-data text-[#8F99B8]">4 highest algorithmic alignments</span>
              </div>

              <div className="space-y-3">
                {top4Opportunities.map(({ opp, match }) => {
                  const youHaveList = match.youHave || [];
                  const youNeedList = match.youNeed || [];

                  return (
                    <div
                      key={opp.id}
                      onClick={() => setActiveTab('opportunities')}
                      className="p-3.5 rounded-[16px] bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] hover:border-[#8B7CFF]/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <CompanyAvatar name={opp.company} size={42} />
                        <div className="space-y-0.5">
                          <div className="font-semibold text-sm text-[#F4F6FF] group-hover:text-[#8B7CFF] transition-colors">
                            {opp.title}
                          </div>
                          <div className="text-xs font-mono-data text-[#8F99B8]">
                            {opp.company} · {opp.type} · {opp.location}
                          </div>
                          
                          {/* Skill Chips (Green check for have, coral dashed for gap) */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {youHaveList.slice(0, 2).map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#4ADE80]/15 text-[#4ADE80] text-[10px] font-mono-data border border-[#4ADE80]/30">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                <span>{s.skillName}</span>
                              </span>
                            ))}
                            {youNeedList.slice(0, 1).map((s, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FB7185]/10 text-[#FB7185] text-[10px] font-mono-data border border-dashed border-[#FB7185]/40">
                                <span>+{s.skillName}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                        <ScoreRing score={match.score} size={44} strokeWidth={4} color="#FFC773" />
                        <ArrowRight className="w-4 h-4 text-[#8F99B8] group-hover:text-[#F4F6FF] group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 text-xs font-mono-data text-[#8F99B8] flex items-center justify-between">
              <span>Deterministic semantic & evidence ranking</span>
              <span className="text-[#38BDF8]">Match Score Legend: 85%+ High Fit</span>
            </div>
          </div>

          {/* Skill Snapshot (Mini Radar, Col 4 on lg) */}
          <div className="lg:col-span-4 p-6 rounded-[22px] bg-[#222A52] card-glass space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-[#F4F6FF]">Skill Snapshot</h3>
                <span className="text-xs font-mono-data text-[#8B7CFF]">Radar</span>
              </div>
              <p className="text-xs text-[#BAC2DC]">Multi-axis certified confidence mapping.</p>
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
                      stroke="rgba(255, 255, 255, 0.10)"
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
                        fill="rgba(139, 124, 255, 0.25)"
                        stroke="#2DD4BF"
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
                            className="fill-[#BAC2DC] text-[9px] font-mono-data font-semibold"
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
              className="w-full py-2 rounded-[10px] bg-[#1A2040] hover:bg-[#2B3563] text-xs font-mono-data text-[#BAC2DC] hover:text-[#F4F6FF] transition-colors text-center"
            >
              Open Full Skills Explorer →
            </button>
          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* ROW 3: RECENT VERIFICATIONS, DEADLINES & EVIDENCE MIX DONUT */}
      {/* ================================================================ */}
      <section className="space-y-3">
        <div className="text-xs font-mono-data uppercase tracking-wider text-[#8F99B8]">
          Activity, Deadlines & Evidence Diversity
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          
          {/* Card 1: Recent Verifications */}
          <div className="p-6 rounded-[22px] bg-[#222A52] card-glass space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
                <h3 className="font-display text-base font-bold text-[#F4F6FF]">Recent Verifications</h3>
                <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              </div>

              <div className="space-y-2.5">
                {recentVerifications.map((ev) => {
                  const style = getTypeStyle(ev.type);
                  const Icon = style.icon;

                  return (
                    <div key={ev.id} className="p-3 rounded-[14px] bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#F4F6FF] truncate max-w-[170px]">
                          {ev.title}
                        </span>
                        <span className="text-[10px] font-mono-data" style={{ color: style.color }}>
                          {ev.type}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono-data text-[#8F99B8]">
                        <span>Verified by {ev.verifiedBy?.split(' ')[1] || 'Faculty'}</span>
                        <span>{ev.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('profile')}
              className="text-xs font-mono-data text-[#8B7CFF] hover:underline text-left pt-2"
            >
              View full audit history →
            </button>
          </div>

          {/* Card 2: Upcoming Deadlines with Countdown Chips */}
          <div className="p-6 rounded-[22px] bg-[#222A52] card-glass space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
                <h3 className="font-display text-base font-bold text-[#F4F6FF]">Upcoming Deadlines</h3>
                <Calendar className="w-4 h-4 text-[#FFC773]" />
              </div>

              <div className="space-y-2.5">
                {upcomingDeadlines.map((opp) => (
                  <div key={opp.id} className="p-3 rounded-[14px] bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#F4F6FF] truncate max-w-[170px]">
                        {opp.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#FFC773]/15 text-[#FFC773] text-[10px] font-mono-data font-semibold">
                        {opp.deadline}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8F99B8] truncate">
                      {opp.company} · {opp.type}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setActiveTab('opportunities')}
              className="text-xs font-mono-data text-[#8B7CFF] hover:underline text-left pt-2"
            >
              View all deadlines in Opportunities →
            </button>
          </div>

          {/* Card 3: Evidence Mix by Type */}
          <div className="p-6 rounded-[22px] bg-[#222A52] card-glass space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
                <h3 className="font-display text-base font-bold text-[#F4F6FF]">Evidence Mix</h3>
                <span className="text-xs font-mono-data text-[#2DD4BF] font-semibold">{studentEvidences.length} proofs</span>
              </div>

              {/* Stacked Diversity Bar */}
              <div className="space-y-1.5">
                <div className="w-full h-3 rounded-full bg-[#1A2040] overflow-hidden flex">
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
                <div className="text-[10px] font-mono-data text-[#8F99B8] flex justify-between">
                  <span>Category Diversity: High</span>
                  <span>{proofStrength.distinctTypesCount} Types</span>
                </div>
              </div>

              {/* Legend with counts */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-data pt-2">
                {Object.entries(EVIDENCE_TYPE_STYLES).map(([type, style]) => {
                  const count = evidenceTypeCounts[type] || 0;
                  const Icon = style.icon;
                  return (
                    <div key={type} className="p-2 rounded-[10px] bg-[#1A2040]/60 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <span style={{ color: style.color }} className="shrink-0">
                          <Icon className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-[#BAC2DC] truncate">{type}</span>
                      </span>
                      <span className="font-bold text-[#F4F6FF] pl-1">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] font-mono-data text-[#4ADE80] pt-1">
              ✓ Multi-type verified evidence chain verified
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
