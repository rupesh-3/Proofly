import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  ExternalLink, 
  Download, 
  QrCode, 
  Github, 
  Linkedin, 
  ArrowRight, 
  X, 
  Briefcase, 
  FolderPlus, 
  Trophy, 
  Award, 
  FileCheck, 
  Mail, 
  Check, 
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Share2,
  Calendar,
  Lock,
  Layers,
  Search,
  Filter,
  ArrowLeft,
  LayoutDashboard,
  Eye,
  Edit3,
  Settings2,
  Key,
  Hash,
  FileCode,
  Terminal
} from 'lucide-react';
import { EvidenceType, Skill, Evidence } from '../../types';
import { calculateSkillConfidence, normalizeSkillName } from '../../lib/logic';
import { ScoreRing, LevelMeter, getTypeStyle, EVIDENCE_TYPE_STYLES } from '../common/EvidenceEncoding';

interface CaseStudy {
  id: string;
  title: string;
  coverImage?: string;
  oneLineOutcome: string;
  tags: string[];
  isVerified: boolean;
  similarityMatch: string;
  problem: string;
  role: string;
  approach: string;
  result: string;
  metrics: { label: string; value: string }[];
  verifier: string;
  verifierTitle: string;
  verifierAvatar: string;
  verifierQuote: string;
  verifiedDate: string;
  githubUrl?: string;
  liveUrl?: string;
}

export const StudentProfile: React.FC = () => {
  const { 
    currentUser, 
    studentSkills, 
    studentEvidences, 
    proofStrength,
    activeTab,
    setActiveTab
  } = useApp();

  // Portfolio view mode: edit mode (owner) vs recruiter preview mode
  const [portfolioMode, setPortfolioMode] = useState<'edit' | 'public'>(
    activeTab === 'public-portfolio' ? 'public' : 'edit'
  );

  // Section visibility for edit mode
  const [visibleSections, setVisibleSections] = useState({
    projects: true,
    skills: true,
    timeline: true,
    credentials: true,
    verification: true
  });
  const [showSectionCustomizer, setShowSectionCustomizer] = useState(false);

  // Active section for sticky nav
  const [activeNav, setActiveNav] = useState<string>('projects');

  // Drawers and modals
  const [activeCaseStudy, setActiveCaseStudy] = useState<CaseStudy | null>(null);
  const [selectedDrawerSkill, setSelectedDrawerSkill] = useState<Skill | null>(null);
  const [isVerificationMethodDrawerOpen, setVerificationMethodDrawerOpen] = useState(false);
  const [isCryptoAttestationOpen, setCryptoAttestationOpen] = useState(false);
  const [isQrModalOpen, setQrModalOpen] = useState(false);
  const [isContactModalOpen, setContactModalOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Evidence | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Timeline type filter
  const [timelineFilter, setTimelineFilter] = useState<string>('all');

  const verificationId = `PRF-2026-${currentUser.id.toUpperCase()}-8821`;

  // Derived metrics
  const verifiedSkillsCount = useMemo(() => {
    return studentSkills.filter(s => {
      const proofs = studentEvidences.filter(e => s.evidenceIds.includes(e.id));
      return proofs.some(p => p.verificationStatus === 'verified');
    }).length;
  }, [studentSkills, studentEvidences]);

  const verifiedProjectsCount = useMemo(() => {
    return studentEvidences.filter(e => e.type === 'Project' && e.verificationStatus === 'verified').length;
  }, [studentEvidences]);

  const totalProofsCount = studentEvidences.length;
  const facultyVerifiedCount = studentEvidences.filter(e => e.verificationStatus === 'verified').length;

  // 3 Featured Projects
  const featuredProjects: CaseStudy[] = useMemo(() => [
    {
      id: 'cs-1',
      title: 'SynapseNet: Sparse Attention Visual Transformer',
      coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      oneLineOutcome: '2.8x speedup over standard MultiheadAttention on 4K sequences.',
      tags: ['PyTorch', 'CUDA', 'Python', 'Computer Vision'],
      isVerified: true,
      similarityMatch: '9% (original work)',
      problem: 'Quadratic attention complexity caused critical GPU memory bottlenecks on high-resolution image patches during real-time edge processing.',
      role: 'Lead Architect & Core Implementer (Senior Capstone)',
      approach: 'Implemented custom linear-time sparse attention kernel in CUDA/C++ and compiled into PyTorch with fused forward/backward kernels.',
      result: 'Achieved 2.8x inference speedup with <0.4% perplexity difference across 12M synthetic test tokens.',
      metrics: [
        { label: 'Latency Drop', value: '-64%' },
        { label: 'Peak Memory', value: '4.2GB -> 1.5GB' },
        { label: 'Originality Score', value: '91/100' }
      ],
      verifier: 'Prof. Alan Vance',
      verifierTitle: 'Chair of Computer Systems, Stanford University',
      verifierAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      verifierQuote: 'Alex demonstrated exceptional mastery in kernel programming and numerical precision analysis. The Capstone committee ranked this in the top 1%.',
      verifiedDate: 'May 20, 2026',
      githubUrl: 'https://github.com/alexrivera-ai/synapsenet-transformer',
      liveUrl: 'https://synapsenet.stanford.edu'
    },
    {
      id: 'cs-2',
      title: 'Distributed Model Inference Microservices',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
      oneLineOutcome: 'Reduced p99 inference latency by 34% on 8x H100 clusters.',
      tags: ['Python', 'Docker', 'TensorRT', 'Microservices'],
      isVerified: true,
      similarityMatch: '12% max match',
      problem: 'Microservice suffered latency spikes under heavy concurrent prompt streaming and uncoordinated batch scheduling.',
      role: 'Systems Research Intern (Cerebras & Stanford AI Lab)',
      approach: 'Architected asynchronous TensorRT pipelines with zero-copy shared memory queues and dynamic batch grouping.',
      result: 'Decreased p99 response time from 142ms to 93ms across 12M daily requests without dropping token delivery SLAs.',
      metrics: [
        { label: 'p99 Latency', value: '93ms' },
        { label: 'Throughput', value: '+52% req/s' },
        { label: 'Hardware Cost', value: '-22%' }
      ],
      verifier: 'Dr. Michael Chen',
      verifierTitle: 'Principal Research Scientist, Cerebras Systems',
      verifierAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      verifierQuote: 'Alex rapidly grasped our low-level inference stack and delivered production-grade pipeline optimizations ahead of schedule.',
      verifiedDate: 'Aug 28, 2026',
      githubUrl: 'https://github.com/alexrivera-ai/distributed-inference-bench'
    },
    {
      id: 'cs-3',
      title: 'EduPulse: Multimodal Speech-to-Diagram Engine',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      oneLineOutcome: 'Grand Champion / 1st of 240 collegiate hackathon teams.',
      tags: ['TypeScript', 'React', 'Gemini API', 'Canvas API'],
      isVerified: true,
      similarityMatch: '7% (original hackathon prototype)',
      problem: 'Classroom lectures lacked real-time visual diagram synthesis for complex algorithms and organic chemistry structures.',
      role: 'Full-Stack Lead & Engine Developer (36-hour sprint)',
      approach: 'Combined Whisper streaming transcription with structured Gemini API chaining to dynamically render declarative SVG diagram canvases.',
      result: 'Selected 1st of 240 collegiate teams at HackMIT 2025; TA pilot adopted for CS 161 (Algorithms) lecture recordings.',
      metrics: [
        { label: 'Hackathon Rank', value: '1st / 240' },
        { label: 'Synthesis Delay', value: '<800ms' },
        { label: 'Active Students', value: '380 TA users' }
      ],
      verifier: 'Dr. Sarah Jenkins',
      verifierTitle: 'HackMIT Grand Jury & MIT Media Lab Fellow',
      verifierAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      verifierQuote: 'Flawless execution under tight time constraints. The generative visual feedback loop was remarkably intuitive.',
      verifiedDate: 'Nov 25, 2025',
      githubUrl: 'https://github.com/alexrivera-ai/edupulse-scribe'
    }
  ], []);

  // Top 6 skills
  const top6Skills = useMemo(() => studentSkills.slice(0, 6), [studentSkills]);

  // Timeline items
  const filteredTimeline = useMemo(() => {
    return studentEvidences
      .filter(e => timelineFilter === 'all' || e.type.toLowerCase() === timelineFilter.toLowerCase())
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [studentEvidences, timelineFilter]);

  // Full credentials list
  const credentialsList = useMemo(() => {
    return studentEvidences.filter(e => e.type === 'Certificate' || e.type === 'Achievement');
  }, [studentEvidences]);

  // Drawer skill data
  const drawerBreakdown = useMemo(() => {
    if (!selectedDrawerSkill) return null;
    return calculateSkillConfidence(selectedDrawerSkill.canonicalName, studentEvidences);
  }, [selectedDrawerSkill, studentEvidences]);

  const drawerSkillEvidences = useMemo(() => {
    if (!selectedDrawerSkill) return [];
    return studentEvidences
      .filter(e => e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === selectedDrawerSkill.canonicalName.toLowerCase()))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [selectedDrawerSkill, studentEvidences]);

  // Copy shareable link
  const handleCopyLink = () => {
    const url = window.location.origin + '/p/alexrivera';
    navigator.clipboard?.writeText?.(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const navItems = [
    { id: 'projects', label: 'Projects & Code' },
    { id: 'skills', label: 'Competencies' },
    { id: 'experience', label: 'Timeline & Provenance' },
    { id: 'credentials', label: 'W3C Credentials' },
    { id: 'verify', label: 'Verification Protocol' }
  ];

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-12 text-left bg-slate-50 min-h-screen">
      
      {/* ================================================================ */}
      {/* PORTFOLIO NAVIGATION & MODE CONTROL BAR */}
      {/* ================================================================ */}
      <div className="sticky top-20 z-30 p-3 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4 no-print">
        
        {/* Left: Return to Dashboard button and Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all shadow-xs cursor-pointer border border-slate-200"
            title="Return to Student Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono text-slate-600">proofly.app/p/{currentUser.id}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-mono text-emerald-600 font-medium">
              {portfolioMode === 'public' ? 'Recruiter Public Preview' : 'Owner Edit Mode'}
            </span>
          </div>
        </div>

        {/* Right: Mode Switcher & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Segmented Switch */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => {
                setPortfolioMode('edit');
                if (activeTab === 'public-portfolio') setActiveTab('profile');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                portfolioMode === 'edit'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Edit Mode</span>
            </button>
            <button
              onClick={() => {
                setPortfolioMode('public');
                setActiveTab('public-portfolio');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                portfolioMode === 'public'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview as Recruiter</span>
            </button>
          </div>

          {/* Cryptographic Attestation inspect button */}
          <button
            onClick={() => setCryptoAttestationOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-mono font-medium transition-colors cursor-pointer"
            title="Inspect W3C cryptographic attestation"
          >
            <Key className="w-3.5 h-3.5 text-emerald-700" />
            <span>W3C VC Proof</span>
          </button>

          {/* Share button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer"
            title="Copy public link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden xs:inline">{copiedLink ? 'Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Recruiter Preview banner if in public mode */}
      {portfolioMode === 'public' && (
        <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-wrap items-center justify-between gap-3 text-xs text-indigo-900 no-print">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Recruiter Simulation View:</strong> You are previewing this portfolio exactly as corporate hiring teams and research labs see it.
            </span>
          </div>
          <button
            onClick={() => {
              setPortfolioMode('edit');
              setActiveTab('profile');
            }}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 cursor-pointer text-xs"
          >
            Return to Edit Mode
          </button>
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. CINEMATIC HERO */}
      {/* ================================================================ */}
      <section className="relative p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Candidate Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-br from-indigo-500 to-teal-400">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-[14px] object-cover bg-slate-100"
                  />
                </div>
                <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-3 ring-white" />
                <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-white border border-amber-300 text-amber-800 text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs">
                  <ShieldCheck className="w-3 h-3 text-amber-600" />
                  <span>Verified ID</span>
                </div>
              </div>

              {/* Names & Headline */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-semibold">
                    stanford.edu
                  </span>
                </div>

                <p className="text-sm sm:text-base text-slate-600 font-medium max-w-xl">
                  {currentUser.headline}
                </p>

                <div className="font-mono text-xs text-slate-500 flex flex-wrap items-center gap-2 pt-1">
                  <span>{currentUser.college}</span>
                  <span>•</span>
                  <span>{currentUser.batch || 'Class of 2026'}</span>
                  <span>•</span>
                  <span>B.S. in Computer Science & AI</span>
                  <span>•</span>
                  <span>Palo Alto, CA</span>
                </div>

                {/* Credibility Link */}
                <div 
                  onClick={() => setVerificationMethodDrawerOpen(true)}
                  className="pt-2 flex items-center gap-2 text-xs font-mono text-indigo-600 hover:text-indigo-800 cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="underline decoration-dotted underline-offset-4 font-semibold">
                    {totalProofsCount} proofs, {facultyVerifiedCount} verified by faculty & mentors · Attested Oct 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Recruiter Action Buttons */}
            <div className="flex flex-row sm:flex-row lg:flex-col gap-2.5 shrink-0 no-print">
              <button
                onClick={() => setContactModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact {currentUser.name.split(' ')[0]}</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Link copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Share profile</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-mono transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* 3 Headline Stat Cards */}
          <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              <ScoreRing score={proofStrength.score} size={54} strokeWidth={5} color="#D97706" />
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Proof Strength</div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {proofStrength.score} <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Top 5% Stanford CS cohort</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              <ScoreRing score={verifiedSkillsCount * 10} size={54} strokeWidth={5} color="#4F46E5" />
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Verified Skills</div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {verifiedSkillsCount} <span className="text-xs font-normal text-slate-400">competencies</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Backed by code & transcripts</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-4">
              <ScoreRing score={92} size={54} strokeWidth={5} color="#0D9488" />
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold">Verified Projects</div>
                <div className="text-xl font-bold text-slate-900 font-mono">
                  {verifiedProjectsCount || 3} <span className="text-xs font-normal text-slate-400">case studies</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">100% faculty/industry vetted</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. STICKY SECTION NAV */}
      {/* ================================================================ */}
      <div className="sticky top-16 z-20 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Ed25519 ID: {verificationId.slice(0, 16)}...
            </span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 3. FEATURED PROJECTS (Case Studies) */}
      {/* ================================================================ */}
      <section id="projects" className="space-y-6 scroll-mt-32">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Projects & Capstones
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Production systems, ML kernels, and verified engineering case studies.
            </p>
          </div>
          <span className="text-xs font-mono text-indigo-600 font-semibold">
            3 verified case studies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveCaseStudy(project)}
              className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image & Badges */}
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  {project.coverImage && (
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 text-slate-800 text-[10px] font-mono">
                      {project.similarityMatch}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                    {project.oneLineOutcome}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Verifier Info */}
              <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 truncate max-w-[180px]">
                  Vetted by {project.verifier}
                </span>
                <span className="text-indigo-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Case study <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 4. SKILLS WITH PROOF (Radar + Top 6 Cards) */}
      {/* ================================================================ */}
      <section id="skills" className="space-y-6 scroll-mt-32">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Skills with Verified Proof
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Every skill confidence score is mathematically grounded in verified repositories and academic reviews.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            Click any skill to inspect evidence chain
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Mini Radar Chart */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Domain Balance
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                  Full Stack ML
                </span>
              </div>

              {/* SVG Radar */}
              <div className="relative w-full h-52 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]">
                  <polygon points="100,20 176,64 176,136 100,180 24,136 24,64" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <polygon points="100,45 152,75 152,125 100,155 48,125 48,75" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  <polygon points="100,70 128,86 128,114 100,130 72,114 72,86" fill="none" stroke="#E2E8F0" strokeWidth="1" />
                  
                  <polygon 
                    points="100,28 165,70 148,128 100,165 38,120 32,70" 
                    fill="rgba(79, 70, 229, 0.12)" 
                    stroke="#4F46E5" 
                    strokeWidth="1.5" 
                  />
                  <circle cx="100" cy="28" r="3" fill="#4F46E5" />
                  <circle cx="165" cy="70" r="3" fill="#4F46E5" />
                  <circle cx="148" cy="128" r="3" fill="#4F46E5" />
                  <circle cx="100" cy="165" r="3" fill="#4F46E5" />
                  <circle cx="38" cy="120" r="3" fill="#4F46E5" />
                  <circle cx="32" cy="70" r="3" fill="#4F46E5" />
                </svg>

                {/* Radar Labels */}
                <span className="absolute top-1 text-[9px] font-mono text-slate-500">Deep Learning</span>
                <span className="absolute right-0 top-1/4 text-[9px] font-mono text-slate-500">Systems</span>
                <span className="absolute right-1 bottom-1/4 text-[9px] font-mono text-slate-500">Backend</span>
                <span className="absolute bottom-1 text-[9px] font-mono text-slate-500">Architecture</span>
                <span className="absolute left-1 bottom-1/4 text-[9px] font-mono text-slate-500">Frontend</span>
                <span className="absolute left-0 top-1/4 text-[9px] font-mono text-slate-500">Algorithms</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                <span>Highest Area:</span>
                <span className="text-amber-700 font-semibold">Deep Learning (94%)</span>
              </div>
              <div className="flex justify-between text-slate-500 font-mono text-[11px]">
                <span>Growth Dimension:</span>
                <span className="text-sky-700 font-semibold">Distributed Consensus (72%)</span>
              </div>
            </div>
          </div>

          {/* Right Top 6 Skill Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {top6Skills.map(skill => {
              const proofs = studentEvidences.filter(e => skill.evidenceIds.includes(e.id));
              return (
                <div
                  key={skill.id}
                  onClick={() => setSelectedDrawerSkill(skill)}
                  className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm hover:border-indigo-400 hover:bg-slate-50/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">
                        {skill.canonicalName}
                      </span>
                      <ScoreRing score={skill.confidence} size={38} strokeWidth={3.5} color="#4F46E5" />
                    </div>

                    <div className="flex items-center justify-between">
                      <LevelMeter level={skill.level} />
                      <span className="text-[10px] font-mono text-slate-500">
                        {proofs.length} proof{proofs.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {proofs.slice(0, 2).map((p, i) => (
                        <span key={i} className="text-[10px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[140px]">
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-indigo-600 font-medium">
                    <span>Inspect Evidence</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. VERIFIABLE CREDENTIALS & CRYPTOGRAPHIC ATTESTATIONS */}
      {/* ================================================================ */}
      <section id="credentials" className="space-y-6 scroll-mt-32">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              W3C Verifiable Credentials
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ed25519 digital signatures and Merkle root hashes published by verified institutions.
            </p>
          </div>
          <button
            onClick={() => setCryptoAttestationOpen(true)}
            className="text-xs font-mono text-indigo-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Verify Signature</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {credentialsList.map(c => {
            const isCert = c.type === 'Certificate';
            const hash = `0x7b...${c.id.slice(-4)}`;
            return (
              <div 
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-xl ${isCert ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-700'}`}>
                      {isCert ? <FileCheck className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {c.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-500 text-[10px]">
                    <span>Merkle Root:</span>
                    <span className="text-slate-800 font-semibold">{hash}</span>
                  </div>

                  <button
                    onClick={() => setCryptoAttestationOpen(true)}
                    className="text-indigo-600 hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                  >
                    <span>View Cryptographic Proof</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. VERIFICATION PROTOCOL (4 Pillars) */}
      {/* ================================================================ */}
      <section id="verify" className="p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6 scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Proofly Verification Protocol (IEEE Directive)
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Every credential is mathematically backed by 4 institutional pillars: Sovereign Faculty Evaluation, Git AST Provenance, Adaptive Socratic Defense, and Ed25519 Cryptographic Attestation.
            </p>
          </div>

          <button
            onClick={() => setVerificationMethodDrawerOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-mono text-slate-800 border border-slate-200 transition-colors shrink-0 cursor-pointer font-semibold"
          >
            Read Protocol Specs
          </button>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 font-mono">1. Faculty Sovereign Evaluation</div>
            <p className="text-[11px] text-slate-600">Faculty retain sovereign grading authority with transparent rubric overrides.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 font-mono">2. Git AST Provenance</div>
            <p className="text-[11px] text-slate-600">Code evolution and cyclomatic complexity trajectory across commit histories.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 font-mono">3. Socratic Defense Engine</div>
            <p className="text-[11px] text-slate-600">Adaptive counterfactual interrogation and live code challenge verification.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="text-xs font-bold text-slate-900 font-mono">4. Ed25519 Merkle Attestation</div>
            <p className="text-[11px] text-slate-600">Structured W3C Verifiable Credentials with independent signature validation.</p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. FOOTER */}
      {/* ================================================================ */}
      <footer className="p-8 sm:p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-slate-900">
              Inquire About Alex Rivera
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg">
              Seeking Machine Learning Engineering or Systems Research roles starting Fall 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Get in touch</span>
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>Mobile QR</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>github.com/alexrivera</span>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-slate-900 flex items-center gap-1.5 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>linkedin.com/in/alexrivera</span>
            </a>
          </div>

          <span>Verified on Proofly • Institutional Ledger ID: {verificationId}</span>
        </div>
      </footer>

      {/* CASE STUDY MODAL */}
      {activeCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden text-left">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-600 font-bold">
                  Verified Case Study
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  {activeCaseStudy.title}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {activeCaseStudy.role}
                </p>
              </div>

              <button
                onClick={() => setActiveCaseStudy(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {activeCaseStudy.metrics.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] font-mono text-slate-500 uppercase">{m.label}</div>
                    <div className="text-lg font-bold text-indigo-600 mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                  The Problem
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeCaseStudy.problem}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600">
                  Technical Approach
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeCaseStudy.approach}
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600">
                  Measured Outcome
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activeCaseStudy.result}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-4">
                <img 
                  src={activeCaseStudy.verifierAvatar} 
                  alt={activeCaseStudy.verifier} 
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-emerald-500"
                />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{activeCaseStudy.verifier}</span>
                    <span className="text-[10px] text-emerald-700 font-mono font-semibold">Verified {activeCaseStudy.verifiedDate}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">{activeCaseStudy.verifierTitle}</div>
                  <p className="text-xs italic text-slate-600 pt-1">
                    "{activeCaseStudy.verifierQuote}"
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeCaseStudy.githubUrl && (
                  <a 
                    href={activeCaseStudy.githubUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-mono text-slate-700 hover:text-indigo-600 flex items-center gap-1.5 transition-colors font-medium"
                  >
                    <Github className="w-4 h-4" />
                    <span>View Repository</span>
                  </a>
                )}
                {activeCaseStudy.liveUrl && (
                  <a 
                    href={activeCaseStudy.liveUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-mono text-indigo-600 hover:underline flex items-center gap-1 transition-colors font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setActiveCaseStudy(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-medium text-slate-800 hover:bg-slate-300 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CRYPTO ATTESTATION MODAL */}
      {isCryptoAttestationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  W3C Verifiable Credential Proof
                </h3>
              </div>
              <button
                onClick={() => setCryptoAttestationOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ed25519 Cryptographic Signature Valid</span>
              </div>
              <p className="text-emerald-800 text-[11px]">
                Signed by Stanford University Attestation Authority (`did:key:z6Mku...`) with SHA-256 Merkle tree verification.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-mono text-slate-500 font-semibold uppercase">Canonical Attestation Payload:</div>
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-60 leading-relaxed">
{JSON.stringify({
  "@context": [
    "https://www.w3.org/2018/credentials/v1",
    "https://proofly.edu/contexts/competency/v1"
  ],
  "id": `urn:uuid:${currentUser.id}-attestation-2026`,
  "type": ["VerifiableCredential", "DemonstratedCompetencyCredential"],
  "issuer": "did:key:z6MkuStanfordAcademicCouncil2026",
  "issuanceDate": "2026-10-15T09:00:00Z",
  "credentialSubject": {
    "id": `did:key:${currentUser.id}`,
    "student_name": currentUser.name,
    "degree": "B.S. Computer Science",
    "irt_theta_competency": 1.45,
    "merkle_evidence_root": "8f3b2d1c9e4a7f651234abcd5678ef0192837465aabbccddeeff001122334455"
  },
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2026-10-15T09:02:14Z",
    "verificationMethod": "did:key:z6MkuStanford#key-1",
    "proofPurpose": "assertionMethod",
    "jws": "eyJhbGciOiJFZERTQSI...MEQCIDk..."
  }
}, null, 2)}
              </pre>
            </div>

            <button
              onClick={() => setCryptoAttestationOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Close Verification
            </button>
          </div>
        </div>
      )}

      {/* VERIFICATION PROTOCOL DRAWER */}
      {isVerificationMethodDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg h-full bg-white border-l border-slate-200 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <h3 className="text-xl font-bold text-slate-900">
                    Institutional Verification
                  </h3>
                </div>
                <button
                  onClick={() => setVerificationMethodDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Proofly eliminates resume fraud and self-inflated skill claims through an artifact-grounded evidence graph:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>1. Capstone & Coursework</span>
                    <span className="text-emerald-700 font-mono text-[11px]">Approved</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Verified by Prof. Alan Vance (Faculty Advisor, Stanford CS Dept) on May 20, 2026. Grade and artifact signature recorded.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>2. Industry Internship</span>
                    <span className="text-emerald-700 font-mono text-[11px]">Signed</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Dr. Michael Chen (Cerebras Systems) confirmed system benchmarks and 34% p99 latency reduction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>3. HackMIT Grand Jury</span>
                    <span className="text-emerald-700 font-mono text-[11px]">1st / 240</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Dr. Sarah Jenkins and MIT Media Lab evaluated code authenticity and live demo on Nov 25, 2025.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setVerificationMethodDrawerOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
            >
              Close Verification Specs
            </button>
          </div>
        </div>
      )}

      {/* CONTACT MODAL */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 text-left shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                Contact {currentUser.name}
              </h3>
              <button
                onClick={() => setContactModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Recruiters and research labs can reach Alex directly at his verified Stanford address:
            </p>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-800">alex.rivera@stanford.edu</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.('alex.rivera@stanford.edu');
                  alert('Email copied to clipboard!');
                }}
                className="text-xs font-mono text-indigo-600 hover:underline font-semibold cursor-pointer"
              >
                Copy
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-medium text-slate-700 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Direct inquiry sent!');
                  setContactModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Recruiter Quick Scan
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl inline-block mx-auto border border-slate-200">
              <div className="w-40 h-40 bg-white grid grid-cols-6 grid-rows-6 gap-1 p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-xs ${[0, 1, 4, 5, 6, 11, 18, 23, 24, 29, 30, 31, 34, 35, 14, 21].includes(i) ? 'bg-slate-900' : 'bg-slate-200'}`} 
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Scan to view Alex Rivera's verified mobile portfolio and cryptographic skill attestations.
            </p>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-slate-900 text-xs font-mono text-white hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* SKILL DETAIL DRAWER */}
      {selectedDrawerSkill && drawerBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md h-full bg-white border-l border-slate-200 p-6 flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold">
                    Skill Evidence Inspection
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedDrawerSkill.canonicalName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDrawerSkill(null)}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Confidence ring */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                <ScoreRing score={selectedDrawerSkill.confidence} size={60} strokeWidth={5} color="#4F46E5" />
                <div>
                  <div className="text-xs font-mono text-slate-500">Confidence Score</div>
                  <div className="text-2xl font-bold text-slate-900 font-mono">
                    {selectedDrawerSkill.confidence} / 100
                  </div>
                  <div className="text-xs text-emerald-600 font-mono font-semibold">
                    {drawerBreakdown.level} Level
                  </div>
                </div>
              </div>

              {/* Formula Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Mathematical Breakdown
                </h4>
                <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-slate-600">Total Raw Point Accumulation</span>
                    <span className="font-mono text-slate-900 font-semibold">+{drawerBreakdown.totalRawPoints} pts</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-white border-b border-slate-100">
                    <span className="text-slate-600">Verified Proof Contributions</span>
                    <span className="font-mono text-emerald-600 font-semibold">{drawerBreakdown.items.length} artifacts</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-slate-600">Competency Tier</span>
                    <span className="font-mono text-sky-600 font-semibold">{drawerBreakdown.level}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-slate-100 font-bold">
                    <span className="text-slate-900">Total Mathematical Score</span>
                    <span className="font-mono text-indigo-600">{drawerBreakdown.confidence}</span>
                  </div>
                </div>
              </div>

              {/* Supporting Evidence */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                  Supporting Evidence ({drawerSkillEvidences.length})
                </h4>
                <div className="space-y-2">
                  {drawerSkillEvidences.map(e => {
                    const style = getTypeStyle(e.type);
                    return (
                      <div key={e.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-[10px] font-mono font-semibold uppercase px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${style.color}15`, color: style.color }}
                          >
                            {e.type}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{e.date}</span>
                        </div>
                        <div className="text-xs font-bold text-slate-900">{e.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDrawerSkill(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
