import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  PlusCircle, 
  X, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  TrendingUp,
  BarChart3,
  Users,
  Briefcase,
  AlertCircle,
  Check,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Opportunity, ApplicationStatus, Application } from '../../types';
import { ScoreRing } from '../common/EvidenceEncoding';

export const PlacementPortal: React.FC = () => {
  const { 
    currentUser,
    opportunities, 
    createOpportunity, 
    allUsers, 
    studentApplications,
    updateApplicationStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics' | 'postings'>('pipeline');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New posting fields
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newType, setNewType] = useState<'internship' | 'full-time' | 'research'>('internship');
  const [newLocation, setNewLocation] = useState('San Francisco, CA');

  // Demand vs Supply Dataset for Stanford 2026 Cohort
  const demandSupplyData = [
    { skill: 'Python', demand: 92, supply: 88, status: 'Balanced', delta: '-4%' },
    { skill: 'PyTorch', demand: 86, supply: 64, status: 'Deficit', delta: '-22%' },
    { skill: 'CUDA & GPU Kernels', demand: 74, supply: 32, status: 'Critical Deficit', delta: '-42%' },
    { skill: 'Distributed Systems', demand: 80, supply: 45, status: 'Deficit', delta: '-35%' },
    { skill: 'TypeScript / React', demand: 68, supply: 78, status: 'Surplus', delta: '+10%' },
    { skill: 'Docker & Kubernetes', demand: 70, supply: 52, status: 'Deficit', delta: '-18%' }
  ];

  const filteredApplications = studentApplications.filter(app => {
    return statusFilter === 'all' || app.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const getCandidateName = (studentId: string) => {
    return allUsers.find(u => u.id === studentId)?.name || 'Candidate';
  };

  const getOpp = (oppId: string) => {
    return opportunities.find(o => o.id === oppId);
  };

  const getOppTitle = (oppId: string) => {
    return getOpp(oppId)?.title || 'Campus Opportunity';
  };

  const handleCreateOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCompany.trim()) return;

    createOpportunity({
      title: newTitle,
      company: newCompany,
      type: newType,
      location: newLocation,
      workplaceType: 'Hybrid',
      stipendOrSalary: '$55 - $75 / hr',
      postedBy: currentUser.name,
      deadline: '2026-12-15',
      description: `${newTitle} opening at ${newCompany}. Requires verified engineering capstone experience.`,
      requiredSkills: [
        { skillName: 'Python', weight: 5 },
        { skillName: 'PyTorch', weight: 4 },
      ]
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewCompany('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Offer':
        return { bg: '#4ADE8018', border: '#4ADE8035', color: '#4ADE80', dot: 'bg-[#4ADE80]' };
      case 'Interview':
        return { bg: '#FFC77318', border: '#FFC77335', color: '#FFC773', dot: 'bg-[#FFC773]' };
      case 'Shortlisted':
        return { bg: '#38BDF818', border: '#38BDF835', color: '#38BDF8', dot: 'bg-[#38BDF8]' };
      case 'Rejected':
        return { bg: '#FB718518', border: '#FB718535', color: '#FB7185', dot: 'bg-[#FB7185]' };
      default:
        return { bg: '#8B7CFF18', border: '#8B7CFF35', color: '#8B7CFF', dot: 'bg-[#8B7CFF]' };
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
      
      {/* ================================================================ */}
      {/* 1. HEADER & KPI CARDS */}
      {/* ================================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-[#FFC773]/20 text-[#FFC773]">
              <Building2Icon className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono-data text-[#FFC773] uppercase font-bold tracking-wider">
              Placement Cell & Corporate Relations
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FF] mt-1 tracking-tight">
            Campus Placement Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#BAC2DC] mt-0.5">
            Monitor real-time talent supply, market hiring demand, and candidate application pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switcher */}
          <div className="flex rounded-xl bg-[#222A52] p-1 border border-[rgba(255,255,255,0.08)]">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 text-xs font-mono-data rounded-lg transition-colors ${
                activeTab === 'pipeline' ? 'bg-[#8B7CFF] text-white font-bold' : 'text-[#8F99B8] hover:text-[#F4F6FF]'
              }`}
            >
              Pipeline ({studentApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 text-xs font-mono-data rounded-lg transition-colors ${
                activeTab === 'analytics' ? 'bg-[#8B7CFF] text-white font-bold' : 'text-[#8F99B8] hover:text-[#F4F6FF]'
              }`}
            >
              Demand vs Supply
            </button>
            <button
              onClick={() => setActiveTab('postings')}
              className={`px-3.5 py-1.5 text-xs font-mono-data rounded-lg transition-colors ${
                activeTab === 'postings' ? 'bg-[#8B7CFF] text-white font-bold' : 'text-[#8F99B8] hover:text-[#F4F6FF]'
              }`}
            >
              Postings ({opportunities.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#7B6BE8] hover:from-[#7B6BE8] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 shrink-0"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Role</span>
          </button>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 2. DEMAND VS SUPPLY ANALYTICS (When selected or overview) */}
      {/* ================================================================ */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Banner KPI */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
              <ScoreRing score={82} size={54} strokeWidth={5} color="#4ADE80" />
              <div>
                <div className="text-[11px] font-mono-data text-[#8F99B8] uppercase">Cohort Match Rate</div>
                <div className="font-display text-2xl font-bold text-[#F4F6FF]">82% Ready</div>
                <div className="text-[11px] text-[#4ADE80] font-mono-data">+12% vs 2025 cohort</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
              <ScoreRing score={32} size={54} strokeWidth={5} color="#FB7185" />
              <div>
                <div className="text-[11px] font-mono-data text-[#8F99B8] uppercase">Highest Skill Gap</div>
                <div className="font-display text-xl font-bold text-[#FB7185]">CUDA & Kernels</div>
                <div className="text-[11px] text-[#BAC2DC]">Only 32% cohort coverage</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] flex items-center gap-4">
              <ScoreRing score={94} size={54} strokeWidth={5} color="#FFC773" />
              <div>
                <div className="text-[11px] font-mono-data text-[#8F99B8] uppercase">Recruiter Inquiries</div>
                <div className="font-display text-2xl font-bold text-[#FFC773]">48 Companies</div>
                <div className="text-[11px] text-[#BAC2DC]">Searching verified talent</div>
              </div>
            </div>
          </div>

          {/* Detailed Surplus / Deficit Chart */}
          <div className="p-6 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.10)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[rgba(255,255,255,0.08)] pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-[#F4F6FF] flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#8B7CFF]" />
                  Curriculum Alignment: Recruiter Demand vs. Verified Student Supply
                </h3>
                <p className="text-xs text-[#8F99B8] mt-0.5">
                  Comparison between job posting requirements (Demand) and students with verified proofs (Supply).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono-data">
                <span className="flex items-center gap-1.5 text-[#8F99B8]">
                  <span className="w-3 h-3 rounded bg-[#8B7CFF]" /> Market Demand
                </span>
                <span className="flex items-center gap-1.5 text-[#8F99B8]">
                  <span className="w-3 h-3 rounded bg-[#2DD4BF]" /> Student Supply
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {demandSupplyData.map(item => {
                const isDeficit = item.status.includes('Deficit');
                return (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono-data">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#F4F6FF] text-sm">{item.skill}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isDeficit 
                            ? 'bg-[#FB7185]/20 text-[#FB7185] border border-[#FB7185]/30' 
                            : 'bg-[#4ADE80]/20 text-[#4ADE80] border border-[#4ADE80]/30'
                        }`}>
                          {item.status} ({item.delta})
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[#8F99B8]">
                        <span>Demand: <strong className="text-[#8B7CFF]">{item.demand}%</strong></span>
                        <span>Supply: <strong className="text-[#2DD4BF]">{item.supply}%</strong></span>
                      </div>
                    </div>

                    {/* Comparative Dual Bars */}
                    <div className="space-y-1">
                      <div className="w-full h-2.5 rounded-full bg-[#1A2040] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#8B7CFF]" 
                          style={{ width: `${item.demand}%` }}
                        />
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-[#1A2040] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#2DD4BF]" 
                          style={{ width: `${item.supply}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] flex items-start gap-3 text-xs text-[#BAC2DC]">
              <AlertCircle className="w-4 h-4 text-[#FFC773] shrink-0 mt-0.5" />
              <span>
                <strong>Placement Advisory:</strong> High demand for low-level GPU acceleration (CUDA) is not being met by core coursework alone. Recommend scheduling an advanced systems hackathon or offering hardware acceleration micro-credentials.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 3. 6-COLUMN PIPELINE TABLE */}
      {/* ================================================================ */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 animate-fade-in">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono-data text-[#8F99B8]">Filter by status:</span>
              <div className="flex items-center gap-1.5">
                {['all', 'Applied', 'Shortlisted', 'Interview', 'Offer'].map(st => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono-data capitalize transition-colors ${
                      statusFilter === st 
                        ? 'bg-[#8B7CFF] text-white font-bold' 
                        : 'bg-[#222A52] text-[#8F99B8] hover:text-[#F4F6FF]'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono-data text-[#8F99B8]">
              {filteredApplications.length} candidates tracked
            </span>
          </div>

          <div className="rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.10)] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.08)] text-[#8F99B8] font-mono-data text-[11px] bg-[#1A2040]/70">
                    <th className="py-3.5 px-5 font-semibold">1. Candidate</th>
                    <th className="py-3.5 px-4 font-semibold">2. Target Role</th>
                    <th className="py-3.5 px-3 font-semibold text-center">3. Match %</th>
                    <th className="py-3.5 px-4 font-semibold">4. Missing Skills</th>
                    <th className="py-3.5 px-4 font-semibold">5. Status</th>
                    <th className="py-3.5 px-5 font-semibold text-right">6. Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {filteredApplications.map(app => {
                    const opp = getOpp(app.opportunityId);
                    const candidateName = getCandidateName(app.studentId);
                    const badge = getStatusBadge(app.status);
                    const matchScore = app.opportunityId === 'opp-1' ? 94 : app.opportunityId === 'opp-2' ? 88 : 82;
                    const missing = app.opportunityId === 'opp-1' ? ['TensorRT'] : app.opportunityId === 'opp-2' ? ['Ray', 'vLLM'] : ['gRPC'];

                    return (
                      <tr key={app.id} className="hover:bg-[#1A2040]/40 transition-colors">
                        {/* 1. Candidate */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#2DD4BF] p-0.5 shrink-0">
                              <img 
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                                alt=""
                                className="w-full h-full rounded-[6px] object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-[#F4F6FF]">{candidateName}</div>
                              <div className="text-[10px] font-mono-data text-[#8F99B8]">Stanford '26 · ID #{app.studentId}</div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Target Role */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-xs text-[#F4F6FF]">{getOppTitle(app.opportunityId)}</div>
                          <div className="text-[11px] text-[#8F99B8]">{opp?.company || 'Partner Lab'}</div>
                        </td>

                        {/* 3. Match % */}
                        <td className="py-4 px-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-[#1A2040] border border-[rgba(255,255,255,0.08)] font-mono-data font-bold text-xs text-[#FFC773]">
                            {matchScore}%
                          </span>
                        </td>

                        {/* 4. Missing Skills */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {missing.map(m => (
                              <span 
                                key={m}
                                className="px-2 py-0.5 rounded text-[10px] font-mono-data bg-[#FB7185]/15 border border-[#FB7185]/30 text-[#FB7185]"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* 5. Status Pill */}
                        <td className="py-4 px-4">
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-data font-semibold"
                            style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {app.status}
                          </span>
                        </td>

                        {/* 6. Actions */}
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="px-3 py-1.5 rounded-lg bg-[#1A2040] hover:bg-[#2B3563] border border-[rgba(255,255,255,0.10)] text-[#F4F6FF] text-xs font-mono-data font-medium transition-colors"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 4. POSTINGS VIEW */}
      {/* ================================================================ */}
      {activeTab === 'postings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {opportunities.map(opp => (
            <div 
              key={opp.id}
              className="p-6 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF]/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-data uppercase bg-[#8B7CFF]/20 text-[#8B7CFF] font-bold">
                    {opp.type}
                  </span>
                  <span className="text-[11px] font-mono-data text-[#8F99B8]">
                    Closes {opp.deadline}
                  </span>
                </div>

                <div>
                  <h3 className="font-display text-base font-bold text-[#F4F6FF]">
                    {opp.title}
                  </h3>
                  <div className="text-xs text-[#BAC2DC] mt-0.5 font-medium">
                    {opp.company} · {opp.location}
                  </div>
                </div>

                <p className="text-xs text-[#8F99B8] line-clamp-2">
                  {opp.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.requiredSkills.map(s => (
                    <span key={s.skillName} className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#1A2040] text-[#BAC2DC]">
                      {s.skillName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs font-mono-data">
                <span className="text-[#FFC773] font-bold">
                  {opp.stipendOrSalary}
                </span>
                <span className="text-[#8F99B8]">
                  {studentApplications.filter(a => a.opportunityId === opp.id).length} applicants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* MANAGE APPLICATION DRAWER */}
      {/* ================================================================ */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#222A52] border-l border-[rgba(255,255,255,0.12)] p-6 flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
                <div>
                  <span className="text-[10px] font-mono-data text-[#8B7CFF] uppercase font-bold">
                    Pipeline Decision Control
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#F4F6FF]">
                    {getCandidateName(selectedApplication.studentId)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-1.5 rounded-lg bg-[#1A2040] text-[#8F99B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Application Details */}
              <div className="p-4 rounded-xl bg-[#1A2040]/70 space-y-2 text-xs font-mono-data">
                <div className="flex justify-between">
                  <span className="text-[#8F99B8]">Position:</span>
                  <span className="text-[#F4F6FF] font-bold">{getOppTitle(selectedApplication.opportunityId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F99B8]">Applied Date:</span>
                  <span className="text-[#BAC2DC]">{selectedApplication.appliedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8F99B8]">Current State:</span>
                  <span className="text-[#4ADE80] font-bold uppercase">{selectedApplication.status}</span>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="space-y-3">
                <label className="text-xs font-mono-data text-[#8F99B8] uppercase">
                  Advance Candidate Pipeline Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Applied', 'Shortlisted', 'Interview', 'Offer', 'Rejected'] as ApplicationStatus[]).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        updateApplicationStatus(selectedApplication.id, st);
                        setSelectedApplication(prev => prev ? { ...prev, status: st } : null);
                      }}
                      className={`p-2.5 rounded-xl text-xs font-mono-data font-semibold transition-all ${
                        selectedApplication.status === st
                          ? 'bg-[#8B7CFF] text-white shadow-md'
                          : 'bg-[#1A2040] text-[#8F99B8] hover:text-white hover:bg-[#2B3563]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedApplication(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#2B3563] text-xs font-semibold text-white hover:bg-[#344079]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* POST OPPORTUNITY MODAL */}
      {/* ================================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#222A52] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
              <h3 className="font-display text-base font-bold text-[#F4F6FF]">
                Create Opportunity Posting
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[#8F99B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-mono-data text-[#8F99B8]">Role Title</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Systems Research Fellow"
                  className="w-full p-2.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.08)] text-[#F4F6FF] focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono-data text-[#8F99B8]">Company / Institution</label>
                <input 
                  type="text"
                  required
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. OpenAI Research"
                  className="w-full p-2.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.08)] text-[#F4F6FF] focus:outline-none focus:border-[#8B7CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono-data text-[#8F99B8]">Type</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.08)] text-[#F4F6FF] focus:outline-none focus:border-[#8B7CFF]"
                  >
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-mono-data text-[#8F99B8]">Location</label>
                  <input 
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.08)] text-[#F4F6FF] focus:outline-none focus:border-[#8B7CFF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1A2040] text-[#8F99B8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#8B7CFF] text-white font-semibold hover:bg-[#7b6be8]"
                >
                  Publish Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

function Building2Icon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
      <path d="M9 22v-4h6v4"/>
      <path d="M8 6h.01"/>
      <path d="M16 6h.01"/>
      <path d="M12 6h.01"/>
      <path d="M12 10h.01"/>
      <path d="M12 14h.01"/>
      <path d="M16 10h.01"/>
      <path d="M16 14h.01"/>
      <path d="M8 10h.01"/>
      <path d="M8 14h.01"/>
    </svg>
  );
}
