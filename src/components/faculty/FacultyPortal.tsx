import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Check, 
  X, 
  ExternalLink, 
  Filter,
  FileCode2,
  Clock,
  Sparkles,
  Award,
  AlertTriangle,
  History,
  CheckCircle2,
  HelpCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { Evidence, ProjectProposal } from '../../types';
import { getTypeStyle } from '../common/EvidenceEncoding';

export const FacultyPortal: React.FC = () => {
  const { 
    currentUser, 
    evidences, 
    verifyEvidence, 
    rejectEvidence, 
    proposals, 
    reviewProposal, 
    allUsers 
  } = useApp();

  const [activeQueue, setActiveQueue] = useState<'evidences' | 'proposals'>('evidences');
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(null);
  const [selectedProposal, setSelectedProposal] = useState<ProjectProposal | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [feedbackNote, setFeedbackNote] = useState('');

  // Faculty Rubric State (1 to 4 scale)
  const [rubricConcept, setRubricConcept] = useState<number>(3);
  const [rubricCode, setRubricCode] = useState<number>(3);
  const [rubricRigor, setRubricRigor] = useState<number>(3);

  // Active drawer tab: 'transcript' | 'provenance' | 'rubric'
  const [drawerTab, setDrawerTab] = useState<'transcript' | 'provenance' | 'rubric'>('transcript');

  const pendingEvidences = evidences
    .filter(e => e.verificationStatus === 'pending')
    .filter(e => filterType === 'all' || e.type.toLowerCase() === filterType.toLowerCase());

  const pendingProposals = proposals
    .filter(p => p.status === 'pending');

  const getAuthor = (studentId: string) => {
    return allUsers.find(u => u.id === studentId)?.name || 'Student Candidate';
  };

  const handleVerifyEvidence = (ev: Evidence) => {
    verifyEvidence(ev.id, currentUser.name);
    setSelectedEvidence(null);
    setFeedbackNote('');
  };

  const handleRejectEvidence = (ev: Evidence) => {
    rejectEvidence(ev.id, feedbackNote || 'Revisions requested by faculty committee.');
    setSelectedEvidence(null);
    setFeedbackNote('');
  };

  const handleReviewProposal = (prop: ProjectProposal, status: 'approved' | 'changes_requested' | 'flagged') => {
    reviewProposal(prop.id, status, feedbackNote || `Marked ${status} by ${currentUser.name}`);
    setSelectedProposal(null);
    setFeedbackNote('');
  };

  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 text-left text-slate-900">
      
      {/* ─── LEVEL 1: TITLE & QUEUE SWITCHER ────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Faculty Evaluation Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Institutional verification queue, Socratic defense audits, and sovereign faculty attestation.
          </p>
        </div>

        {/* Switcher & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
            <button
              onClick={() => setActiveQueue('evidences')}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-md transition-all font-medium ${
                activeQueue === 'evidences' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Proofs ({pendingEvidences.length})
            </button>
            <button
              onClick={() => setActiveQueue('proposals')}
              className={`px-3 py-1.5 text-xs font-mono-data rounded-md transition-all font-medium ${
                activeQueue === 'proposals' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Proposals ({pendingProposals.length})
            </button>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-xs transition-colors"
            title="Filter Queue"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {isFilterOpen && (
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center gap-3 text-xs font-mono-data shadow-xs">
          <span className="text-slate-500">Filter by category:</span>
          {['all', 'project', 'internship', 'hackathon'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                filterType === t ? 'bg-slate-900 text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ─── LEVEL 2: EVIDENCE TABLE ────────────────── */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        {activeQueue === 'evidences' ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono-data text-[11px] bg-slate-50/75">
                <th className="py-3 px-6 font-medium">Student Candidate & Deliverable</th>
                <th className="py-3 px-4 font-medium hidden sm:table-cell">Type</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">Defense Status</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">Submitted</th>
                <th className="py-3 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingEvidences.length > 0 ? (
                pendingEvidences.map(ev => {
                  const style = getTypeStyle(ev.type);
                  return (
                    <tr key={ev.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-sm text-slate-900">{ev.title}</div>
                        <div className="text-xs text-slate-500 font-mono-data">{getAuthor(ev.studentId)}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono-data hidden sm:table-cell">
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ backgroundColor: style.bgColor, color: style.color, border: `1px solid ${style.borderColor}` }}
                        >
                          {ev.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono-data hidden md:table-cell">
                        {ev.defenseScore ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Defended ({Math.round(ev.defenseScore)}%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span>Defense Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-mono-data text-slate-500 hidden md:table-cell">
                        {ev.date}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => setSelectedEvidence(ev)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                        >
                          Audit & Verify
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs font-mono-data text-slate-400">
                    All student deliverables in this cohort have been reviewed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-mono-data text-[11px] bg-slate-50/75">
                <th className="py-3 px-6 font-medium">Proposal & Student</th>
                <th className="py-3 px-4 font-medium hidden sm:table-cell">Domain</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">Archive Overlap</th>
                <th className="py-3 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pendingProposals.length > 0 ? (
                pendingProposals.map(prop => (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-sm text-slate-900">{prop.title}</div>
                      <div className="text-xs text-slate-500 font-mono-data">{prop.studentName}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-slate-600 hidden sm:table-cell">
                      {prop.domain}
                    </td>
                    <td className="py-3.5 px-4 font-mono-data text-amber-700 font-semibold hidden md:table-cell">
                      {prop.similarityMatches?.[0]?.overallSimilarity || 24}% Overlap
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        Inspect Proposal
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs font-mono-data text-slate-400">
                    No capstone proposals currently awaiting faculty committee sign-off.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ─── LEVEL 3: COMPREHENSIVE FACULTY AUDIT DRAWER ─── */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-2xl h-full bg-white border-l border-slate-200 p-6 sm:p-8 overflow-y-auto space-y-6 text-left shadow-2xl flex flex-col justify-between"
            onClick={e => e.stopPropagation()}
          >
            <div className="space-y-6">
              
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono-data uppercase font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedEvidence.type} Attestation
                    </span>
                    {selectedEvidence.defenseScore && (
                      <span className="text-[10px] font-mono-data font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ASI Score: {Math.round(selectedEvidence.defenseScore)}/100
                      </span>
                    )}
                  </div>
                  <h2 className="font-display text-xl font-bold text-slate-900 leading-snug">
                    {selectedEvidence.title}
                  </h2>
                  <div className="text-xs text-slate-500 font-mono-data mt-0.5">
                    Candidate: <strong className="text-slate-800">{getAuthor(selectedEvidence.studentId)}</strong> · Submitted {selectedEvidence.date}
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedEvidence(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs inside Drawer */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono-data">
                <button
                  onClick={() => setDrawerTab('transcript')}
                  className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
                    drawerTab === 'transcript' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Socratic Transcript
                </button>
                <button
                  onClick={() => setDrawerTab('provenance')}
                  className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
                    drawerTab === 'provenance' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Git AST & Provenance
                </button>
                <button
                  onClick={() => setDrawerTab('rubric')}
                  className={`flex-1 py-1.5 rounded-md font-medium text-center transition-all ${
                    drawerTab === 'rubric' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sovereign Rubric
                </button>
              </div>

              {/* TAB 1: SOCRATIC DEFENSE TRANSCRIPT */}
              {drawerTab === 'transcript' && (
                <div className="space-y-4 text-xs">
                  {/* Overview Card */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-800 text-[11px] font-mono-data uppercase">
                      Deliverable Description
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedEvidence.description}
                    </p>
                    {selectedEvidence.url && (
                      <a 
                        href={selectedEvidence.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:underline pt-1 font-mono-data text-[11px]"
                      >
                        <span>Inspect Source Artifact / Repository</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* IRT Competency Metric */}
                  <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-mono-data text-blue-800 uppercase font-semibold">Bayesian IRT Competency</div>
                      <div className="text-sm font-bold text-blue-900 mt-0.5">
                        θ̂ = {selectedEvidence.irtCompetency?.thetaMap ?? 1.42} (95% CI: [{selectedEvidence.irtCompetency?.ci95[0] ?? 0.85}, {selectedEvidence.irtCompetency?.ci95[1] ?? 1.99}])
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono-data font-semibold bg-white text-blue-800 border border-blue-200 shadow-xs">
                      {selectedEvidence.irtCompetency?.classification ?? 'Advanced Standing'}
                    </span>
                  </div>

                  {/* Q&A Transcript */}
                  <div className="space-y-2.5">
                    <div className="font-semibold text-slate-800 text-[11px] font-mono-data uppercase flex items-center justify-between">
                      <span>Defense Interrogation History</span>
                      <span className="text-slate-400 font-normal">3 Adaptive Turns</span>
                    </div>

                    {(selectedEvidence.defenseTranscript && selectedEvidence.defenseTranscript.length > 0) ? (
                      selectedEvidence.defenseTranscript.map((t, idx) => (
                        <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800 font-mono-data text-[11px]">Turn {t.turnNumber}: {t.questionType.toUpperCase()}</span>
                            <span className="text-emerald-700 font-bold font-mono-data text-[11px]">{t.score}/100</span>
                          </div>
                          <p className="text-slate-700 font-medium">{t.question}</p>
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono-data text-[11px] text-slate-600">
                            {t.response}
                          </div>
                          {t.feedback && (
                            <p className="text-[11px] text-slate-500 italic">Evaluator note: {t.feedback}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      /* Demo transcript fallback if item was pre-loaded without transcript */
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-800 font-mono-data text-[11px]">Turn 1: ARCHITECTURAL TRADEOFF</span>
                          <span className="text-emerald-700 font-bold font-mono-data text-[11px]">88/100</span>
                        </div>
                        <p className="text-slate-700 font-medium">Why did you select asynchronous TensorRT workers over synchronous batching, and what was the latency consequence under peak concurrency?</p>
                        <div className="p-2.5 rounded-lg bg-white border border-slate-200 font-mono-data text-[11px] text-slate-600">
                          "TensorRT's dynamic batching queues incoming camera streams without locking the main GIL thread. Under 8-stream concurrency, synchronous inference spiked p99 latency to 84ms, whereas asynchronous ring buffers kept inference below 28ms at the expense of 12% additional VRAM buffer allocation."
                        </div>
                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                          <span>Latency: 38.2s · Cadence: Organic (94%)</span>
                          <span className="text-emerald-700 font-semibold">Verified Conceptual Depth</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GIT AST & PROVENANCE */}
              {drawerTab === 'provenance' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-semibold text-slate-800 text-[11px] font-mono-data uppercase">
                      Codebase Topology & AST Analysis
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-mono-data">Total LOC</div>
                        <div className="text-base font-bold text-slate-900 font-mono-data">
                          {selectedEvidence.provenanceSummary?.loc ?? '1,840'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-mono-data">AST Nodes</div>
                        <div className="text-base font-bold text-slate-900 font-mono-data">
                          {selectedEvidence.provenanceSummary?.astNodes ?? '5,620'}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-mono-data">Mean Complexity</div>
                        <div className="text-base font-bold text-slate-900 font-mono-data">
                          {selectedEvidence.provenanceSummary?.complexity ?? '3.4'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="font-semibold text-slate-800 text-[11px] font-mono-data uppercase">
                      Development Trajectory Pattern
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono-data font-semibold text-xs">
                        {selectedEvidence.provenanceSummary?.trajectoryPattern ?? 'Iterative Refinement'}
                      </span>
                      <span className="text-slate-500 font-mono-data text-[11px]">
                        Primary Author: {selectedEvidence.provenanceSummary?.primaryAuthorPct ?? 88}%
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-[11px] pt-1">
                      Continuous version-controlled engineering workflow observed across multi-week milestones. Incremental AST growth curve matches authentic software construction.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: SOVEREIGN RUBRIC & AUDIT */}
              {drawerTab === 'rubric' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="font-semibold text-slate-800 text-[11px] font-mono-data uppercase">
                      Faculty Committee Evaluation Rubric (1 to 4)
                    </div>

                    {/* Rubric Dimension 1 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700">1. Conceptual Depth & Architecture:</span>
                        <span className="font-mono-data font-bold text-slate-900">{rubricConcept} / 4</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" value={rubricConcept}
                        onChange={e => setRubricConcept(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />
                    </div>

                    {/* Rubric Dimension 2 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700">2. Implementation Authenticity & Debugging:</span>
                        <span className="font-mono-data font-bold text-slate-900">{rubricCode} / 4</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" value={rubricCode}
                        onChange={e => setRubricCode(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />
                    </div>

                    {/* Rubric Dimension 3 */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-700">3. Experimental Rigor & Evidence Completeness:</span>
                        <span className="font-mono-data font-bold text-slate-900">{rubricRigor} / 4</span>
                      </div>
                      <input 
                        type="range" min="1" max="4" value={rubricRigor}
                        onChange={e => setRubricRigor(Number(e.target.value))}
                        className="w-full accent-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono-data uppercase text-slate-500 font-semibold">
                      Faculty Attestation Remarks (Permanent Record)
                    </label>
                    <textarea
                      value={feedbackNote}
                      onChange={e => setFeedbackNote(e.target.value)}
                      placeholder="e.g. Socratic defense reviewed. Candidate demonstrated authentic architectural ownership and correctly diagnosed concurrency limits."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white resize-none h-24"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Sovereign Decision Actions Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={() => handleVerifyEvidence(selectedEvidence)}
                className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Sign & Verify Evidence (100% Attestation)
              </button>
              <button
                onClick={() => handleRejectEvidence(selectedEvidence)}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-rose-700 text-xs font-semibold transition-colors"
              >
                Request Re-Defense
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ─── LEVEL 4: PROPOSAL DETAILS DRAWER ──────── */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-8 overflow-y-auto space-y-6 text-left shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <span className="text-xs font-mono-data text-blue-600 font-semibold">Capstone Proposal</span>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  {selectedProposal.title}
                </h2>
                <div className="text-xs text-slate-500 font-mono-data mt-0.5">
                  Author: <strong className="text-slate-800">{selectedProposal.studentName}</strong>
                </div>
              </div>
              <button onClick={() => setSelectedProposal(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="space-y-1">
                <div className="font-mono-data uppercase text-slate-500 text-[10px] font-semibold">Problem Statement</div>
                <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed text-slate-700">
                  {selectedProposal.problem}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-mono-data uppercase text-slate-500 text-[10px] font-semibold">Archive Novelty & Similarity Check</div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 font-mono-data">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Institutional overlap:</span>
                    <span className="text-amber-700 font-bold">{selectedProposal.similarityMatches?.[0]?.overallSimilarity || 24}%</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>Closest archive project:</span>
                    <span className="text-slate-800 font-semibold">{selectedProposal.similarityMatches?.[0]?.matchedTitle || 'Historical Archive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="font-mono-data uppercase text-slate-500 text-[10px] font-semibold">Feedback / Directive</div>
                <input
                  type="text"
                  value={feedbackNote}
                  onChange={e => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Scope approved. Proceed to architecture sprint."
                  className="w-full p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={() => handleReviewProposal(selectedProposal, 'approved')}
                className="flex-1 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Approve Proposal
              </button>
              <button
                onClick={() => handleReviewProposal(selectedProposal, 'changes_requested')}
                className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Request Revisions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
