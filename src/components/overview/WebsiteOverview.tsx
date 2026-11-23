import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Award, 
  GraduationCap, 
  Building2, 
  Briefcase, 
  FileCheck, 
  Code2, 
  BrainCircuit, 
  Cpu, 
  TrendingUp, 
  Layers, 
  ChevronRight,
  ExternalLink,
  Users,
  LayoutDashboard,
  QrCode,
  ArrowLeft,
  Key
} from 'lucide-react';
import { ScoreRing } from '../common/EvidenceEncoding';

export interface WebsiteOverviewProps {
  onNavigate?: (tab: string) => void;
}

export const WebsiteOverview: React.FC<WebsiteOverviewProps> = ({ onNavigate }) => {
  const { setActiveTab } = useApp();
  const [activeStep, setActiveStep] = useState(0);

  const handleNav = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      setActiveTab(tab);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const chainSteps = [
    {
      step: '01',
      title: 'Submit Engineering Evidence',
      desc: 'Students attach GitHub repository commits, capstone PDFs, hackathon projects, and internship completion reports.',
      icon: Code2,
      badge: 'Multi-Type Ingestion',
      badgeColor: '#4F46E5',
      delta: '+25 Proof Pts'
    },
    {
      step: '02',
      title: 'AST & Provenance Analysis',
      desc: 'Our engine parses syntax trees, computes cyclomatic complexity, and verifies development trajectory across Git history.',
      icon: BrainCircuit,
      badge: 'AST Cyclomatic Vetting',
      badgeColor: '#059669',
      delta: '100% Originality Graph'
    },
    {
      step: '03',
      title: 'Adaptive Socratic Defense',
      desc: 'Students defend architectural decisions and solve live code challenges under counterfactual constraints.',
      icon: Cpu,
      badge: 'Socratic Defense Engine',
      badgeColor: '#D97706',
      delta: 'Bayesian IRT Competency'
    },
    {
      step: '04',
      title: 'Sovereign Faculty Attestation',
      desc: 'University professors and committee chairs review transcripts, submit rubric scores, and issue digital approvals.',
      icon: ShieldCheck,
      badge: 'Faculty Sovereign Authority',
      badgeColor: '#4F46E5',
      delta: 'Official Institutional Endorsement'
    },
    {
      step: '05',
      title: 'W3C Cryptographic VC',
      desc: 'The finalized portfolio is signed with Ed25519 digital keys and Merkle roots, independently verifiable by recruiters.',
      icon: Key,
      badge: 'W3C Verifiable Credential',
      badgeColor: '#0D9488',
      delta: 'Tamper-Proof Proof'
    }
  ];

  const features = [
    {
      category: 'Originality & Integrity',
      title: 'Institutional Capstone Checker',
      desc: 'Cross-checks project proposals against 140+ completed departmental projects using dense semantic embeddings to prevent duplicate work.',
      highlight: 'pgvector Cosine Search',
      color: '#4F46E5'
    },
    {
      category: 'Psychometric Measurement',
      title: 'Item Response Theory (IRT)',
      desc: 'Samejima Graded Response Model (GRM) estimates student latent competency (\\(\\hat\\theta\\)) with exact Bayesian Fisher standard error.',
      highlight: 'Bayesian MAP Estimation',
      color: '#059669'
    },
    {
      category: 'Interactive Verification',
      title: 'Split-Screen Defense IDE',
      desc: 'Students tackle turn-by-turn counterfactual code modifications with real-time test execution and accessibility accommodations.',
      highlight: 'Artifact-Grounded IDE',
      color: '#D97706'
    },
    {
      category: 'Governance & Auditing',
      title: 'Sovereign Faculty Portal',
      desc: 'Advisors inspect complete Socratic transcripts, review commit trajectories, and apply official committee grades with audit logs.',
      highlight: 'Full Governance Audit',
      color: '#0284C7'
    },
    {
      category: 'Recruiter Matching',
      title: 'Semantic Opportunity Intelligence',
      desc: 'Matches students to research labs and corporate roles based on verified mathematical skill depth rather than keyword claims.',
      highlight: 'Structural Match Fit',
      color: '#0D9488'
    },
    {
      category: 'Cryptographic Security',
      title: 'Ed25519 Merkle Attestation',
      desc: 'Issues W3C-compliant Verifiable Credentials containing SHA-256 Merkle root hashes for trustless public validation.',
      highlight: 'Ed25519 Signatures',
      color: '#7C3AED'
    }
  ];

  const personas = [
    {
      role: 'For Engineering Students',
      headline: 'Turn real engineering projects into an audited professional dossier.',
      bullets: [
        'Stop relying on keyword claims; defend your actual architecture.',
        'Inspect skill confidence scores derived deterministically.',
        'Share public portfolio with recruiters.'
      ],
      cta: 'Explore Student Dashboard',
      target: 'dashboard',
      color: '#4F46E5',
      icon: GraduationCap
    },
    {
      role: 'For Faculty & Advisors',
      headline: 'Sovereign institutional oversight without repetitive manual grading.',
      bullets: [
        'Queue student submissions across coursework and capstones.',
        'Inspect full Socratic dialogue transcripts and code challenge solutions.',
        'Apply sovereign overrides with immutable institutional audit logging.'
      ],
      cta: 'Open Faculty Portal',
      target: 'faculty',
      color: '#059669',
      icon: Building2
    },
    {
      role: 'For Placement Cells & Recruiters',
      headline: 'Discover mathematically proven talent with zero unverified claims.',
      bullets: [
        'Analyze cohort competency distributions and curriculum gaps.',
        'Filter candidates by verified AST depth and IRT competency tiers.',
        'Verify W3C credentials trustlessly with Ed25519 signatures.'
      ],
      cta: 'Explore Placement Intelligence',
      target: 'placement',
      color: '#D97706',
      icon: Briefcase
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-left bg-slate-50 min-h-screen animate-in fade-in duration-200">
      
      {/* OVERVIEW STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-4 z-40 w-full rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm p-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              PROOFLY
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-semibold">
              System Architecture & Protocol Specification
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => handleNav('profile')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
          >
            <span>Live Portfolio</span>
          </button>
          <button
            onClick={() => handleNav('opportunities')}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer font-medium"
          >
            <span>Opportunities</span>
          </button>
          <button
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-semibold shadow-xs hover:bg-indigo-700 transition-all cursor-pointer"
            title="Go to main dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </button>
        </div>
      </header>

      {/* SECTION 1: HERO */}
      <section className="relative rounded-3xl p-8 sm:p-12 lg:p-16 bg-white border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Institutional Verification Protocol & Competency Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
              Proof Over Claim.<br />
              <span className="text-indigo-600">
                Independently Verified.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              Evaluating student competency from submitted projects, technical reports, and code repositories using AST provenance, adaptive Socratic interrogation, and sovereign faculty review.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleNav('dashboard')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Student Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleNav('profile')}
                className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Users className="w-4 h-4 text-indigo-600" />
                <span>View Verified Portfolio</span>
              </button>
            </div>

            {/* Real-time verified proofs counter */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-6 text-xs font-mono text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-slate-900 font-bold">1,842</span>
                <span>Verified Proofs</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span className="text-slate-900 font-bold">28</span>
                <span>Partner Institutions</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-600" />
                <span className="text-slate-900 font-bold">0.999</span>
                <span>ROC-AUC Benchmark</span>
              </div>
            </div>
          </div>

          {/* Floating Product Mock UI */}
          <div className="lg:col-span-5 relative">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] font-mono text-slate-400">proofly.app/alexrivera</span>
              </div>

              {/* Mini Candidate Summary */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 p-0.5 overflow-hidden shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" 
                    alt="Alex" 
                    className="w-full h-full rounded-lg object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">Alex Rivera</div>
                  <div className="text-[11px] text-slate-500">Stanford CS '26 · ML Systems</div>
                </div>
                <div className="ml-auto">
                  <ScoreRing score={86} size={42} strokeWidth={4} color="#4F46E5" />
                </div>
              </div>

              {/* Sample Verified Evidence Row */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-700 font-bold">PROJECT CASE STUDY</span>
                  <span className="text-[10px] font-mono text-emerald-700 font-semibold">Faculty Signed</span>
                </div>
                <div className="font-bold text-slate-900">SynapseNet: Sparse Attention Kernel</div>
                <div className="text-[11px] text-slate-500">2.8x speedup on 4K sequences with fused CUDA kernels.</div>
              </div>

              {/* Skill chips preview */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-mono font-bold">PyTorch 94/100</span>
                <span className="px-2 py-0.5 rounded bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-mono font-bold">CUDA 82/100</span>
                <span className="px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-bold">Docker 78/100</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: EVIDENCE PIPELINE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-600 uppercase font-bold tracking-wider">
            <TrendingUp className="w-4 h-4" />
            <span>The Evidence Pipeline</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            From Raw Code to Verified Credentials
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A comprehensive 5-step verification lifecycle grounding claims in raw engineering artifacts.
          </p>
        </div>

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
                    ? 'bg-indigo-50/50 border-indigo-400 shadow-sm translate-y-[-2px]' 
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 font-bold">
                      STEP {s.step}
                    </span>
                    <span 
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${s.badgeColor}15`, color: s.badgeColor }}
                    >
                      {s.badge}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 w-fit" style={{ color: s.badgeColor }}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {s.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] font-mono font-semibold text-indigo-600">
                  {s.delta}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: CORE ARCHITECTURE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-teal-700 uppercase font-bold tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Core Architecture</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Engineered for Ground Truth
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Six integrated systems powering verifiable student careers and data-driven university placement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                    {f.category}
                  </span>
                  <span 
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                    style={{ backgroundColor: `${f.color}15`, color: f.color }}
                  >
                    {f.highlight}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">
                  {f.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs font-mono text-indigo-600 flex items-center justify-between font-medium">
                <span>View specification</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: TARGET ECOSYSTEM */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-800 uppercase font-bold tracking-wider">
            <Users className="w-4 h-4" />
            <span>Target Ecosystem</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            Built for the Collegiate Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Workspaces tailored specifically for students, professors, and corporate recruiters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div 
                key={idx}
                className="p-8 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 w-fit" style={{ color: p.color }}>
                    <Icon className="w-6 h-6" />
                  </div>

                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: p.color }}>
                      {p.role}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 leading-snug">
                      {p.headline}
                    </h3>
                  </div>

                  <ul className="space-y-2.5 pt-2">
                    {p.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="text-xs text-slate-600 flex items-start gap-2.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleNav(p.target)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-mono font-semibold text-slate-800 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{p.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="p-10 rounded-2xl bg-white border border-slate-200/90 shadow-sm text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900">
          Ready to verify engineering credentials?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          Replace unverified resume claims with artifact-grounded, peer-defended proof.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button
            onClick={() => handleNav('dashboard')}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Launch Student Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNav('profile')}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Explore Shareable Portfolio</span>
          </button>
        </div>
      </section>

    </div>
  );
};
