import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  GitCommit, 
  BrainCircuit, 
  Award, 
  Briefcase, 
  Search, 
  FileCheck, 
  Users, 
  GraduationCap, 
  Building2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Layers,
  Flame,
  Check,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { ScoreRing, getTypeStyle } from '../common/EvidenceEncoding';

interface WebsiteOverviewProps {
  onNavigate?: (tab: string) => void;
}

export const WebsiteOverview: React.FC<WebsiteOverviewProps> = ({ onNavigate }) => {
  const { setActiveTab } = useApp();
  const [activeStep, setActiveStep] = useState(0);

  const handleNav = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
    setActiveTab(tab);
  };

  const chainSteps = [
    {
      step: '01',
      icon: GitCommit,
      title: 'GitHub Commit & Artifact',
      desc: 'Student ships a PyTorch sparse attention kernel with benchmarks.',
      badge: 'Raw Evidence',
      badgeColor: '#8B7CFF',
      delta: '+3 Repos Logged'
    },
    {
      step: '02',
      icon: Cpu,
      title: 'AST & Originality Scan',
      desc: 'Proofly parses commit histories and runs similarity checks vs 40M repos.',
      badge: '9% Overlap',
      badgeColor: '#4ADE80',
      delta: 'Novelty Confirmed'
    },
    {
      step: '03',
      icon: GraduationCap,
      title: 'Faculty Sign-off',
      desc: 'Prof. Alan Vance inspects code benchmarks and digitally validates.',
      badge: 'Faculty Verified',
      badgeColor: '#2DD4BF',
      delta: 'Attestation Signed'
    },
    {
      step: '04',
      icon: BrainCircuit,
      title: 'Confidence Recalibration',
      desc: 'Deep Learning skill increases from 68 -> 82 based on proof weight.',
      badge: '+14 Pts Confidence',
      badgeColor: '#FFC773',
      delta: 'Top 5% Cohort'
    },
    {
      step: '05',
      icon: Briefcase,
      title: 'Opportunity Match',
      desc: 'Cerebras Systems ML Compiler internship reaches 94% compatibility.',
      badge: 'Direct Recruiter Intro',
      badgeColor: '#38BDF8',
      delta: 'Interview Scheduled'
    }
  ];

  const features = [
    {
      title: 'Evidence Engine',
      category: 'Glance & Scan',
      desc: 'Replace resume bullet claims with git commits, lab notebooks, competition trophies, and faculty attestations.',
      color: '#8B7CFF',
      highlight: '14+ Artifact Types'
    },
    {
      title: 'Skill Evidence Explorer',
      category: 'Mathematical Rigor',
      desc: 'Every skill confidence score is calculated from proof count, faculty validation, diversity of types, and recency.',
      color: '#2DD4BF',
      highlight: 'Zero Self-Reporting Bias'
    },
    {
      title: 'Smart Opportunity Matching',
      category: 'Semantic & Structural',
      desc: 'Match roles based on skills you have verified vs missing gap chips. Get precise action plans for the next 14 days.',
      color: '#FFC773',
      highlight: 'Personalized Gap Analysis'
    },
    {
      title: 'Project Idea Checker',
      category: 'Originality Protection',
      desc: 'Test your capstone or thesis concept against 140+ institutional repositories to ensure maximum originality.',
      color: '#38BDF8',
      highlight: '4-Dimension Semantic Scan'
    },
    {
      title: 'Shareable Portfolio',
      category: 'Recruiter-Ready',
      desc: 'Turn internal evidence into an award-winning personal dossier with case studies, verified seals, and QR access.',
      color: '#FB923C',
      highlight: 'Framer-Quality Showcase'
    },
    {
      title: 'Placement Analytics',
      category: 'Institutional Intelligence',
      desc: 'Placement cells track real student skill supply against market hiring demand, identifying curriculum gaps instantly.',
      color: '#F472B6',
      highlight: 'Real-Time Cohort Metrics'
    }
  ];

  const personas = [
    {
      role: 'For Students',
      icon: GraduationCap,
      color: '#8B7CFF',
      headline: 'Turn your real work into an unfair hiring advantage.',
      bullets: [
        'Stop writing unverified bullet points on PDF resumes.',
        'Get mathematical credit for hackathons, open source, and capstones.',
        'Discover exact skill gaps before applying to dream companies.',
        'Send recruiters a verified portfolio with one-click case studies.'
      ],
      cta: 'Explore Student Dashboard',
      target: 'dashboard'
    },
    {
      role: 'For Faculty & Mentors',
      icon: ShieldCheck,
      color: '#2DD4BF',
      headline: 'Verify student excellence with cryptographic certainty.',
      bullets: [
        'Review capstones and lab deliverables in one unified inbox.',
        'One-click sign-off generates immutable student credentials.',
        'Flag plagiarism or unoriginal project submissions automatically.',
        'Elevate departmental placement statistics with verified talent.'
      ],
      cta: 'Open Faculty Portal',
      target: 'faculty'
    },
    {
      role: 'For Recruiters & Placement',
      icon: Building2,
      color: '#FFC773',
      headline: 'Hire talent with proof, not rehearsed interviews.',
      bullets: [
        'Filter candidates by verified repo contributions and code ASTs.',
        'See exactly which faculty member vouched for each skill.',
        'Compare student skill supply with active market demand.',
        'Eliminate resume screening false positives by up to 80%.'
      ],
      cta: 'View Placement Intelligence',
      target: 'placement'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left">
      
      {/* ================================================================ */}
      {/* OVERVIEW STICKY TOP NAVIGATION BAR */}
      {/* ================================================================ */}
      <header className="sticky top-4 z-40 w-full rounded-2xl bg-[#1A2040]/95 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-xl p-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-[#8B7CFF] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight text-[#F4F6FF]">
              PROOFLY
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-[#8B7CFF]/20 text-[#8B7CFF] text-[10px] font-mono-data font-semibold">
              Platform Preview
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleNav('profile')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52] transition-colors cursor-pointer"
          >
            <span>Live Portfolio</span>
          </button>
          <button
            onClick={() => handleNav('opportunities')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-[#BAC2DC] hover:text-[#F4F6FF] hover:bg-[#222A52] transition-colors cursor-pointer"
          >
            <span>Opportunities</span>
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#8B7CFF]/25 hover:opacity-95 transition-all cursor-pointer hover:scale-[1.02]"
            title="Go to main dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>
      </header>

      {/* ================================================================ */}
      {/* SECTION 1: FULL-SCREEN AURORA HERO */}
      {/* ================================================================ */}
      <section className="relative rounded-[32px] p-8 sm:p-14 lg:p-16 bg-gradient-to-br from-[#1E264D] via-[#242E5E] to-[#1A2040] border border-[rgba(255,255,255,0.14)] shadow-2xl overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#8B7CFF]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#2DD4BF]/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8B7CFF]/20 border border-[#8B7CFF]/30 text-[#8B7CFF] text-xs font-mono-data font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Professional Intelligence Platform</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-[#F4F6FF] tracking-tight leading-[1.1]">
              Your skills, <span className="font-serif italic font-normal text-[#FFC773]">proven</span>.<br />
              Proof, not claims.
            </h1>

            <p className="text-sm sm:text-base text-[#BAC2DC] max-w-xl leading-relaxed">
              College students turn real projects, hackathons, and research into an evidence-based professional dossier. AI finds similar work, matches top opportunities, and explains skill gaps mathematically.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleNav('dashboard')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#7B6BE8] hover:from-[#7B6BE8] hover:to-[#6A5AD7] text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#8B7CFF]/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Explore Student Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleNav('profile')}
                className="px-5 py-3.5 rounded-xl bg-[#222A52] hover:bg-[#2B3563] text-[#F4F6FF] border border-[rgba(255,255,255,0.14)] text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-[#8B7CFF]" />
                <span>View Public Portfolio</span>
              </button>
            </div>

            {/* Real-time verified proofs counter */}
            <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-wrap items-center gap-6 text-xs font-mono-data text-[#8F99B8]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
                <span className="text-[#F4F6FF] font-bold">1,842</span>
                <span>Verified Proofs</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8B7CFF]" />
                <span className="text-[#F4F6FF] font-bold">28</span>
                <span>Partner Universities</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#FFC773]" />
                <span className="text-[#F4F6FF] font-bold">94%</span>
                <span>Placement Lift</span>
              </div>
            </div>
          </div>

          {/* Floating Product Mock UI */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 rounded-2xl bg-[#1A2040]/90 backdrop-blur-md border border-[rgba(255,255,255,0.12)] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#FB7185]" />
                  <div className="w-3 h-3 rounded-full bg-[#FFC773]" />
                  <div className="w-3 h-3 rounded-full bg-[#4ADE80]" />
                </div>
                <span className="text-[10px] font-mono-data text-[#8F99B8]">proofly.app/alexrivera</span>
              </div>

              {/* Mini Candidate Summary */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8B7CFF] to-[#2DD4BF] p-0.5">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                    alt="Alex" 
                    className="w-full h-full rounded-[10px] object-cover"
                  />
                </div>
                <div>
                  <div className="font-display text-sm font-bold text-[#F4F6FF]">Alex Rivera</div>
                  <div className="text-[11px] text-[#BAC2DC]">Stanford CS '26 · ML Systems</div>
                </div>
                <div className="ml-auto">
                  <ScoreRing score={86} size={42} strokeWidth={4} color="#FFC773" />
                </div>
              </div>

              {/* Sample Verified Evidence Row */}
              <div className="p-3 rounded-xl bg-[#222A52] border border-[rgba(255,255,255,0.06)] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-data text-[#8B7CFF] font-bold">PROJECT CASE STUDY</span>
                  <span className="text-[10px] font-mono-data text-[#4ADE80]">Faculty Signed</span>
                </div>
                <div className="font-bold text-[#F4F6FF]">SynapseNet: Sparse Attention Kernel</div>
                <div className="text-[11px] text-[#8F99B8]">2.8x speedup on 4K sequences with fused CUDA kernels.</div>
              </div>

              {/* Skill chips preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-[#8B7CFF]/20 text-[#8B7CFF] text-[10px] font-mono-data font-bold">PyTorch 94/100</span>
                <span className="px-2 py-0.5 rounded bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-mono-data font-bold">CUDA 82/100</span>
                <span className="px-2 py-0.5 rounded bg-[#FFC773]/20 text-[#FFC773] text-[10px] font-mono-data font-bold">Docker 78/100</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 2: ANIMATED EVIDENCE CHAIN (How it Works) */}
      {/* ================================================================ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#8B7CFF] uppercase font-bold tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>The Evidence Pipeline</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[#F4F6FF]">
            From Raw Code to Verified Recruiter Shortlist
          </h2>
          <p className="text-xs sm:text-sm text-[#BAC2DC]">
            Proofly connects raw engineering outputs to real-world employment opportunities through a continuous 5-step verification lifecycle.
          </p>
        </div>

        {/* Step Cards with connector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 relative">
          {chainSteps.map((s, idx) => {
            const Icon = s.icon;
            const isHovered = activeStep === idx;
            return (
              <div 
                key={s.step}
                onMouseEnter={() => setActiveStep(idx)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  isHovered 
                    ? 'bg-[#2B3563] border-[#8B7CFF] shadow-xl translate-y-[-2px]' 
                    : 'bg-[#222A52] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-data text-[#8F99B8] font-bold">
                      STEP {s.step}
                    </span>
                    <span 
                      className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${s.badgeColor}20`, color: s.badgeColor }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#1A2040] w-fit" style={{ color: s.badgeColor }}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-display text-sm font-bold text-[#F4F6FF]">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#BAC2DC] mt-1 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] text-[11px] font-mono-data font-semibold text-[#FFC773]">
                  {s.delta}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 3: FEATURE BENTO (6 Rich Cards) */}
      {/* ================================================================ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#2DD4BF] uppercase font-bold tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Core Architecture</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[#F4F6FF]">
            Engineered for Ground Truth
          </h2>
          <p className="text-xs sm:text-sm text-[#BAC2DC]">
            Six integrated systems powering verifiable student careers and data-driven university placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i}
              className="p-6 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] hover:border-[#8B7CFF]/50 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-data text-[#8F99B8] uppercase">
                    {f.category}
                  </span>
                  <span 
                    className="text-[10px] font-mono-data font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${f.color}18`, color: f.color }}
                  >
                    {f.highlight}
                  </span>
                </div>

                <h3 className="font-display text-base font-bold text-[#F4F6FF]">
                  {f.title}
                </h3>

                <p className="text-xs text-[#BAC2DC] leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-[rgba(255,255,255,0.05)] text-xs font-mono-data text-[#8B7CFF] flex items-center justify-between">
                <span>View implementation</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ */}
      {/* SECTION 4: "WHO IT IS FOR" (3 Distinct Persona Cards) */}
      {/* ================================================================ */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono-data text-[#FFC773] uppercase font-bold tracking-wider">
            <Users className="w-4 h-4" />
            <span>Target Ecosystem</span>
          </div>
          <h2 className="font-display text-3xl font-bold text-[#F4F6FF]">
            Built for the Entire Collegiate Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-[#BAC2DC]">
            Dedicated workspaces tailored specifically for students, professors, and corporate recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-[24px] bg-[#222A52] border border-[rgba(255,255,255,0.10)] hover:border-[#8B7CFF]/50 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-[#1A2040] w-fit" style={{ color: p.color }}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs font-mono-data font-bold uppercase tracking-wider" style={{ color: p.color }}>
                      {p.role}
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#F4F6FF] mt-1 leading-snug">
                      {p.headline}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {p.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-[#BAC2DC] flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-[#4ADE80] shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleNav(p.target)}
                  className="w-full py-3 rounded-xl bg-[#1A2040] hover:bg-[#2B3563] text-xs font-mono-data font-semibold text-[#F4F6FF] border border-[rgba(255,255,255,0.08)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#8B7CFF]" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="p-10 rounded-[28px] bg-gradient-to-r from-[#222A52] via-[#2D3768] to-[#222A52] border border-[rgba(255,255,255,0.12)] text-center space-y-6">
        <h2 className="font-display text-3xl font-bold text-[#F4F6FF]">
          Ready to verify your engineering credentials?
        </h2>
        <p className="text-xs sm:text-sm text-[#BAC2DC] max-w-xl mx-auto">
          Join thousands of engineering students from Stanford, MIT, and UC Berkeley who use Proofly to replace resume claims with cryptographic proof.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button
            onClick={() => handleNav('dashboard')}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#2DD4BF] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-[#8B7CFF]/25 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Launch Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('profile')}
            className="px-5 py-3.5 rounded-xl bg-[#1A2040] hover:bg-[#2B3563] text-[#F4F6FF] border border-[rgba(255,255,255,0.14)] text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-[#8B7CFF]" />
            <span>Explore Shareable Portfolio</span>
          </button>
        </div>
      </section>

    </div>
  );
};
