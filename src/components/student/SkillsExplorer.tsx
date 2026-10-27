import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  ChevronRight, 
  ExternalLink, 
  TrendingUp, 
  Check, 
  Clock, 
  Table as TableIcon,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Skill, Evidence, EvidenceType } from '../../types';
import { calculateSkillConfidence, normalizeSkillName } from '../../lib/logic';
import { 
  ScoreRing, 
  LevelMeter, 
  StatusIndicator, 
  EVIDENCE_TYPE_STYLES, 
  getTypeStyle,
  EvidenceLegend
} from '../common/EvidenceEncoding';

export const SkillsExplorer: React.FC = () => {
  const { studentSkills, studentEvidences, proofStrength } = useApp();

  // Top level tabs: Overview | Evidence Explorer | Compare
  const [activeViewTab, setActiveViewTab] = useState<'overview' | 'explorer' | 'compare'>('overview');

  // Explorer state
  const [selectedSkillId, setSelectedSkillId] = useState<string>(studentSkills[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const selectedSkill = studentSkills.find(s => s.id === selectedSkillId) || studentSkills[0];

  const categories = ['all', 'Programming', 'ML/AI', 'Data', 'Cloud', 'Design'];

  // Filter skills
  const filteredSkills = useMemo(() => {
    return studentSkills.filter(s => {
      const matchSearch = s.canonicalName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'all' || s.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [studentSkills, searchQuery, selectedCategory]);

  // Evidence list for selected skill
  const selectedSkillEvidences = useMemo(() => {
    if (!selectedSkill) return [];
    return studentEvidences
      .filter(e => e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === selectedSkill.canonicalName.toLowerCase()))
      .sort((a, b) => a.date.localeCompare(b.date)); // Date order
  }, [selectedSkill, studentEvidences]);

  // Exact mathematical breakdown
  const breakdown = useMemo(() => {
    if (!selectedSkill) return { items: [], confidence: 0, level: 'Beginner' };
    return calculateSkillConfidence(selectedSkill.canonicalName, studentEvidences);
  }, [selectedSkill, studentEvidences]);

  // Matrix columns
  const matrixColumns: EvidenceType[] = ['Project', 'Hackathon', 'Internship', 'Certificate', 'Competition', 'Achievement'];

  // Matrix column totals
  const matrixColumnTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    matrixColumns.forEach(c => (totals[c] = 0));

    studentSkills.forEach(skill => {
      const proofsForSkill = studentEvidences.filter(e =>
        e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === skill.canonicalName.toLowerCase())
      );
      matrixColumns.forEach(col => {
        const count = proofsForSkill.filter(e => e.type === col).length;
        totals[col] += count;
      });
    });
    return totals;
  }, [studentSkills, studentEvidences]);

  const handleSelectFromMatrix = (skillId: string) => {
    setSelectedSkillId(skillId);
    setActiveViewTab('explorer');
  };

  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left animate-in fade-in duration-200">
      
      {/* Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FF] tracking-tight">
            Skills & Evidence Architecture
          </h1>
          <p className="text-xs sm:text-sm text-[#BAC2DC] mt-0.5">
            Every confidence score (0-100) is deterministically verified from underlying engineering artifacts.
          </p>
        </div>

        {/* 3 Main View Tabs: Overview | Evidence Explorer | Compare */}
        <div className="flex p-1 rounded-full bg-[#1A2040] border border-[rgba(255,255,255,0.08)] self-start sm:self-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'explorer', label: 'Evidence Explorer' },
            { id: 'compare', label: 'Compare Matrix' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveViewTab(t.id as any)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono-data transition-all ${
                activeViewTab === t.id
                  ? 'bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white font-semibold shadow-sm'
                  : 'text-[#BAC2DC] hover:text-[#F4F6FF]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: OVERVIEW (Skill Cards Grid + Labeled Radar) */}
      {/* ================================================================ */}
      {activeViewTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Grid of Skill Cards (Col 8 on lg) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-data uppercase text-[#8F99B8]">
                  Mapped Skills ({studentSkills.length})
                </span>
                <EvidenceLegend />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studentSkills.map(skill => {
                  const proofs = studentEvidences.filter(e =>
                    e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === skill.canonicalName.toLowerCase())
                  );
                  const isVerified = proofs.some(p => p.verificationStatus === 'verified');
                  const distinctTypes = Array.from(new Set(proofs.map(p => p.type)));

                  return (
                    <div
                      key={skill.id}
                      onClick={() => {
                        setSelectedSkillId(skill.id);
                        setActiveViewTab('explorer');
                      }}
                      className="p-5 rounded-[20px] bg-[#222A52] card-glass hover:border-[#8B7CFF]/50 cursor-pointer transition-all shadow-sm space-y-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono-data text-[#8F99B8] uppercase">{skill.category}</div>
                          <h3 className="font-display text-base font-bold text-[#F4F6FF] group-hover:text-[#8B7CFF] transition-colors">
                            {skill.canonicalName}
                          </h3>
                        </div>
                        <ScoreRing score={skill.confidence} size={46} strokeWidth={4} color="#8B7CFF" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <LevelMeter level={skill.level} />
                        <span className="text-xs font-mono-data text-[#8F99B8]">{proofs.length} proofs</span>
                      </div>

                      {/* Evidence Type Colored Dots + Status */}
                      <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-mono-data">
                        <div className="flex items-center gap-1.5">
                          {distinctTypes.map(t => {
                            const style = getTypeStyle(t);
                            return (
                              <span
                                key={t}
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: style.color }}
                                title={`${t} proof attached`}
                              />
                            );
                          })}
                        </div>

                        <StatusIndicator status={isVerified ? 'verified' : 'pending'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Radar Card with Labeled Axes (Col 4 on lg) */}
            <div className="lg:col-span-4 p-6 rounded-[22px] bg-[#222A52] card-glass space-y-5 sticky top-24">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-[#F4F6FF]">Skills Radar</h3>
                  <span className="text-xs font-mono-data text-[#2DD4BF]">Audited</span>
                </div>
                <p className="text-xs text-[#BAC2DC]">Multi-axis certified confidence mapping.</p>
              </div>

              {/* Responsive SVG Radar */}
              <div className="w-full flex items-center justify-center py-2">
                <svg className="w-[230px] h-[220px] overflow-visible" viewBox="0 0 260 260">
                  {[0.33, 0.66, 1.0].map((level, i) => {
                    const radius = 80 * level;
                    const points = [0, 1, 2, 3, 4, 5].map(step => {
                      const angle = (Math.PI * 2 / 6) * step - Math.PI / 2;
                      return `${130 + radius * Math.cos(angle)},${130 + radius * Math.sin(angle)}`;
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

                  {/* Axis lines */}
                  {[0, 1, 2, 3, 4, 5].map(step => {
                    const angle = (Math.PI * 2 / 6) * step - Math.PI / 2;
                    return (
                      <line
                        key={step}
                        x1="130"
                        y1="130"
                        x2={130 + 80 * Math.cos(angle)}
                        y2={130 + 80 * Math.sin(angle)}
                        stroke="rgba(255, 255, 255, 0.10)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Polygon */}
                  {(() => {
                    const top6 = studentSkills.slice(0, 6);
                    const points = top6.map((s, idx) => {
                      const r = (s.confidence / 100) * 80;
                      const angle = (Math.PI * 2 / 6) * idx - Math.PI / 2;
                      return `${130 + r * Math.cos(angle)},${130 + r * Math.sin(angle)}`;
                    }).join(' ');

                    return (
                      <>
                        <polygon
                          points={points}
                          fill="rgba(139, 124, 255, 0.28)"
                          stroke="#2DD4BF"
                          strokeWidth="2"
                        />
                        {top6.map((s, idx) => {
                          const angle = (Math.PI * 2 / 6) * idx - Math.PI / 2;
                          const lx = 130 + 104 * Math.cos(angle);
                          const ly = 130 + 104 * Math.sin(angle);

                          return (
                            <text
                              key={idx}
                              x={lx}
                              y={ly + 4}
                              textAnchor="middle"
                              className="fill-[#BAC2DC] text-[10px] font-mono-data font-semibold"
                            >
                              {s.canonicalName.slice(0, 8)}
                            </text>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="p-3 rounded-[12px] bg-[#1A2040]/70 text-[11px] font-mono-data text-[#8F99B8] text-center">
                Radar nodes match certified 0-100 scores.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: EVIDENCE EXPLORER (Left List + Right Sticky Detail Panel) */}
      {/* ================================================================ */}
      {activeViewTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          
          {/* Left Panel: Skill List (Col 5 on lg) */}
          <div className="lg:col-span-5 p-5 rounded-[22px] bg-[#222A52] card-glass space-y-4">
            
            {/* Search and Category filter */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#8F99B8] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter skills..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#1A2040] border border-[rgba(255,255,255,0.10)] text-xs text-[#F4F6FF] focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono-data transition-colors ${
                      selectedCategory === cat
                        ? 'bg-[#8B7CFF] text-white font-semibold'
                        : 'bg-[#1A2040] text-[#8F99B8] hover:text-[#F4F6FF]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill rows list */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredSkills.map(s => {
                const isSelected = selectedSkill?.id === s.id;
                const proofs = studentEvidences.filter(e =>
                  e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === s.canonicalName.toLowerCase())
                );
                const isVerified = proofs.some(p => p.verificationStatus === 'verified');

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSkillId(s.id)}
                    className={`p-3.5 rounded-[16px] border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'bg-[#2B3563] border-[#8B7CFF] shadow-md'
                        : 'bg-[#1A2040]/70 border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#F4F6FF]">{s.canonicalName}</span>
                        <LevelMeter level={s.level} />
                      </div>
                      <StatusIndicator status={isVerified ? 'verified' : 'pending'} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono-data">
                      <span className="text-[#8F99B8]">{proofs.length} proofs</span>
                      <span className="font-bold text-[#FFC773]">{s.confidence}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Sticky Detail Panel (Col 7 on lg) */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-[22px] bg-[#222A52] card-glass space-y-6 sticky top-24">
            {selectedSkill && (
              <>
                {/* Header with Ring & Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[rgba(255,255,255,0.10)]">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display text-2xl font-bold text-[#F4F6FF]">
                        {selectedSkill.canonicalName}
                      </h2>
                      <LevelMeter level={selectedSkill.level} />
                    </div>
                    <p className="text-xs text-[#BAC2DC]">
                      Backed by {selectedSkillEvidences.length} proofs across diverse evidence categories.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ScoreRing score={selectedSkill.confidence} size={58} strokeWidth={5} color="#FFC773" />
                  </div>
                </div>

                {/* Evidence Chain: Horizontal stepper in date order */}
                <div className="space-y-3">
                  <div className="text-xs font-mono-data uppercase text-[#8F99B8]">
                    Evidence Chain (Date Order)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSkillEvidences.map(ev => {
                      const style = getTypeStyle(ev.type);
                      const Icon = style.icon;

                      return (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-[14px] bg-[#1A2040] border border-[rgba(255,255,255,0.06)] space-y-2 text-left"
                        >
                          <div className="flex items-center justify-between text-xs font-mono-data">
                            <span className="flex items-center gap-1.5 font-semibold" style={{ color: style.color }}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{ev.type}</span>
                            </span>
                            <span className="text-[10px] text-[#8F99B8]">{ev.date}</span>
                          </div>

                          <div className="font-semibold text-xs text-[#F4F6FF] line-clamp-1">{ev.title}</div>
                          {ev.metrics && <div className="text-[11px] text-[#4ADE80] font-mono-data truncate">{ev.metrics}</div>}

                          <div className="pt-2 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-[11px] font-mono-data">
                            <span className="text-[#8F99B8] truncate max-w-[140px]">{ev.verifiedBy || 'Pending'}</span>
                            {ev.url && (
                              <a href={ev.url} target="_blank" rel="noreferrer" className="text-[#38BDF8] hover:underline flex items-center gap-1">
                                <span>Proof</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-data uppercase text-[#8F99B8]">Mathematical Score Breakdown</span>
                    <span className="text-xs font-mono-data text-[#4ADE80]">Σ Net = {selectedSkill.confidence} pts</span>
                  </div>

                  <div className="overflow-x-auto rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[#1A2040]">
                    <table className="w-full text-left text-xs font-mono-data">
                      <thead>
                        <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8F99B8] text-[11px] bg-[#222A52]">
                          <th className="py-2.5 px-3">Evidence Item</th>
                          <th className="py-2.5 px-2">Type</th>
                          <th className="py-2.5 px-2 text-right">Weight</th>
                          <th className="py-2.5 px-2 text-right">Verif.</th>
                          <th className="py-2.5 px-2 text-right">Recency</th>
                          <th className="py-2.5 px-3 text-right text-[#FFC773]">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-[#BAC2DC]">
                        {breakdown.items.map((item, idx) => {
                          const ev = studentEvidences.find(e => e.id === item.evidenceId);
                          return (
                            <tr key={idx} className="hover:bg-[#222A52]/30">
                              <td className="py-2 px-3 text-[#F4F6FF] font-medium truncate max-w-[170px]">
                                {ev?.title || 'Evidence Artifact'}
                              </td>
                              <td className="py-2 px-2 text-[#8F99B8]">{item.type}</td>
                              <td className="py-2 px-2 text-right">{item.typeWeight}</td>
                              <td className="py-2 px-2 text-right">{item.verificationFactor}x</td>
                              <td className="py-2 px-2 text-right">{item.recencyFactor}x</td>
                              <td className="py-2 px-3 text-right font-bold text-[#4ADE80]">+{item.netScore}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* How to Strengthen */}
                <div className="p-4 rounded-[16px] bg-[#1A2040] border border-[rgba(255,255,255,0.08)] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono-data text-[#FFC773] font-semibold">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>How to Strengthen This Skill</span>
                  </div>
                  <p className="text-xs text-[#BAC2DC] leading-relaxed">
                    {selectedSkill.confidence < 70
                      ? `Complete and link a faculty-verified internship or research capstone demonstrating ${selectedSkill.canonicalName} to attain Advanced standing (70+).`
                      : `Maintain currency by attaching newly deployed benchmarks or renewing credential validation within 12 months.`}
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 3: COMPARE MATRIX (Full Evidence Matrix) */}
      {/* ================================================================ */}
      {activeViewTab === 'compare' && (
        <div className="p-6 sm:p-8 rounded-[22px] bg-[#222A52] card-glass space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-[#F4F6FF]">Evidence Matrix</h2>
              <p className="text-xs text-[#BAC2DC]">
                Cross-tabulation of student skills against validated proof categories. Click any cell to inspect in Evidence Explorer.
              </p>
            </div>
            <EvidenceLegend />
          </div>

          <div className="overflow-x-auto rounded-[14px] border border-[rgba(255,255,255,0.08)] bg-[#1A2040]">
            <table className="w-full text-left text-xs font-mono-data">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8F99B8] text-[11px] bg-[#222A52]">
                  <th className="py-3 px-4 font-semibold">Skill</th>
                  <th className="py-3 px-3 text-right">Confidence</th>
                  {matrixColumns.map(col => {
                    const style = getTypeStyle(col);
                    return (
                      <th key={col} className="py-3 px-3 text-center font-medium" style={{ color: style.color }}>
                        {col}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)] text-[#BAC2DC]">
                {studentSkills.map(s => {
                  const proofsForSkill = studentEvidences.filter(e =>
                    e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === s.canonicalName.toLowerCase())
                  );

                  return (
                    <tr
                      key={s.id}
                      onClick={() => handleSelectFromMatrix(s.id)}
                      className="cursor-pointer hover:bg-[#222A52]/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-[#F4F6FF]">{s.canonicalName}</td>
                      <td className="py-3 px-3 text-right font-bold text-[#FFC773]">{s.confidence}</td>
                      {matrixColumns.map(col => {
                        const count = proofsForSkill.filter(e => e.type === col).length;
                        const style = getTypeStyle(col);

                        return (
                          <td key={col} className="py-3 px-3 text-center">
                            {count > 0 ? (
                              <span
                                className="inline-flex items-center justify-center px-2 py-0.5 rounded-full font-bold text-[11px]"
                                style={{ backgroundColor: style.bgColor, color: style.color }}
                              >
                                ● {count}
                              </span>
                            ) : (
                              <span className="text-[#8F99B8]/30">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Column Totals Row */}
                <tr className="bg-[#222A52]/90 border-t border-[rgba(255,255,255,0.12)] font-bold text-[#F4F6FF]">
                  <td className="py-3.5 px-4 text-[#8F99B8] uppercase text-[11px]">Category Totals</td>
                  <td className="py-3.5 px-3 text-right text-[#FFC773]">{studentSkills.length} skills</td>
                  {matrixColumns.map(col => (
                    <td key={col} className="py-3.5 px-3 text-center text-[#4ADE80]">
                      {matrixColumnTotals[col]} proofs
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
