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

    // Stepper animation
    const interval = setInterval(() => {
      setAnalysisStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            const input = {
              title: title.trim() || 'Untitled Capstone Concept',
              domain: selectedDomain,
              problem: problemDescription,
              technology: selectedTechs.length > 0 ? selectedTechs : ['Python', 'PyTorch'],
              methodology: ['Empirical benchmarking', 'Kernel profiling'],
              description: problemDescription
            };
            const res = checkProjectSimilarity(input);
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

  // Run initial test check on mount for immediate rich presentation
  useEffect(() => {
    handleRunAnalysis();
  }, []);

  const topMatch = results && results.length > 0 ? results[0] : null;
  const similarityScore = topMatch ? Math.round(topMatch.overallScore) : 18;

  // Status configuration based on score
  const getStatus = (score: number) => {
    if (score < 25) {
      return {
        label: 'High Originality',
        desc: 'Novel concept with minimal institutional overlap (<25%). Approved for Capstone / Grant.',
        color: '#4ADE80',
        bg: '#4ADE8018',
        border: '#4ADE8040'
      };
    } else if (score < 50) {
      return {
        label: 'Moderate Overlap',
        desc: 'Shares architecture with past projects (25-50%). Focus on key differentiators.',
        color: '#FFC773',
        bg: '#FFC77318',
        border: '#FFC77340'
      };
    } else {
      return {
        label: 'High Overlap',
        desc: 'Strong similarity (>50%) with completed capstones. Differentiate problem or technology.',
        color: '#FB7185',
        bg: '#FB718518',
        border: '#FB718540'
      };
    }
  };

  const statusInfo = getStatus(similarityScore);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#8B7CFF]/20 text-[#8B7CFF]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono-data text-[#8B7CFF] uppercase font-bold tracking-wider">
              AI Capstone Intelligence
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F6FF] mt-1 tracking-tight">
            Project Idea & Originality Checker
          </h1>
          <p className="text-xs sm:text-sm text-[#BAC2DC] mt-0.5">
            Cross-check your proposed thesis or hackathon concept against 140+ verified Stanford projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-[#222A52] border border-[rgba(255,255,255,0.08)] text-xs font-mono-data text-[#8F99B8]">
            Indexed: <span className="text-[#F4F6FF] font-semibold">142 Projects</span>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* SPLIT 2-COLUMN LAYOUT */}
      {/* ================================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================================================================ */}
        {/* LEFT COLUMN (5 cols): INPUT CARD */}
        {/* ================================================================ */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.10)] shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-4">
            <h2 className="font-display text-base font-bold text-[#F4F6FF] flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#8B7CFF]" />
              Project Proposal
            </h2>
            <span className="text-[11px] font-mono-data text-[#8F99B8]">Draft Concept</span>
          </div>

          {/* Project Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono-data text-[#8F99B8] uppercase">
              Working Title
            </label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Model Serving Pipeline"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.10)] text-xs sm:text-sm text-[#F4F6FF] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          {/* Domain Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono-data text-[#8F99B8] uppercase">
              Primary Research Domain
            </label>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_DOMAINS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDomain(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono-data transition-colors ${
                    selectedDomain === d 
                      ? 'bg-[#8B7CFF] text-white font-semibold shadow-sm' 
                      : 'bg-[#1A2040] text-[#8F99B8] hover:text-[#F4F6FF]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Problem & Approach */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono-data text-[#8F99B8] uppercase flex justify-between">
              <span>Problem & Methodology</span>
              <span className="text-[10px] text-[#8F99B8]">{problemDescription.length} chars</span>
            </label>
            <textarea
              rows={5}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Describe the engineering problem, mathematical bottlenecks, and proposed architecture..."
              className="w-full p-3.5 rounded-xl bg-[#1A2040] border border-[rgba(255,255,255,0.10)] text-xs text-[#F4F6FF] placeholder:text-[#8F99B8] focus:outline-none focus:border-[#8B7CFF] resize-none leading-relaxed"
            />
          </div>

          {/* Tech Stack Chips */}
          <div className="space-y-2">
            <label className="text-xs font-mono-data text-[#8F99B8] uppercase">
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
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono-data flex items-center gap-1 transition-colors ${
                      isSelected 
                        ? 'bg-[#2DD4BF]/20 border border-[#2DD4BF]/40 text-[#2DD4BF] font-semibold' 
                        : 'bg-[#1A2040] text-[#8F99B8] hover:text-[#F4F6FF] border border-[rgba(255,255,255,0.05)]'
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
              className="w-full px-3 py-2 rounded-lg bg-[#1A2040] border border-[rgba(255,255,255,0.08)] text-xs text-[#F4F6FF] placeholder:text-[#8F99B8] focus:outline-none focus:border-[#8B7CFF]"
            />
          </div>

          {/* Run Analysis Button */}
          <div className="pt-2">
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !problemDescription.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B7CFF] to-[#7B6BE8] hover:from-[#7B6BE8] hover:to-[#6A5AD7] disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-[#8B7CFF]/20 transition-all flex items-center justify-center gap-2"
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

        {/* ================================================================ */}
        {/* RIGHT COLUMN (7 cols): RESULT PANEL */}
        {/* ================================================================ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Analyzing Stepper State */}
          {isAnalyzing && (
            <div className="p-8 rounded-2xl bg-[#222A52] border border-[#8B7CFF]/30 shadow-xl space-y-6 text-left animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#8B7CFF] animate-ping" />
                <h3 className="font-display text-base font-bold text-[#F4F6FF]">
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
                          ? 'bg-[#1A2040] border border-[#8B7CFF]/40 text-[#F4F6FF]' 
                          : isDone 
                            ? 'text-[#4ADE80] opacity-80' 
                            : 'text-[#8F99B8]/40'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-[#4ADE80]" />
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-[#8B7CFF] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-current" />
                        )}
                      </div>
                      <span className="text-xs font-mono-data">{st}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results Panel */}
          {!isAnalyzing && results && (
            <div className="space-y-6 animate-fade-in">
              
              {/* a) Large animated ring + Status */}
              <div className="p-6 sm:p-8 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.12)] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <ScoreRing 
                    score={similarityScore} 
                    size={80} 
                    strokeWidth={7} 
                    color={statusInfo.color} 
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-mono-data uppercase tracking-wider text-[#8F99B8]">
                      Overall Similarity
                    </div>
                    <div className="font-display text-3xl font-bold font-mono-data" style={{ color: statusInfo.color }}>
                      {similarityScore}% <span className="text-sm font-normal text-[#8F99B8]">overlap</span>
                    </div>
                    <div 
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono-data font-bold mt-1"
                      style={{ backgroundColor: statusInfo.bg, color: statusInfo.color, border: `1px solid ${statusInfo.border}` }}
                    >
                      <Check className="w-3.5 h-3.5" />
                      {statusInfo.label}
                    </div>
                  </div>
                </div>

                <div className="max-w-xs text-xs text-[#BAC2DC] leading-relaxed border-t sm:border-t-0 sm:border-l border-[rgba(255,255,255,0.08)] pt-4 sm:pt-0 sm:pl-6">
                  {statusInfo.desc}
                </div>
              </div>

              {/* c) 4 Dimensional Match Bars */}
              {topMatch && topMatch.dimensions && (
                <div className="p-6 rounded-2xl bg-[#222A52] border border-[rgba(255,255,255,0.08)] space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-sm font-bold text-[#F4F6FF] flex items-center gap-2">
                      <SlidersHorizontal className="w-4 h-4 text-[#8B7CFF]" />
                      Dimensional Match Breakdown
                    </h3>
                    <span className="text-[11px] font-mono-data text-[#8F99B8]">
                      Benchmarked against #{topMatch.matchedProjectId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Problem */}
                    <div className="p-3 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
                      <div className="flex justify-between text-xs font-mono-data">
                        <span className="text-[#8F99B8]">Problem Similarity</span>
                        <span className="text-[#FFC773] font-bold">{Math.round(topMatch.dimensions.problemScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A2040] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#FFC773] transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.problemScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Tech Stack */}
                    <div className="p-3 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
                      <div className="flex justify-between text-xs font-mono-data">
                        <span className="text-[#8F99B8]">Tech Stack Overlap</span>
                        <span className="text-[#8B7CFF] font-bold">{Math.round(topMatch.dimensions.technologyScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A2040] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#8B7CFF] transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.technologyScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Methodology */}
                    <div className="p-3 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
                      <div className="flex justify-between text-xs font-mono-data">
                        <span className="text-[#8F99B8]">Methodology Overlap</span>
                        <span className="text-[#38BDF8] font-bold">{Math.round(topMatch.dimensions.methodologyScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A2040] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#38BDF8] transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.methodologyScore}%` }}
                        />
                      </div>
                    </div>

                    {/* Domain & Claims */}
                    <div className="p-3 rounded-xl bg-[#1A2040]/70 border border-[rgba(255,255,255,0.05)] space-y-1.5">
                      <div className="flex justify-between text-xs font-mono-data">
                        <span className="text-[#8F99B8]">Domain & Claims</span>
                        <span className="text-[#2DD4BF] font-bold">{Math.round(topMatch.dimensions.domainScore)}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1A2040] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-[#2DD4BF] transition-all duration-700"
                          style={{ width: `${topMatch.dimensions.domainScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* d) Most Similar Past Projects (3 Cards) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-bold text-[#F4F6FF]">
                    Top Matched Institutional Projects
                  </h3>
                  <div className="flex items-center gap-1 bg-[#1A2040] p-0.5 rounded-lg border border-[rgba(255,255,255,0.08)]">
                    <button
                      onClick={() => setDiffMode('similar')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono-data transition-colors ${
                        diffMode === 'similar' ? 'bg-[#8B7CFF] text-white font-bold' : 'text-[#8F99B8]'
                      }`}
                    >
                      What is Similar
                    </button>
                    <button
                      onClick={() => setDiffMode('different')}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-mono-data transition-colors ${
                        diffMode === 'different' ? 'bg-[#8B7CFF] text-white font-bold' : 'text-[#8F99B8]'
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
                            ? 'bg-[#2B3563] border-[#8B7CFF] shadow-md' 
                            : 'bg-[#222A52] border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-display text-sm font-bold text-[#F4F6FF]">
                                {item.matchedProjectTitle}
                              </span>
                              <span className="text-[10px] font-mono-data text-[#8F99B8]">
                                {item.matchedYear}
                              </span>
                            </div>
                            <div className="text-xs text-[#BAC2DC]">
                              by {item.matchedStudentName} · ID #{item.matchedProjectId}
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-full bg-[#1A2040] border border-[rgba(255,255,255,0.10)] font-mono-data text-xs font-bold text-[#FFC773] shrink-0">
                            {Math.round(item.overallScore)}% match
                          </span>
                        </div>

                        {/* Similar vs Different details */}
                        <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)] text-xs font-mono-data">
                          {diffMode === 'similar' ? (
                            <div className="space-y-1 text-[#FFC773]">
                              <span className="text-[10px] text-[#8F99B8] uppercase">Overlapping Dimensions:</span>
                              <div className="text-xs text-[#BAC2DC]">
                                {item.explanation || 'Shared deep learning focus and hardware acceleration approach.'}
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 text-[#4ADE80]">
                              <span className="text-[10px] text-[#8F99B8] uppercase">Distinct Differentiators:</span>
                              <div className="text-xs text-[#BAC2DC]">
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

              {/* e) "How to differentiate": 3 actionable recommendation chips */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#222A52] to-[#1A2040] border border-[rgba(255,255,255,0.10)] space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-[#FFC773]" />
                  <h3 className="font-display text-sm font-bold text-[#F4F6FF]">
                    How to Make This 100% Unique
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="p-3 rounded-xl bg-[#1A2040]/80 border border-[rgba(255,255,255,0.06)] text-xs space-y-1">
                    <div className="text-[#8B7CFF] font-bold font-mono-data text-[11px]">1. Hardware Target</div>
                    <p className="text-[#BAC2DC] text-[11px] leading-relaxed">
                      Benchmark directly on edge Jetson Orin instead of standard datacenter H100 clusters.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A2040]/80 border border-[rgba(255,255,255,0.06)] text-xs space-y-1">
                    <div className="text-[#2DD4BF] font-bold font-mono-data text-[11px]">2. Dynamic Sparsity</div>
                    <p className="text-[#BAC2DC] text-[11px] leading-relaxed">
                      Incorporate adaptive thresholding based on frame motion vectors to drop redundant patches.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#1A2040]/80 border border-[rgba(255,255,255,0.06)] text-xs space-y-1">
                    <div className="text-[#FFC773] font-bold font-mono-data text-[11px]">3. Open Benchmarks</div>
                    <p className="text-[#BAC2DC] text-[11px] leading-relaxed">
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
