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
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedSkill, studentEvidences]);

  // Exact mathematical breakdown
  const breakdown = useMemo(() => {
    if (!selectedSkill) return { items: [], confidence: 0, level: 'Beginner', totalRawPoints: 0 };
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
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left animate-in fade-in duration-200 bg-slate-50 min-h-screen">
      
      {/* Header & Main Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Skills & Evidence Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Every confidence score (0-100) is deterministically verified from underlying engineering artifacts.
          </p>
        </div>

        {/* 3 Main View Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-200/80 border border-slate-300/70 self-start sm:self-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'explorer', label: 'Evidence Explorer' },
            { id: 'compare', label: 'Compare Matrix' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveViewTab(t.id as any)}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                activeViewTab === t.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* VIEW 1: OVERVIEW */}
      {/* ================================================================ */}
      {activeViewTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Grid of Skill Cards (Col 8 on lg) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-slate-500 font-semibold">
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
                      className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all shadow-xs space-y-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold">{skill.category}</div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {skill.canonicalName}
                          </h3>
                        </div>
                        <ScoreRing score={skill.confidence} size={46} strokeWidth={4} color="#4F46E5" />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <LevelMeter level={skill.level} />
                        <span className="text-xs font-mono text-slate-500">{proofs.length} proofs</span>
                      </div>

                      {/* Evidence Type Colored Dots + Status */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
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
            <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5 sticky top-24">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Skills Radar</h3>
                  <span className="text-xs font-mono text-indigo-600 font-semibold">Audited</span>
                </div>
                <p className="text-xs text-slate-500">Multi-axis certified confidence mapping.</p>
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
                        stroke="#E2E8F0"
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
                        stroke="#E2E8F0"
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
                          fill="rgba(79, 70, 229, 0.12)"
                          stroke="#4F46E5"
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
                              className="fill-slate-600 text-[10px] font-mono font-medium"
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

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-500 text-center">
                Radar nodes match certified 0-100 scores.
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* VIEW 2: EVIDENCE EXPLORER */}
      {/* ================================================================ */}
      {activeViewTab === 'explorer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-200">
          
          {/* Left Panel: Skill List */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
            
            {/* Search and Category filter */}
            <div className="space-y-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter skills..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900'
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
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left space-y-2 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-400 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-slate-900">{s.canonicalName}</span>
                        <LevelMeter level={s.level} />
                      </div>
                      <StatusIndicator status={isVerified ? 'verified' : 'pending'} />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">{proofs.length} proofs</span>
                      <span className="font-bold text-indigo-600">{s.confidence}/100</span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Right Sticky Detail Panel */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6 sticky top-24">
            {selectedSkill && (
              <>
                {/* Header with Ring & Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedSkill.canonicalName}
                      </h2>
                      <LevelMeter level={selectedSkill.level} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Backed by {selectedSkillEvidences.length} proofs across diverse evidence categories.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <ScoreRing score={selectedSkill.confidence} size={58} strokeWidth={5} color="#4F46E5" />
                  </div>
                </div>

                {/* Evidence Chain */}
                <div className="space-y-3">
                  <div className="text-xs font-mono uppercase text-slate-500 font-semibold">
                    Evidence Chain (Date Order)
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedSkillEvidences.map(ev => {
                      const style = getTypeStyle(ev.type);
                      const Icon = style.icon;

                      return (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-left"
                        >
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="flex items-center gap-1.5 font-semibold" style={{ color: style.color }}>
                              <Icon className="w-3.5 h-3.5" />
                              <span>{ev.type}</span>
                            </span>
                            <span className="text-[10px] text-slate-400">{ev.date}</span>
                          </div>

                          <div className="font-semibold text-xs text-slate-900 line-clamp-1">{ev.title}</div>
                          {ev.metrics && <div className="text-[11px] text-emerald-700 font-mono truncate">{ev.metrics}</div>}

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-mono">
                            <span className="text-slate-500 truncate max-w-[140px]">{ev.verifiedBy || 'Pending'}</span>
                            {ev.url && (
                              <a href={ev.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
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
                    <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Mathematical Score Breakdown</span>
                    <span className="text-xs font-mono text-emerald-600 font-bold">Σ Net = {selectedSkill.confidence} pts</span>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50 font-semibold">
                          <th className="py-2.5 px-3">Evidence Item</th>
                          <th className="py-2.5 px-2">Type</th>
                          <th className="py-2.5 px-2 text-right">Weight</th>
                          <th className="py-2.5 px-2 text-right">Verif.</th>
                          <th className="py-2.5 px-2 text-right">Recency</th>
                          <th className="py-2.5 px-3 text-right text-indigo-600 font-bold">Points</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-600">
                        {breakdown.items.map((item, idx) => {
                          const ev = studentEvidences.find(e => e.id === item.evidenceId);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/60">
                              <td className="py-2 px-3 text-slate-900 font-medium truncate max-w-[170px]">
                                {ev?.title || 'Evidence Artifact'}
                              </td>
                              <td className="py-2 px-2 text-slate-500">{item.type}</td>
                              <td className="py-2 px-2 text-right">{item.typeWeight}</td>
                              <td className="py-2 px-2 text-right">{item.verificationFactor}x</td>
                              <td className="py-2 px-2 text-right">{item.recencyFactor}x</td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-600">+{item.netScore}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* How to Strengthen */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-amber-800 font-bold">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>How to Strengthen This Skill</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
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
      {/* VIEW 3: COMPARE MATRIX */}
      {/* ================================================================ */}
      {activeViewTab === 'compare' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Evidence Matrix</h2>
              <p className="text-xs text-slate-500">
                Cross-tabulation of student skills against validated proof categories. Click any cell to inspect in Evidence Explorer.
              </p>
            </div>
            <EvidenceLegend />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px] bg-slate-50 font-semibold">
                  <th className="py-3 px-4">Skill</th>
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
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentSkills.map(s => {
                  const proofsForSkill = studentEvidences.filter(e =>
                    e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === s.canonicalName.toLowerCase())
                  );

                  return (
                    <tr
                      key={s.id}
                      onClick={() => handleSelectFromMatrix(s.id)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900">{s.canonicalName}</td>
                      <td className="py-3 px-3 text-right font-bold text-indigo-600">{s.confidence}</td>
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
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}

                {/* Column Totals Row */}
                <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                  <td className="py-3.5 px-4 text-slate-500 uppercase text-[11px]">Category Totals</td>
                  <td className="py-3.5 px-3 text-right text-indigo-600">{studentSkills.length} skills</td>
                  {matrixColumns.map(col => (
                    <td key={col} className="py-3.5 px-3 text-center text-emerald-600">
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
