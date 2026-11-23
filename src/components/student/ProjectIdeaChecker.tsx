import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ChevronRight, 
  Layers, 
  Cpu, 
  Flame, 
  Lightbulb, 
  Check, 
  Code2,
  FileSearch,
  SlidersHorizontal
} from 'lucide-react';
import { SimilarityResult } from '../../types';
import { ScoreRing } from '../common/EvidenceEncoding';

const POPULAR_DOMAINS = [
  'Deep Learning & LLMs',
  'Distributed Systems',
  'Computer Vision',
  'Autonomous Agents',
  'Cybersecurity & Cryptography',
  'Bioinformatics'
];

const PRESET_TECHS = [
  'PyTorch', 'CUDA', 'TypeScript', 'Rust', 'TensorRT', 'Docker', 'FastAPI', 'Next.js', 'PostgreSQL'
];

export const ProjectIdeaChecker: React.FC = () => {
  const { checkProjectSimilarity } = useApp();

  const [title, setTitle] = useState('Sparse Attention Transformer for Edge Video Streams');
  const [selectedDomain, setSelectedDomain] = useState('Deep Learning & LLMs');
  const [problemDescription, setProblemDescription] = useState(
    'Quadratic memory scaling in MultiheadAttention creates prohibitive bottlenecks when analyzing dense 4K camera streams in real-time on edge compute nodes. We propose a fused linear-time sparse attention kernel with dynamic sparsity gating.'
  );
  const [selectedTechs, setSelectedTechs] = useState<string[]>(['PyTorch', 'CUDA', 'Docker', 'TensorRT']);
  const [customTech, setCustomTech] = useState('');

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [results, setResults] = useState<SimilarityResult[] | null>(null);
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0);
  const [diffMode, setDiffMode] = useState<'similar' | 'different'>('similar');

  const steps = [
    'Scanning 140+ institutional capstone repositories...',
    'Generating dense embeddings across architecture & claims...',
    'Comparing dimensional problem-solution graph...',
    'Computing originality score and novelty vector...'
  ];

  const handleRunAnalysis = () => {
    if (!problemDescription.trim()) return;

    setIsAnalyzing(true);
    setAnalysisStep(0);
    setResults(null);

    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(async () => {
            const input = {
              title: title.trim() || 'Untitled Capstone Concept',
              domain: selectedDomain,
              problem: problemDescription,
              technology: selectedTechs.length > 0 ? selectedTechs : ['Python', 'PyTorch'],
              methodology: ['Empirical benchmarking', 'Kernel profiling'],
              description: problemDescription
            };
            const res = await checkProjectSimilarity(input);
            setResults(res);
            setIsAnalyzing(false);
          }, 400);
          return prev;
        }
      });
    }, 450);
  };

  const toggleTech = (tech: string) => {
    setSelectedTechs(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const addCustomTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && customTech.trim()) {
      e.preventDefault();
      if (!selectedTechs.includes(customTech.trim())) {
        setSelectedTechs([...selectedTechs, customTech.trim()]);
      }
      setCustomTech('');
    }
  };

  useEffect(() => {
    handleRunAnalysis();
  }, []);

  const topMatch = results && results.length > 0 ? results[0] : null;
  const similarityScore = topMatch ? Math.round(topMatch.overallScore) : 18;

  const getStatus = (score: number) => {
    if (score < 25) {
      return {
        label: 'High Originality',
        desc: 'Novel concept with minimal institutional overlap (<25%). Approved for Capstone / Grant.',
        color: '#059669',
        bg: '#ECFDF5',
        border: '#A7F3D0'
      };
    } else if (score < 50) {
      return {
        label: 'Moderate Overlap',
        desc: 'Shares architecture with past projects (25-50%). Focus on key differentiators.',
        color: '#D97706',
        bg: '#FFFBEB',
        border: '#FDE68A'
      };
    } else {
      return {
        label: 'High Overlap',
        desc: 'Strong similarity (>50%) with completed capstones. Differentiate problem or technology.',
        color: '#E11D48',
        bg: '#FFF1F2',
        border: '#FECDD3'
      };
    }
  };

  const statusInfo = getStatus(similarityScore);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left bg-slate-50 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="text-xs font-mono text-indigo-700 uppercase font-bold tracking-wider">
              Capstone Originality Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
            Project Idea & Originality Checker
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Cross-check your proposed thesis or hackathon concept against 140+ verified Stanford projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-mono text-slate-600 shadow-xs">
            Indexed: <span className="text-slate-900 font-semibold">142 Institutional Repositories</span>
          </div>
        </div>
      </div>

      {/* SPLIT 2-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: INPUT CARD */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Project Proposal
            </h2>
            <span className="text-[11px] font-mono text-slate-400 font-medium">Draft Concept</span>
          </div>

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500 uppercase font-semibold">
              Working Title
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Model Serving Pipeline"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Domain Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500 uppercase font-semibold">
              Primary Research Domain
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DOMAINS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomain(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                    selectedDomain === d 
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs' 
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Problem & Approach */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-500 uppercase font-semibold flex justify-between">
              <span>Problem & Methodology</span>
              <span className="text-[10px] text-slate-400">{problemDescription.length} chars</span>
            </label>
            <textarea
              rows={5}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the engineering problem, mathematical bottlenecks, and proposed architecture..."
              className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>

          {/* Tech Stack Chips */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-500 uppercase font-semibold">
              Technologies & Frameworks
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TECHS.map(t => {
                const isSelected = selectedTechs.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTech(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-colors cursor-pointer ${
                      isSelected 
                        ? 'bg-indigo-50 border border-indigo-200 text-indigo-700 font-semibold' 
                        : 'bg-slate-100 text-slate-600 hover:text-slate-900 border border-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {t}
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={customTech}
              onChange={(e) => setCustomTech(e.target.value)}
              onKeyDown={addCustomTech}
              placeholder="Type custom tech and press Enter..."
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Run Analysis Button */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !problemDescription.trim()}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Running Semantic Scan...</span>
                </>
              ) : (
                <>
                  <FileSearch className="w-4 h-4" />
                  <span>Run Similarity Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: RESULT PANEL */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Analyzing Stepper State */}
          {isAnalyzing && (
            <div className="p-8 rounded-2xl bg-white border border-indigo-200 shadow-sm space-y-6 text-left animate-in fade-in duration-150">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-600 animate-ping" />
                <h3 className="text-base font-bold text-slate-900">
                  Deep Semantic Originality Engine Active
                </h3>
              </div>

              <div className="space-y-4">
                {steps.map((st, idx) => {
                  const isDone = analysisStep > idx;
                  const isCurrent = analysisStep === idx;
                  return (
                    <div 
                      key={idx}
                      className={`flex items-center gap-3.5 p-3 rounded-xl transition-all ${
                        isCurrent 
                          ? 'bg-indigo-50/80 border border-indigo-300 text-indigo-900 font-medium' 
                          : isDone 
                            ? 'text-emerald-700 opacity-90' 
                            : 'text-slate-400'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <span className="text-xs font-mono">{st}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results Panel */}
          {!isAnalyzing && results && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Overall Similarity Ring Card */}
              <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <ScoreRing 
                    score={similarityScore} 
                    size={80} 
                    strokeWidth={7} 
                    color={statusInfo.color} 
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                      Overall Similarity
                    </div>
                    <div className="text-3xl font-extrabold font-mono" style={{ color: statusInfo.color }}>
                      {similarityScore}% <span className="text-sm font-normal text-slate-400">overlap</span>
                    </div>
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold mt-1"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.border}` }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </div>
                  </div>
                </div>

                <div className="max-w-xs text-xs text-slate-600 leading-relaxed border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
                  {statusInfo.desc}
                </div>
              </div>

              {/* Dimensional Match Bars */}
              {topMatch && topMatch.dimensions && (
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                      Dimensional Match Breakdown
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      Benchmarked against #{topMatch.matchedProjectId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Problem */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600">Problem Similarity</span>
                        <span className="text-amber-700 font-bold">{Math.round(topMatch.dimensions.problemScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-amber-500 transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.problemScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600">Tech Stack Overlap</span>
                        <span className="text-indigo-700 font-bold">{Math.round(topMatch.dimensions.technologyScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.technologyScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Methodology */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600">Methodology Overlap</span>
                        <span className="text-sky-700 font-bold">{Math.round(topMatch.dimensions.methodologyScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-sky-500 transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.methodologyScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Domain & Claims */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-600">Domain & Claims</span>
                        <span className="text-teal-700 font-bold">{Math.round(topMatch.dimensions.domainScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-teal-500 transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.domainScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Matched Past Projects */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">
                    Top Matched Institutional Projects
                  </h3>
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => setDiffMode('similar')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                        diffMode === 'similar' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      What is Similar
                    </button>
                    <button
                      onClick={() => setDiffMode('different')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono transition-colors cursor-pointer ${
                        diffMode === 'different' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      What is Different
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {results.slice(0, 3).map((item, idx) => {
                    const isSelected = selectedMatchIndex === idx;
                    return (
                      <div 
                        key={item.matchedProjectId}
                        onClick={() => setSelectedMatchIndex(idx)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-50/70 border-indigo-400 shadow-xs' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {item.matchedProjectTitle}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                {item.matchedYear}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              by {item.matchedStudentName} · ID #{item.matchedProjectId}
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-amber-700 shrink-0">
                            {Math.round(item.overallScore)}% match
                          </span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-slate-100 text-xs font-mono">
                          {diffMode === 'similar' ? (
                            <div className="space-y-1">
                              <span className="text-[10px] text-amber-700 font-semibold uppercase">Overlapping Dimensions:</span>
                              <div className="text-xs text-slate-600">
                                {item.explanation || 'Shared deep learning focus and hardware acceleration approach.'}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-[10px] text-emerald-700 font-semibold uppercase">Distinct Differentiators:</span>
                              <div className="text-xs text-slate-600">
                                Proposed project applies fused sparsity gating to real-time 4K edge streams, whereas past work focused on offline batch processing.
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actionable differentiation chips */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    How to Make This 100% Unique
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="text-indigo-700 font-bold font-mono text-[11px]">1. Hardware Target</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Benchmark directly on edge Jetson Orin instead of standard datacenter H100 clusters.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="text-teal-700 font-bold font-mono text-[11px]">2. Dynamic Sparsity</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Incorporate adaptive thresholding based on frame motion vectors to drop redundant patches.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="text-amber-700 font-bold font-mono text-[11px]">3. Open Benchmarks</div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      Publish reproducible PyTorch bindings to HuggingFace with verified latency numbers.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

    </div>
  );
};
