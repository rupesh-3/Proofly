import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  BarChart3, 
  Users, 
  Briefcase, 
  Search, 
  Filter, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  X,
  ChevronRight,
  ShieldCheck,
  Send,
  FileCheck
} from 'lucide-react';
import { Opportunity, Application, ApplicationStatus } from '../../types';
import { ScoreRing, CompanyAvatar } from '../common/EvidenceEncoding';

export const PlacementPortal: React.FC = () => {
  const { 
    opportunities, 
    studentApplications, 
    updateApplicationStatus, 
    allUsers, 
    createOpportunity 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'pipeline' | 'analytics' | 'postings'>('pipeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New posting state
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newType, setNewType] = useState<'internship' | 'full-time' | 'research'>('internship');
  const [newLocation, setNewLocation] = useState('Palo Alto, CA (Hybrid)');
  const [newSalary, setNewSalary] = useState('$52 - $65 / hr');
  const [newDesc, setNewDesc] = useState('');
  const [newDeadline, setNewDeadline] = useState('2026-12-15');

  // Synthetic Demand vs Supply Data
  const demandSupplyData = [
    { skill: 'PyTorch / Distributed LLM', demand: 92, supply: 64, delta: '-28%', status: 'Deficit' },
    { skill: 'CUDA & GPU Kernels', demand: 78, supply: 32, delta: '-46%', status: 'Critical Deficit' },
    { skill: 'Docker & Kubernetes', demand: 85, supply: 88, delta: '+3%', status: 'Balanced' },
    { skill: 'TypeScript & React', demand: 70, supply: 94, delta: '+24%', status: 'Surplus' },
    { skill: 'Rust Systems Programming', demand: 62, supply: 28, delta: '-34%', status: 'Deficit' },
    { skill: 'Vector Databases & RAG', demand: 88, supply: 76, delta: '-12%', status: 'Mild Deficit' },
  ];

  // Candidates lookup
  const getCandidateName = (id: string) => {
    return allUsers.find(u => u.id === id)?.name || 'Candidate';
  };

  const getOpp = (id: string) => {
    return opportunities.find(o => o.id === id);
  };

  const getOppTitle = (id: string) => {
    return getOpp(id)?.title || 'Research Engineering Fellow';
  };

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return studentApplications.filter(app => {
      const opp = getOpp(app.opportunityId);
      const studentName = getCandidateName(app.studentId);
      
      const matchSearch = 
        studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp?.company.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = selectedRoleFilter === 'all' || app.opportunityId === selectedRoleFilter;
      const matchStatus = selectedStatusFilter === 'all' || app.status === selectedStatusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [studentApplications, searchQuery, selectedRoleFilter, selectedStatusFilter, opportunities]);

  // Create posting
  const handleCreateOpp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany) return;

    createOpportunity({
      title: newTitle,
      company: newCompany,
      type: newType,
      workplaceType: 'Hybrid',
      location: newLocation,
      stipendOrSalary: newSalary,
      description: newDesc || 'Seeking high-caliber students with verified systems engineering and ML background.',
      deadline: newDeadline,
      postedBy: 'Stanford Career Center',
      requiredSkills: [
        { skillName: 'Python', weight: 5 },
        { skillName: 'PyTorch', weight: 4 },
        { skillName: 'Docker', weight: 3 }
      ]
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewCompany('');
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'Applied':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE', dot: 'bg-blue-600' };
      case 'Shortlisted':
        return { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE', dot: 'bg-purple-600' };
      case 'Interview':
        return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A', dot: 'bg-amber-600' };
      case 'Offer':
        return { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0', dot: 'bg-emerald-600' };
      case 'Rejected':
        return { bg: '#FFF1F2', color: '#BE123C', border: '#FECDD3', dot: 'bg-rose-600' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#E2E8F0', dot: 'bg-slate-500' };
    }
  };

  return (
    <div className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left bg-slate-50 min-h-screen animate-in fade-in duration-200">
      
      {/* 1. HEADER & METRICS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
              <Building2 className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono text-amber-800 uppercase font-bold tracking-wider">
              Placement Cell & Corporate Relations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            Campus Placement Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Monitor real-time talent supply, market hiring demand, and candidate application pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switcher */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 border border-slate-300/70">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeTab === 'pipeline' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pipeline ({studentApplications.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeTab === 'analytics' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demand vs Supply
            </button>
            <button
              onClick={() => setActiveTab('postings')}
              className={`px-3.5 py-1.5 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                activeTab === 'postings' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Postings ({opportunities.length})
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Post Role</span>
          </button>
        </div>
      </div>

      {/* 2. DEMAND VS SUPPLY ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
              <ScoreRing score={82} size={54} strokeWidth={5} color="#059669" />
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Cohort Match Rate</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">82% Ready</div>
                <div className="text-[11px] text-emerald-600 font-mono font-medium">+12% vs 2025 cohort</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
              <ScoreRing score={32} size={54} strokeWidth={5} color="#E11D48" />
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Highest Skill Gap</div>
                <div className="text-xl font-bold text-rose-700">CUDA & Kernels</div>
                <div className="text-[11px] text-slate-500">Only 32% cohort coverage</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center gap-4">
              <ScoreRing score={94} size={54} strokeWidth={5} color="#D97706" />
              <div>
                <div className="text-[11px] font-mono text-slate-500 uppercase font-semibold">Recruiter Inquiries</div>
                <div className="text-2xl font-bold text-slate-900 font-mono">48 Partners</div>
                <div className="text-[11px] text-slate-500">Searching verified talent</div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  Curriculum Alignment: Recruiter Demand vs. Verified Student Supply
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comparison between job posting requirements (Demand) and students with verified proofs (Supply).
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-indigo-600" /> Market Demand
                </span>
                <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                  <span className="w-3 h-3 rounded bg-teal-500" /> Student Supply
                </span>
              </div>
            </div>

            <div className="space-y-5">
              {demandSupplyData.map(item => {
                const isDeficit = item.status.includes('Deficit');
                return (
                  <div key={item.skill} className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.skill}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isDeficit 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {item.status} ({item.delta})
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-slate-500">
                        <span>Demand: <strong className="text-indigo-600">{item.demand}%</strong></span>
                        <span>Supply: <strong className="text-teal-700">{item.supply}%</strong></span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-600" 
                          style={{ width: `${item.demand}%` }}
                        />
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-teal-500" 
                          style={{ width: `${item.supply}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. PIPELINE TABLE */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search candidates or roles..."
                className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 w-64 shadow-xs"
              />

              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                {['all', 'Applied', 'Shortlisted', 'Interview', 'Offer'].map(st => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedStatusFilter === st 
                        ? 'bg-white text-slate-900 font-bold shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs font-mono text-slate-500 font-semibold">
              {filteredApplications.length} candidates tracked
            </span>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono text-[11px] bg-slate-50 font-semibold">
                    <th className="py-3.5 px-5">Candidate</th>
                    <th className="py-3.5 px-4">Target Role</th>
                    <th className="py-3.5 px-3 text-center">Match %</th>
                    <th className="py-3.5 px-4">Missing Skills</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredApplications.map(app => {
                    const opp = getOpp(app.opportunityId);
                    const candidateName = getCandidateName(app.studentId);
                    const badge = getStatusBadge(app.status);
                    const matchScore = app.opportunityId === 'opp-1' ? 94 : app.opportunityId === 'opp-2' ? 88 : 82;
                    const missing = app.opportunityId === 'opp-1' ? ['TensorRT'] : app.opportunityId === 'opp-2' ? ['Ray', 'vLLM'] : ['gRPC'];

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 p-0.5 shrink-0 overflow-hidden">
                              <img 
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" 
                                alt="" 
                                className="w-full h-full object-cover rounded-md" 
                              />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-slate-900">{candidateName}</div>
                              <div className="text-[10px] font-mono text-slate-500">Stanford '26 · ID #{app.studentId}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-xs text-slate-900">{getOppTitle(app.opportunityId)}</div>
                          <div className="text-[11px] text-slate-500">{opp?.company || 'Partner Lab'}</div>
                        </td>

                        <td className="py-4 px-3 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-amber-700">
                            {matchScore}%
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {missing.map(m => (
                              <span 
                                key={m}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-50 border border-rose-200 text-rose-700"
                              >
                                {m}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span 
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold"
                            style={{ backgroundColor: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {app.status}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => setSelectedApplication(app)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-mono font-medium transition-colors cursor-pointer"
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

      {/* 4. POSTINGS VIEW */}
      {activeTab === 'postings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {opportunities.map(opp => (
            <div 
              key={opp.id}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono uppercase bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                    {opp.type}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Closes {opp.deadline}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {opp.title}
                  </h3>
                  <div className="text-xs text-slate-600 mt-0.5 font-medium">
                    {opp.company} · {opp.location}
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {opp.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {opp.requiredSkills.map(s => (
                    <span key={s.skillName} className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {s.skillName}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-amber-700 font-bold">
                  {opp.stipendOrSalary}
                </span>
                <span className="text-slate-500">
                  {studentApplications.filter(a => a.opportunityId === opp.id).length} applicants
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MANAGE APPLICATION DRAWER */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold">
                    Pipeline Decision Control
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {getCandidateName(selectedApplication.studentId)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Position:</span>
                  <span className="text-slate-900 font-bold">{getOppTitle(selectedApplication.opportunityId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Applied Date:</span>
                  <span className="text-slate-700">{selectedApplication.appliedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current State:</span>
                  <span className="text-emerald-700 font-bold uppercase">{selectedApplication.status}</span>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-mono text-slate-500 uppercase font-semibold">
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
                      className={`p-2.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                        selectedApplication.status === st
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* POST OPPORTUNITY MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                Create Opportunity Posting
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOpp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-mono text-slate-500 font-semibold">Role Title</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Systems Research Fellow"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-slate-500 font-semibold">Company / Institution</label>
                <input 
                  type="text"
                  required
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  placeholder="e.g. OpenAI Research"
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-mono text-slate-500 font-semibold">Type</label>
                  <select 
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="internship">Internship</option>
                    <option value="full-time">Full-time</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-mono text-slate-500 font-semibold">Location</label>
                  <input 
                    type="text"
                    value={newLocation}
                    onChange={e => setNewLocation(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-xs cursor-pointer"
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
