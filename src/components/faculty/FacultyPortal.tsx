import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Check, 
  X, 
  ExternalLink, 
  Filter
} from 'lucide-react';
import { Evidence, ProjectProposal } from '../../types';

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
  };

  const handleRejectEvidence = (ev: Evidence) => {
    rejectEvidence(ev.id, feedbackNote || 'Revisions requested by faculty.');
    setSelectedEvidence(null);
    setFeedbackNote('');
  };

  const handleReviewProposal = (prop: ProjectProposal, status: 'approved' | 'changes_requested' | 'flagged') => {
    reviewProposal(prop.id, status, feedbackNote || `Marked ${status} by ${currentUser.name}`);
    setSelectedProposal(null);
    setFeedbackNote('');
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10 text-left">
      
      {/* ================================================================ */}
      {/* LEVEL 1: TITLE & QUEUE SWITCHER */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F6FF] tracking-tight">
            Faculty Review Hub
          </h1>
          <p className="text-xs sm:text-sm text-[#BAC2DC] mt-1">
            Review student deliverables and sign evidence claims.
          </p>
        </div>

        {/* Switcher & Filter */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-[8px] bg-[#222A52] p-1 border border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setActiveQueue('evidences')}
              className={`px-3 py-1 text-xs font-mono-data rounded-[6px] transition-colors ${
                activeQueue === 'evidences' ? 'bg-[#8B7CFF] text-white font-medium' : 'text-[#8F99B8] hover:text-[#F4F6FF]'
              }`}
            >
              Proofs ({pendingEvidences.length})
            </button>
            <button
              onClick={() => setActiveQueue('proposals')}
              className={`px-3 py-1 text-xs font-mono-data rounded-[6px] transition-colors ${
                activeQueue === 'proposals' ? 'bg-[#8B7CFF] text-white font-medium' : 'text-[#8F99B8] hover:text-[#F4F6FF]'
              }`}
            >
              Proposals ({pendingProposals.length})
            </button>
          </div>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="p-2 rounded-[8px] bg-[#222A52] border border-[rgba(255,255,255,0.08)] text-[#BAC2DC] hover:text-[#F4F6FF]"
            title="Filter Queue"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsed Filter Bar */}
      {isFilterOpen && (
        <div className="p-4 rounded-[14px] bg-[#222A52] border border-[rgba(255,255,255,0.08)] flex items-center gap-4 text-xs font-mono-data">
          <span className="text-[#8F99B8]">Type:</span>
          {['all', 'project', 'internship', 'hackathon'].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-[6px] capitalize ${
                filterType === t ? 'bg-[#8B7CFF] text-white font-bold' : 'text-[#8F99B8] hover:text-[#F4F6FF]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* LEVEL 2: TABLE (Max 4 Columns, Single Action, Details in Drawer) */}
      {/* ================================================================ */}
      <div className="rounded-[20px] bg-[#222A52] border border-[rgba(255,255,255,0.10)] overflow-hidden shadow-sm">
        {activeQueue === 'evidences' ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8F99B8] font-mono-data text-[11px] bg-[#1A2040]/50">
                <th className="py-3.5 px-6 font-medium">Student & Title</th>
                <th className="py-3.5 px-4 font-medium hidden sm:table-cell">Type</th>
                <th className="py-3.5 px-4 font-medium hidden md:table-cell">Submitted</th>
                <th className="py-3.5 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {pendingEvidences.length > 0 ? (
                pendingEvidences.map(ev => (
                  <tr key={ev.id} className="hover:bg-[#1A2040]/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-sm text-[#F4F6FF]">{ev.title}</div>
                      <div className="text-xs text-[#8F99B8] font-mono-data">{getAuthor(ev.studentId)}</div>
                    </td>
                    <td className="py-4 px-4 font-mono-data text-[#BAC2DC] hidden sm:table-cell">
                      {ev.type}
                    </td>
                    <td className="py-4 px-4 font-mono-data text-[#8F99B8] hidden md:table-cell">
                      {ev.date}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedEvidence(ev)}
                        className="px-3.5 py-1.5 rounded-[8px] bg-[#8B7CFF] hover:bg-[#7b6be8] text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs font-mono-data text-[#8F99B8]">
                    All pending student evidence verified.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8F99B8] font-mono-data text-[11px] bg-[#1A2040]/50">
                <th className="py-3.5 px-6 font-medium">Proposal & Author</th>
                <th className="py-3.5 px-4 font-medium hidden sm:table-cell">Domain</th>
                <th className="py-3.5 px-4 font-medium hidden md:table-cell">Top Overlap</th>
                <th className="py-3.5 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {pendingProposals.length > 0 ? (
                pendingProposals.map(prop => (
                  <tr key={prop.id} className="hover:bg-[#1A2040]/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-sm text-[#F4F6FF]">{prop.title}</div>
                      <div className="text-xs text-[#8F99B8] font-mono-data">{prop.studentName}</div>
                    </td>
                    <td className="py-4 px-4 font-mono-data text-[#BAC2DC] hidden sm:table-cell">
                      {prop.domain}
                    </td>
                    <td className="py-4 px-4 font-mono-data text-[#FFC773] hidden md:table-cell">
                      {prop.similarityMatches?.[0]?.overallSimilarity || 24}%
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedProposal(prop)}
                        className="px-3.5 py-1.5 rounded-[8px] bg-[#8B7CFF] hover:bg-[#7b6be8] text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-xs font-mono-data text-[#8F99B8]">
                    No capstone proposals awaiting review.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* ================================================================ */}
      {/* EVIDENCE DETAILS DRAWER */}
      {/* ================================================================ */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg h-full bg-[#1A2040] border-l border-[rgba(255,255,255,0.18)] p-8 overflow-y-auto space-y-6 text-left shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.10)]">
              <div>
                <span className="text-xs font-mono-data text-[#8F99B8]">{selectedEvidence.type} Review</span>
                <h2 className="font-display text-xl font-bold text-[#F4F6FF]">
                  {selectedEvidence.title}
                </h2>
                <div className="text-xs text-[#8B7CFF] font-mono-data mt-0.5">
                  Candidate: {getAuthor(selectedEvidence.studentId)}
                </div>
              </div>
              <button onClick={() => setSelectedEvidence(null)} className="p-1 text-[#8F99B8] hover:text-[#F4F6FF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#BAC2DC]">
              <div className="space-y-1">
                <div className="font-mono-data uppercase text-[#8F99B8] text-[10px]">Description & Artifact</div>
                <p className="bg-[#222A52] p-4 rounded-[12px] leading-relaxed">
                  {selectedEvidence.description}
                </p>
              </div>

              {selectedEvidence.metrics && (
                <div className="p-3 rounded-[10px] bg-[#222A52] font-mono-data text-[#4ADE80]">
                  Outcome: {selectedEvidence.metrics}
                </div>
              )}

              {selectedEvidence.url && (
                <a 
                  href={selectedEvidence.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-3 rounded-[10px] bg-[#222A52] flex items-center justify-between text-[#8B7CFF] hover:underline"
                >
                  <span>View submission repository / paper</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <div className="space-y-1 pt-2">
                <div className="font-mono-data uppercase text-[#8F99B8] text-[10px]">Faculty Evaluation Note (Optional)</div>
                <input
                  type="text"
                  value={feedbackNote}
                  onChange={e => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Code reviewed and verified against benchmark repository."
                  className="w-full p-3 rounded-[10px] bg-[#222A52] border border-[rgba(255,255,255,0.10)] text-xs text-[#F4F6FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.10)] flex items-center gap-3">
              <button
                onClick={() => handleVerifyEvidence(selectedEvidence)}
                className="flex-1 py-3 rounded-[10px] bg-[#8B7CFF] hover:bg-[#7b6be8] text-white text-xs font-semibold shadow-sm transition-all"
              >
                Sign & Verify Evidence
              </button>
              <button
                onClick={() => handleRejectEvidence(selectedEvidence)}
                className="px-4 py-3 rounded-[10px] bg-[#222A52] hover:bg-[#2B3563] text-[#FB7185] text-xs font-medium transition-colors"
              >
                Request Revisions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* PROPOSAL DETAILS DRAWER */}
      {/* ================================================================ */}
      {selectedProposal && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="w-full max-w-lg h-full bg-[#1A2040] border-l border-[rgba(255,255,255,0.18)] p-8 overflow-y-auto space-y-6 text-left shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.10)]">
              <div>
                <span className="text-xs font-mono-data text-[#8F99B8]">Capstone Proposal</span>
                <h2 className="font-display text-xl font-bold text-[#F4F6FF]">
                  {selectedProposal.title}
                </h2>
                <div className="text-xs text-[#8B7CFF] font-mono-data mt-0.5">
                  Author: {selectedProposal.studentName}
                </div>
              </div>
              <button onClick={() => setSelectedProposal(null)} className="p-1 text-[#8F99B8] hover:text-[#F4F6FF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-[#BAC2DC]">
              <div className="space-y-1">
                <div className="font-mono-data uppercase text-[#8F99B8] text-[10px]">Problem Statement</div>
                <p className="bg-[#222A52] p-4 rounded-[12px] leading-relaxed">
                  {selectedProposal.problem}
                </p>
              </div>

              <div className="space-y-1">
                <div className="font-mono-data uppercase text-[#8F99B8] text-[10px]">Archive Similarity Check</div>
                <div className="bg-[#222A52] p-4 rounded-[12px] space-y-2 font-mono-data">
                  <div className="flex justify-between">
                    <span>Overall overlap:</span>
                    <span className="text-[#FFC773]">{selectedProposal.similarityMatches?.[0]?.overallSimilarity || 24}%</span>
                  </div>
                  <div className="flex justify-between text-[#8F99B8]">
                    <span>Closest paper:</span>
                    <span>{selectedProposal.similarityMatches?.[0]?.matchedTitle || 'Historical Archive'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <div className="font-mono-data uppercase text-[#8F99B8] text-[10px]">Feedback / Recommendation</div>
                <input
                  type="text"
                  value={feedbackNote}
                  onChange={e => setFeedbackNote(e.target.value)}
                  placeholder="e.g. Scope approved. Proceed to architecture sprint."
                  className="w-full p-3 rounded-[10px] bg-[#222A52] border border-[rgba(255,255,255,0.10)] text-xs text-[#F4F6FF] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.10)] flex items-center gap-3">
              <button
                onClick={() => handleReviewProposal(selectedProposal, 'approved')}
                className="flex-1 py-3 rounded-[10px] bg-[#8B7CFF] hover:bg-[#7b6be8] text-white text-xs font-semibold shadow-sm transition-all"
              >
                Approve Proposal
              </button>
              <button
                onClick={() => handleReviewProposal(selectedProposal, 'changes_requested')}
                className="px-4 py-3 rounded-[10px] bg-[#222A52] hover:bg-[#2B3563] text-[#BAC2DC] text-xs font-medium transition-colors"
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
