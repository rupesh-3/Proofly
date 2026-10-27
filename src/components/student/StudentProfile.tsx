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
  Settings2
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

  // Full credentials list (Certificates + Achievements)
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
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'credentials', label: 'Credentials' },
    { id: 'verify', label: 'Verification' }
  ];

  return (
    <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-8 sm:space-y-12 text-left">
      
      {/* ================================================================ */}
      {/* PORTFOLIO NAVIGATION & MODE CONTROL BAR */}
      {/* ================================================================ */}
      <div className="sticky top-20 z-30 p-3 sm:p-4 rounded-2xl bg-[#1A2040]/95 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-xl flex flex-wrap items-center justify-between gap-4 no-print">
        
        {/* Left: Return to Dashboard button and Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#222A52] hover:bg-[#2B3563] text-[#F4F6FF] border border-[rgba(255,255,255,0.12)] text-xs font-semibold transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
            title="Return to Student Dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-[#8B7CFF]" />
            <span>Back to Dashboard</span>
          </button>

          <div className="h-5 w-px bg-[rgba(255,255,255,0.12)] hidden sm:block" />

          <div className="hidden sm:flex items-center gap-2 text-xs text-[#BAC2DC]">
            <span className="font-mono-data text-[#8F99B8]">proofly.app/p/{currentUser.id}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
            <span className="text-[11px] font-mono-data text-[#4ADE80]">
              {portfolioMode === 'public' ? 'Recruiter Simulation' : 'Owner Edit Mode'}
            </span>
          </div>
        </div>

        {/* Right: Mode Switcher & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Segmented Switch */}
          <div className="flex items-center p-1 rounded-xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] text-xs font-medium">
            <button
              onClick={() => {
                setPortfolioMode('edit');
                if (activeTab === 'public-portfolio') setActiveTab('profile');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                portfolioMode === 'edit'
                  ? 'bg-[#8B7CFF] text-white shadow-sm font-semibold'
                  : 'text-[#BAC2DC] hover:text-[#F4F6FF]'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Mode</span>
            </button>
            <button
              onClick={() => {
                setPortfolioMode('public');
                setActiveTab('public-portfolio');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                portfolioMode === 'public'
                  ? 'bg-[#2DD4BF] text-[#1A2040] font-bold shadow-sm'
                  : 'text-[#BAC2DC] hover:text-[#F4F6FF]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview as Recruiter</span>
            </button>
          </div>

          {/* Section visibility toggle (Edit mode only) */}
          {portfolioMode === 'edit' && (
            <button
              onClick={() => setShowSectionCustomizer(!showSectionCustomizer)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222A52] hover:bg-[#2B3563] text-[#BAC2DC] hover:text-[#F4F6FF] border border-[rgba(255,255,255,0.10)] text-xs transition-colors cursor-pointer"
              title="Customize visible sections"
            >
              <Settings2 className="w-3.5 h-3.5 text-[#FFC773]" />
              <span>Sections</span>
            </button>
          )}

          {/* Share button */}
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#222A52] hover:bg-[#2B3563] text-[#F4F6FF] border border-[rgba(255,255,255,0.12)] text-xs font-medium transition-colors cursor-pointer"
            title="Copy public link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Share2 className="w-3.5 h-3.5 text-[#8B7CFF]" />}
            <span className="hidden xs:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Recruiter Preview notification bar if in public mode */}
      {portfolioMode === 'public' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2DD4BF]/15 via-[#8B7CFF]/15 to-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F4F6FF] no-print">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#2DD4BF]" />
            <span>
              <strong>Recruiter Simulation Mode Active:</strong> You are viewing this verified portfolio exactly as external recruiters and hiring partners see it. Private administrative notes are hidden.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setPortfolioMode('edit');
                setActiveTab('profile');
              }}
              className="px-3 py-1 rounded-lg bg-[#222A52] hover:bg-[#2B3563] text-xs font-semibold text-[#F4F6FF] border border-[rgba(255,255,255,0.12)] cursor-pointer"
            >
              Exit Preview & Edit
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-3 py-1 rounded-lg bg-[#8B7CFF] hover:bg-[#7b6be8] text-xs font-semibold text-white shadow-sm cursor-pointer"
            >
              ← Main Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Section customizer drawer/panel when enabled in edit mode */}
      {portfolioMode === 'edit' && showSectionCustomizer && (
        <div className="p-4 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.14)] space-y-3 no-print">
          <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.08)]">
            <span className="text-xs font-bold text-[#F4F6FF]">Portfolio Section Visibility</span>
            <button onClick={() => setShowSectionCustomizer(false)} className="text-xs text-[#8F99B8] hover:text-[#F4F6FF] cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {Object.entries(visibleSections).map(([sec, isVis]) => (
              <button
                key={sec}
                onClick={() => setVisibleSections(prev => ({ ...prev, [sec]: !isVis }))}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isVis
                    ? 'bg-[#8B7CFF]/20 border-[#8B7CFF]/40 text-[#F4F6FF]'
                    : 'bg-[#1A2040] border-[rgba(255,255,255,0.08)] text-[#8F99B8]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isVis ? 'bg-[#4ADE80]' : 'bg-[#8F99B8]'}`} />
                <span className="capitalize">{sec}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 1. CINEMATIC HERO */}
      {/* ================================================================ */}
      <section className="relative p-8 sm:p-12 rounded-[28px] bg-gradient-to-br from-[#222A52] via-[#1F274D] to-[#1A2040] border border-[rgba(255,255,255,0.12)] shadow-2xl overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B7CFF]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#2DD4BF]/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            {/* Candidate Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar with live ring */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-br from-[#8B7CFF] via-[#38BDF8] to-[#2DD4BF]">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-[14px] object-cover bg-[#1A2040]"
                  />
                </div>
                {/* Online indicator */}
                <span className="absolute top-2 right-2 w-3.5 h-3.5 rounded-full bg-[#4ADE80] ring-3 ring-[#1A2040]" />
                {/* Verified Pill */}
                <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-[#222A52] border border-[#FFC773] text-[#FFC773] text-[10px] font-mono-data font-bold flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3 h-3 text-[#FFC773]" />
                  <span>Verified ID</span>
                </div>
              </div>

              {/* Names & Headline */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F4F6FF] tracking-tight">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8B7CFF]/20 border border-[#8B7CFF]/40 text-[#8B7CFF] text-xs font-mono-data font-medium">
                    stanford.edu
                  </span>
                </div>

                <p className="text-sm sm:text-base text-[#BAC2DC] font-medium max-w-xl">
                  {currentUser.headline}
                </p>

                <div className="font-mono-data text-xs text-[#8F99B8] flex flex-wrap items-center gap-2 pt-1">
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
                  className="pt-2 flex items-center gap-2 text-xs font-mono-data text-[#8B7CFF] hover:text-[#A79BFF] cursor-pointer transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                  <span className="underline decoration-dotted underline-offset-4 font-semibold">
                    {totalProofsCount} proofs, {facultyVerifiedCount} verified by faculty & mentors · Last audit Oct 2026
                  </span>
                </div>
              </div>
            </div>

            {/* Recruiter Action Buttons */}
            <div className="flex flex-row sm:flex-row lg:flex-col gap-2.5 shrink-0 no-print">
              <button
                onClick={() => setContactModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#7B6BE8] hover:from-[#7B6BE8] hover:to-[#6A5AD7] text-white text-xs font-semibold shadow-lg shadow-[#8B7CFF]/20 transition-all flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Alex</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#2B3563] hover:bg-[#344079] text-[#F4F6FF] border border-[rgba(255,255,255,0.14)] text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span className="text-[#4ADE80]">Link copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share profile</span>
                  </>
                )}
              </button>

              <button
                onClick={() => window.print()}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1A2040]/80 hover:bg-[#1A2040] text-[#8F99B8] hover:text-[#F4F6FF] border border-[rgba(255,255,255,0.08)] text-xs font-mono-data transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>

          {/* 3 Headline Stat Cards with animated Score Rings */}
          <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-4 rounded-xl bg-[#1A2040]/60 border border-[rgba(255,255,255,0.06)] flex items-center gap-4">
              <ScoreRing score={proofStrength.score} size={54} strokeWidth={5} color="#FFC773" />
              <div>
                <div className="text-[11px] font-mono-data uppercase tracking-wider text-[#8F99B8]">Proof Strength</div>
                <div className="font-display text-xl font-bold text-[#FFC773]">
                  {proofStrength.score} <span className="text-xs font-normal text-[#8F99B8]">/ 100</span>
                </div>
                <p className="text-[11px] text-[#BAC2DC] mt-0.5">Top 5% Stanford CS cohort</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A2040]/60 border border-[rgba(255,255,255,0.06)] flex items-center gap-4">
              <ScoreRing score={verifiedSkillsCount * 10} size={54} strokeWidth={5} color="#8B7CFF" />
              <div>
                <div className="text-[11px] font-mono-data uppercase tracking-wider text-[#8F99B8]">Verified Skills</div>
                <div className="font-display text-xl font-bold text-[#F4F6FF]">
                  {verifiedSkillsCount} <span className="text-xs font-normal text-[#8F99B8]">competencies</span>
                </div>
                <p className="text-[11px] text-[#BAC2DC] mt-0.5">Backed by code & transcripts</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#1A2040]/60 border border-[rgba(255,255,255,0.06)] flex items-center gap-4">
              <ScoreRing score={92} size={54} strokeWidth={5} color="#2DD4BF" />
              <div>
                <div className="text-[11px] font-mono-data uppercase tracking-wider text-[#8F99B8]">Verified Projects</div>
                <div className="font-display text-xl font-bold text-[#F4F6FF]">
                  {verifiedProjectsCount || 3} <span className="text-xs font-normal text-[#8F99B8]">case studies</span>
                </div>
                <p className="text-[11px] text-[#BAC2DC] mt-0.5">100% faculty/industry vetted</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 2. STICKY SECTION NAV */}
      {/* ================================================================ */}
      <div className="sticky top-16 z-30 py-3 bg-[#1A2040]/90 backdrop-blur-md border-b border-[rgba(255,255,255,0.08)] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2">
            {navItems.map(item => {
              const isActive = activeNav === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setActiveNav(item.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono-data font-medium transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#8B7CFF] text-white shadow-md shadow-[#8B7CFF]/20 font-semibold' 
                      : 'bg-[#222A52] text-[#8F99B8] hover:text-[#F4F6FF] hover:bg-[#2B3563]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs font-mono-data text-[#8F99B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
              Cryptographic Proof ID: {verificationId.slice(0, 16)}...
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
            <h2 className="font-display text-2xl font-bold text-[#F4F6FF]">
              Featured Projects
            </h2>
            <p className="text-xs text-[#8F99B8] mt-0.5">
              Production systems, ML kernels, and verified engineering case studies.
            </p>
          </div>
          <span className="text-xs font-mono-data text-[#8B7CFF] font-medium">
            3 verified case studies
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => setActiveCaseStudy(project)}
              className="rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.10)] overflow-hidden hover:border-[#8B7CFF]/50 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Cover Image & Badges */}
                <div className="h-44 w-full relative overflow-hidden bg-[#1A2040]">
                  {project.coverImage && (
                    <img 
                      src={project.coverImage} 
                      alt={project.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#222A52] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-[#1A2040]/90 backdrop-blur-sm border border-[#4ADE80]/40 text-[#4ADE80] text-[10px] font-mono-data font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#1A2040]/90 backdrop-blur-sm border border-[rgba(255,255,255,0.15)] text-[#FFC773] text-[10px] font-mono-data">
                      {project.similarityMatch}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                  <h3 className="font-display text-base font-bold text-[#F4F6FF] group-hover:text-[#8B7CFF] transition-colors line-clamp-1">
                    {project.title}
                  </h3>

                  <p className="text-xs text-[#BAC2DC] font-medium leading-relaxed line-clamp-2">
                    {project.oneLineOutcome}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono-data px-2 py-0.5 rounded-md bg-[#1A2040] text-[#8F99B8] border border-[rgba(255,255,255,0.04)]">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Verifier Info */}
              <div className="px-6 py-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[#1A2040]/30 flex items-center justify-between text-xs font-mono-data">
                <span className="text-[#8F99B8] truncate max-w-[180px]">
                  Vetted by {project.verifier}
                </span>
                <span className="text-[#8B7CFF] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
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
            <h2 className="font-display text-2xl font-bold text-[#F4F6FF]">
              Skills with Verified Proof
            </h2>
            <p className="text-xs text-[#8F99B8] mt-0.5">
              Every skill confidence score is mathematically grounded in verified repositories and academic reviews.
            </p>
          </div>
          <span className="text-xs font-mono-data text-[#8F99B8]">
            Click any skill to inspect evidence chain
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Mini Radar Chart */}
          <div className="p-6 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-sm font-bold text-[#F4F6FF]">
                  Domain Balance
                </h3>
                <span className="text-[10px] font-mono-data text-[#4ADE80] bg-[#4ADE80]/10 px-2 py-0.5 rounded">
                  Full Stack ML
                </span>
              </div>

              {/* SVG Radar */}
              <div className="relative w-full h-52 flex items-center justify-center">
                <svg viewBox="0 0 200 200" className="w-full h-full max-w-[200px]">
                  {/* Concentric polygons */}
                  <polygon points="100,20 176,64 176,136 100,180 24,136 24,64" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <polygon points="100,45 152,75 152,125 100,155 48,125 48,75" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  <polygon points="100,70 128,86 128,114 100,130 72,114 72,86" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  
                  {/* Radar shape for Alex */}
                  <polygon 
                    points="100,28 165,70 148,128 100,165 38,120 32,70" 
                    fill="rgba(139, 124, 255, 0.25)" 
                    stroke="#8B7CFF" 
                    strokeWidth="2" 
                  />
                  {/* Axis dots */}
                  <circle cx="100" cy="28" r="3.5" fill="#8B7CFF" />
                  <circle cx="165" cy="70" r="3.5" fill="#8B7CFF" />
                  <circle cx="148" cy="128" r="3.5" fill="#8B7CFF" />
                  <circle cx="100" cy="165" r="3.5" fill="#8B7CFF" />
                  <circle cx="38" cy="120" r="3.5" fill="#8B7CFF" />
                  <circle cx="32" cy="70" r="3.5" fill="#8B7CFF" />
                </svg>

                {/* Radar Labels */}
                <span className="absolute top-1 text-[9px] font-mono-data text-[#8F99B8]">Deep Learning</span>
                <span className="absolute right-0 top-1/4 text-[9px] font-mono-data text-[#8F99B8]">Systems</span>
                <span className="absolute right-1 bottom-1/4 text-[9px] font-mono-data text-[#8F99B8]">Backend</span>
                <span className="absolute bottom-1 text-[9px] font-mono-data text-[#8F99B8]">Architecture</span>
                <span className="absolute left-1 bottom-1/4 text-[9px] font-mono-data text-[#8F99B8]">Frontend</span>
                <span className="absolute left-0 top-1/4 text-[9px] font-mono-data text-[#8F99B8]">Algorithms</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-1 text-xs">
              <div className="flex justify-between text-[#8F99B8] font-mono-data text-[11px]">
                <span>Highest Area:</span>
                <span className="text-[#FFC773] font-semibold">Deep Learning (94%)</span>
              </div>
              <div className="flex justify-between text-[#8F99B8] font-mono-data text-[11px]">
                <span>Growth Dimension:</span>
                <span className="text-[#38BDF8]">Distributed Consensus (72%)</span>
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
                  className="p-4 rounded-xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF]/50 hover:bg-[#2B3563] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-sm font-bold text-[#F4F6FF]">
                        {skill.canonicalName}
                      </span>
                      <ScoreRing score={skill.confidence} size={38} strokeWidth={3.5} color="#8B7CFF" />
                    </div>

                    <div className="flex items-center justify-between">
                      <LevelMeter level={skill.level} />
                      <span className="text-[10px] font-mono-data text-[#8F99B8]">
                        {proofs.length} proof{proofs.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Proof title chips */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proofs.slice(0, 2).map(p => {
                        const style = getTypeStyle(p.type);
                        return (
                          <span 
                            key={p.id}
                            className="text-[9px] font-mono-data px-1.5 py-0.5 rounded truncate max-w-[150px]"
                            style={{ backgroundColor: `${style.color}15`, color: style.color }}
                          >
                            {p.title}
                          </span>
                        );
                      })}
                      {proofs.length > 2 && (
                        <span className="text-[9px] font-mono-data text-[#8F99B8] px-1 py-0.5">
                          +{proofs.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 mt-2 border-t border-[rgba(255,255,255,0.05)] text-[10px] font-mono-data text-[#8B7CFF] flex items-center justify-between">
                    <span>Inspect breakdown</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 5. EXPERIENCE & EVIDENCE TIMELINE */}
      {/* ================================================================ */}
      <section id="experience" className="space-y-6 scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#F4F6FF]">
              Evidence Timeline
            </h2>
            <p className="text-xs text-[#8F99B8] mt-0.5">
              Chronological log of shipped projects, research internships, and validated hackathons.
            </p>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {['all', 'project', 'internship', 'hackathon', 'competition'].map(f => (
              <button
                key={f}
                onClick={() => setTimelineFilter(f)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono-data capitalize transition-colors ${
                  timelineFilter === f 
                    ? 'bg-[#8B7CFF] text-white font-semibold' 
                    : 'bg-[#222A52] text-[#8F99B8] hover:text-[#F4F6FF]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Stack */}
        <div className="relative pl-6 sm:pl-8 border-l border-[rgba(255,255,255,0.12)] space-y-6">
          {filteredTimeline.map((item) => {
            const style = getTypeStyle(item.type);
            const Icon = style.icon;
            return (
              <div key={item.id} className="relative group">
                {/* Timeline node */}
                <div 
                  className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-5 h-5 rounded-full border-2 border-[#1A2040] flex items-center justify-center shadow"
                  style={{ backgroundColor: style.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                {/* Card */}
                <div className="p-5 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF]/40 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2.5 py-0.5 rounded-full text-[10px] font-mono-data font-bold uppercase tracking-wider flex items-center gap-1"
                        style={{ backgroundColor: `${style.color}18`, color: style.color, border: `1px solid ${style.color}35` }}
                      >
                        <Icon className="w-3 h-3" />
                        {item.type}
                      </span>
                      <span className="text-xs font-mono-data text-[#8F99B8]">
                        {item.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {item.verificationStatus === 'verified' && (
                        <span className="px-2 py-0.5 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/30 text-[#4ADE80] text-[10px] font-mono-data flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Faculty Verified
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-bold text-[#F4F6FF]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#BAC2DC] mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Skills tags & artifact button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                    <div className="flex flex-wrap gap-1.5">
                      {item.skillsTagged.map(st => (
                        <span key={st} className="text-[10px] font-mono-data px-2 py-0.5 rounded bg-[#1A2040] text-[#8F99B8]">
                          {st}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setSelectedArtifact(item)}
                      className="text-xs font-mono-data text-[#8B7CFF] hover:text-[#A79BFF] flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <span>View verified artifact</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6. CREDENTIALS & AWARDS (Full Grid, Not Accordion) */}
      {/* ================================================================ */}
      <section id="credentials" className="space-y-6 scroll-mt-32">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#F4F6FF]">
              Credentials & Verified Awards
            </h2>
            <p className="text-xs text-[#8F99B8] mt-0.5">
              Academic honors, professional certifications, and competition trophies.
            </p>
          </div>
          <span className="text-xs font-mono-data text-[#8F99B8]">
            {credentialsList.length} items on record
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {credentialsList.map(c => {
            const isCert = c.type === 'Certificate';
            const hash = `0x7b...${c.id.slice(-4)}`;
            return (
              <div 
                key={c.id}
                className="p-5 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF]/50 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`p-2 rounded-xl ${isCert ? 'bg-[#38BDF8]/15 text-[#38BDF8]' : 'bg-[#FFC773]/15 text-[#FFC773]'}`}>
                      {isCert ? <FileCheck className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                    </span>
                    <span className="text-[10px] font-mono-data text-[#8F99B8]">
                      {c.date}
                    </span>
                  </div>

                  <h3 className="font-display text-sm font-bold text-[#F4F6FF] line-clamp-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-[#BAC2DC] line-clamp-2">
                    {c.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] space-y-1.5 text-xs font-mono-data">
                  <div className="flex items-center justify-between text-[#8F99B8] text-[10px]">
                    <span>Verification Hash:</span>
                    <span className="text-[#F4F6FF]">{hash}</span>
                  </div>

                  <a 
                    href={c.url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#8B7CFF] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <span>Verify registry entry</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* 7. VERIFICATION METHOD & INSTITUTIONAL TRUST */}
      {/* ================================================================ */}
      <section id="verify" className="p-8 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.10)] space-y-6 scroll-mt-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-[#F4F6FF] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
              Proofly Verification Protocol
            </h2>
            <p className="text-xs text-[#8F99B8] mt-1 max-w-xl">
              Every credential is verified across a 4-tier cryptographic and faculty chain to guarantee authenticity and combat artificial inflation.
            </p>
          </div>

          <button
            onClick={() => setVerificationMethodDrawerOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#1A2040] hover:bg-[#2B3563] text-xs font-mono-data text-[#8B7CFF] border border-[#8B7CFF]/30 transition-colors shrink-0"
          >
            Read Protocol Specs
          </button>
        </div>

        {/* 4 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
            <div className="text-xs font-bold text-[#F4F6FF] font-mono-data">1. Faculty Sign-Off</div>
            <p className="text-[11px] text-[#8F99B8]">Direct committee approval on Capstones, course grades, and lab fellowships.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
            <div className="text-xs font-bold text-[#F4F6FF] font-mono-data">2. Git AST Inspection</div>
            <p className="text-[11px] text-[#8F99B8]">Commit histories and code similarity analysis against 40M public repos.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
            <div className="text-xs font-bold text-[#F4F6FF] font-mono-data">3. Mentor Endorsement</div>
            <p className="text-[11px] text-[#8F99B8]">Cryptographically signed internship outcomes from verified company domains.</p>
          </div>
          <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
            <div className="text-xs font-bold text-[#F4F6FF] font-mono-data">4. Immutable Audit Log</div>
            <p className="text-[11px] text-[#8F99B8]">Zero-knowledge timestamped record accessible to recruiting partners.</p>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 8. FOOTER: GET IN TOUCH & QR CODE */}
      {/* ================================================================ */}
      <footer className="p-8 sm:p-10 rounded-[24px] bg-gradient-to-r from-[#222A52] via-[#2A3462] to-[#222A52] border border-[rgba(255,255,255,0.12)] space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold text-[#F4F6FF]">
              Interested in hiring Alex?
            </h3>
            <p className="text-xs sm:text-sm text-[#BAC2DC] max-w-lg">
              Seeking Machine Learning Engineering or Systems Engineering roles starting Fall 2026. Available for select research collaborations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#8B7CFF] hover:bg-[#7b6be8] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>Get in touch</span>
            </button>

            <button
              onClick={() => setQrModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#1A2040] hover:bg-[#2B3563] text-[#F4F6FF] border border-[rgba(255,255,255,0.10)] text-xs font-mono-data transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4 text-[#8B7CFF]" />
              <span>Mobile QR</span>
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-data text-[#8F99B8]">
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#F4F6FF] flex items-center gap-1.5 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>github.com/alexrivera</span>
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-[#F4F6FF] flex items-center gap-1.5 transition-colors"
            >
              <Linkedin className="w-3.5 h-3.5" />
              <span>linkedin.com/in/alexrivera</span>
            </a>
          </div>

          <span>Verified on Proofly • Institutional Ledger ID: {verificationId}</span>
        </div>
      </footer>

      {/* ================================================================ */}
      {/* CASE STUDY MODAL / DRAWER */}
      {/* ================================================================ */}
      {activeCaseStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-[#222A52] border border-[rgba(255,255,255,0.15)] rounded-[24px] shadow-2xl flex flex-col overflow-hidden text-left">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono-data uppercase tracking-wider text-[#8B7CFF] font-bold">
                  Verified Case Study
                </span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F6FF] mt-1">
                  {activeCaseStudy.title}
                </h2>
                <p className="text-xs text-[#BAC2DC] mt-1">
                  {activeCaseStudy.role}
                </p>
              </div>

              <button
                onClick={() => setActiveCaseStudy(null)}
                className="p-2 rounded-xl bg-[#1A2040] hover:bg-[#2B3563] text-[#8F99B8] hover:text-[#F4F6FF] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Metrics Highlights */}
              <div className="grid grid-cols-3 gap-3">
                {activeCaseStudy.metrics.map((m, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-[#1A2040]/80 border border-[rgba(255,255,255,0.06)] text-center">
                    <div className="text-[10px] font-mono-data text-[#8F99B8] uppercase">{m.label}</div>
                    <div className="font-display text-lg font-bold text-[#FFC773] mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Problem */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono-data font-bold uppercase tracking-wider text-[#8B7CFF]">
                  The Problem
                </h4>
                <p className="text-sm text-[#BAC2DC] leading-relaxed">
                  {activeCaseStudy.problem}
                </p>
              </div>

              {/* Approach */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono-data font-bold uppercase tracking-wider text-[#8B7CFF]">
                  Technical Approach
                </h4>
                <p className="text-sm text-[#BAC2DC] leading-relaxed">
                  {activeCaseStudy.approach}
                </p>
              </div>

              {/* Result */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono-data font-bold uppercase tracking-wider text-[#4ADE80]">
                  Measured Outcome
                </h4>
                <p className="text-sm text-[#BAC2DC] leading-relaxed">
                  {activeCaseStudy.result}
                </p>
              </div>

              {/* Verifier Endorsement */}
              <div className="p-4 rounded-xl bg-[#1A2040]/60 border border-[rgba(255,255,255,0.08)] flex items-start gap-4">
                <img 
                  src={activeCaseStudy.verifierAvatar} 
                  alt={activeCaseStudy.verifier} 
                  className="w-12 h-12 rounded-full object-cover shrink-0 ring-1 ring-[#4ADE80]"
                />
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F4F6FF]">{activeCaseStudy.verifier}</span>
                    <span className="text-[10px] text-[#4ADE80] font-mono-data">Verified {activeCaseStudy.verifiedDate}</span>
                  </div>
                  <div className="text-[11px] text-[#8F99B8] font-mono-data">{activeCaseStudy.verifierTitle}</div>
                  <p className="text-xs italic text-[#BAC2DC] pt-1">
                    "{activeCaseStudy.verifierQuote}"
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#1A2040]/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeCaseStudy.githubUrl && (
                  <a 
                    href={activeCaseStudy.githubUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-xs font-mono-data text-[#F4F6FF] hover:text-[#8B7CFF] flex items-center gap-1.5 transition-colors"
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
                    className="text-xs font-mono-data text-[#8B7CFF] hover:underline flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setActiveCaseStudy(null)}
                className="px-4 py-2 rounded-xl bg-[#2B3563] text-xs font-medium text-white hover:bg-[#344079]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SKILL DETAIL DRAWER */}
      {/* ================================================================ */}
      {selectedDrawerSkill && drawerBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md h-full bg-[#222A52] border-l border-[rgba(255,255,255,0.12)] p-6 flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
                <div>
                  <span className="text-[10px] font-mono-data text-[#8B7CFF] uppercase font-bold">
                    Skill Evidence Inspection
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#F4F6FF]">
                    {selectedDrawerSkill.canonicalName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDrawerSkill(null)}
                  className="p-1.5 rounded-lg bg-[#1A2040] text-[#8F99B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Confidence ring */}
              <div className="p-4 rounded-xl bg-[#1A2040]/70 flex items-center gap-4">
                <ScoreRing score={selectedDrawerSkill.confidence} size={60} strokeWidth={5} color="#8B7CFF" />
                <div>
                  <div className="text-xs font-mono-data text-[#8F99B8]">Confidence Score</div>
                  <div className="font-display text-2xl font-bold text-[#8B7CFF]">
                    {selectedDrawerSkill.confidence} / 100
                  </div>
                  <div className="text-xs text-[#4ADE80] font-mono-data font-semibold">
                    {drawerBreakdown.level} Level
                  </div>
                </div>
              </div>

              {/* Formula Breakdown Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono-data uppercase tracking-wider text-[#8F99B8]">
                  Formula Breakdown
                </h4>
                <div className="rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden text-xs">
                  <div className="flex justify-between p-2.5 bg-[#1A2040]/80 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-[#BAC2DC]">Total Raw Point Accumulation</span>
                    <span className="font-mono-data text-[#F4F6FF]">+{drawerBreakdown.totalRawPoints} pts</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#1A2040]/40 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-[#BAC2DC]">Verified Proof Contributions</span>
                    <span className="font-mono-data text-[#4ADE80]">{drawerBreakdown.items.length} artifacts</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#1A2040]/80 border-b border-[rgba(255,255,255,0.05)]">
                    <span className="text-[#BAC2DC]">Calculated Competency Tier</span>
                    <span className="font-mono-data text-[#38BDF8]">{drawerBreakdown.level}</span>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#2B3563] font-bold">
                    <span className="text-[#F4F6FF]">Total Mathematical Score</span>
                    <span className="font-mono-data text-[#FFC773]">{drawerBreakdown.confidence}</span>
                  </div>
                </div>
              </div>

              {/* Evidence Items */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono-data uppercase tracking-wider text-[#8F99B8]">
                  Supporting Evidence ({drawerSkillEvidences.length})
                </h4>
                <div className="space-y-2">
                  {drawerSkillEvidences.map(e => {
                    const style = getTypeStyle(e.type);
                    return (
                      <div key={e.id} className="p-3 rounded-lg bg-[#1A2040]/60 border border-[rgba(255,255,255,0.05)] space-y-1">
                        <div className="flex items-center justify-between">
                          <span 
                            className="text-[10px] font-mono-data font-semibold uppercase px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: `${style.color}20`, color: style.color }}
                          >
                            {e.type}
                          </span>
                          <span className="text-[10px] font-mono-data text-[#8F99B8]">{e.date}</span>
                        </div>
                        <div className="text-xs font-bold text-[#F4F6FF]">{e.title}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDrawerSkill(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#2B3563] text-xs font-semibold text-white hover:bg-[#344079]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* VERIFICATION PROTOCOL DRAWER */}
      {/* ================================================================ */}
      {isVerificationMethodDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg h-full bg-[#222A52] border-l border-[rgba(255,255,255,0.12)] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto text-left shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-[#4ADE80]" />
                  <h3 className="font-display text-xl font-bold text-[#F4F6FF]">
                    Institutional Verification
                  </h3>
                </div>
                <button
                  onClick={() => setVerificationMethodDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-[#1A2040] text-[#8F99B8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-[#BAC2DC] leading-relaxed">
                Proofly eliminates resume fraud and self-inflated skill ratings through an evidence-based attestation graph. Here is how Alex Rivera's profile was confirmed:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F4F6FF]">
                    <span>1. Capstone & Coursework</span>
                    <span className="text-[#4ADE80] font-mono-data text-[11px]">Approved</span>
                  </div>
                  <p className="text-xs text-[#8F99B8]">
                    Verified by Prof. Alan Vance (Faculty Advisor, Stanford CS Dept) on May 20, 2026. Grade and artifact signature recorded.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F4F6FF]">
                    <span>2. Industry Internship</span>
                    <span className="text-[#4ADE80] font-mono-data text-[11px]">Signed</span>
                  </div>
                  <p className="text-xs text-[#8F99B8]">
                    Dr. Michael Chen (Cerebras Systems) confirmed system benchmarks and 34% p99 latency reduction.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.06)] space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F4F6FF]">
                    <span>3. HackMIT Grand Jury</span>
                    <span className="text-[#4ADE80] font-mono-data text-[11px]">1st / 240</span>
                  </div>
                  <p className="text-xs text-[#8F99B8]">
                    Dr. Sarah Jenkins and MIT Media Lab evaluated code authenticity and live demo on Nov 25, 2025.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setVerificationMethodDrawerOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#8B7CFF] text-xs font-semibold text-white hover:bg-[#7b6be8]"
            >
              Close Verification Specs
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* CONTACT MODAL */}
      {/* ================================================================ */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[#222A52] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 text-left shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-bold text-[#F4F6FF]">
                Contact {currentUser.name}
              </h3>
              <button
                onClick={() => setContactModalOpen(false)}
                className="p-1 rounded-lg text-[#8F99B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#BAC2DC]">
              Recruiters and research labs can reach Alex directly at his verified Stanford university address:
            </p>

            <div className="p-3.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
              <span className="font-mono-data text-xs text-[#F4F6FF]">alex.rivera@stanford.edu</span>
              <button
                onClick={() => {
                  navigator.clipboard?.writeText?.('alex.rivera@stanford.edu');
                  alert('Email copied to clipboard!');
                }}
                className="text-xs font-mono-data text-[#8B7CFF] hover:underline"
              >
                Copy
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono-data text-[#8F99B8]">Send a direct message</label>
              <textarea 
                rows={3} 
                placeholder="Hi Alex, we came across your SynapseNet capstone on Proofly and would like to chat about an ML Engineering role..."
                className="w-full p-3 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.08)] text-xs text-[#F4F6FF] placeholder:text-[#8F99B8] focus:outline-none focus:border-[#8B7CFF]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setContactModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#1A2040] text-xs font-medium text-[#8F99B8] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Message dispatched to candidate portal!');
                  setContactModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#8B7CFF] text-xs font-semibold text-white hover:bg-[#7b6be8]"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* QR CODE MODAL */}
      {/* ================================================================ */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#222A52] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[#F4F6FF]">
                Recruiter Quick Scan
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 rounded-lg text-[#8F99B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-xl inline-block mx-auto shadow-inner">
              <div className="w-40 h-40 bg-white grid grid-cols-6 grid-rows-6 gap-1 p-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`rounded-xs ${[0, 1, 4, 5, 6, 11, 18, 23, 24, 29, 30, 31, 34, 35, 14, 21].includes(i) ? 'bg-black' : 'bg-black/15'}`} 
                  />
                ))}
              </div>
            </div>

            <p className="text-xs text-[#BAC2DC]">
              Scan to view Alex Rivera's verified mobile portfolio and cryptographic skill attestations.
            </p>

            <button
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2 rounded-xl bg-[#1A2040] text-xs font-mono-data text-[#8B7CFF] hover:bg-[#2B3563]"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ARTIFACT PREVIEW MODAL */}
      {/* ================================================================ */}
      {selectedArtifact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[#222A52] border border-[rgba(255,255,255,0.12)] rounded-2xl p-6 text-left shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#4ADE80]" />
                <h3 className="font-display text-base font-bold text-[#F4F6FF]">
                  Verified Artifact Record
                </h3>
              </div>
              <button
                onClick={() => setSelectedArtifact(null)}
                className="p-1 rounded-lg text-[#8F99B8] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs text-[#8F99B8] font-mono-data">Item Title:</div>
              <div className="font-display text-sm font-bold text-[#F4F6FF]">{selectedArtifact.title}</div>
              <p className="text-xs text-[#BAC2DC]">{selectedArtifact.description}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#1A2040] space-y-1.5 text-xs font-mono-data text-[#8F99B8]">
              <div className="flex justify-between">
                <span>Verification State:</span>
                <span className="text-[#4ADE80] font-bold uppercase">{selectedArtifact.verificationStatus}</span>
              </div>
              <div className="flex justify-between">
                <span>Logged Date:</span>
                <span className="text-[#F4F6FF]">{selectedArtifact.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Evidence Type:</span>
                <span className="text-[#8B7CFF] font-bold">{selectedArtifact.type}</span>
              </div>
              {selectedArtifact.url && (
                <div className="flex justify-between pt-1">
                  <span>External URI:</span>
                  <a href={selectedArtifact.url} target="_blank" rel="noreferrer" className="text-[#8B7CFF] underline truncate max-w-[200px]">
                    {selectedArtifact.url}
                  </a>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedArtifact(null)}
              className="w-full py-2.5 rounded-xl bg-[#2B3563] text-xs font-semibold text-white hover:bg-[#344079]"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
