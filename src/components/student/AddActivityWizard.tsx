import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Link, 
  Sparkles, 
  Briefcase, 
  FolderPlus, 
  Award, 
  Trophy, 
  FileCheck, 
  Check
} from 'lucide-react';
import { EvidenceType } from '../../types';
import { EVIDENCE_TYPE_WEIGHTS, normalizeSkillName } from '../../lib/logic';

interface AddActivityWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddActivityWizard: React.FC<AddActivityWizardProps> = ({ isOpen, onClose }) => {
  const { addEvidence, triggerCelebration } = useApp();

  const [step, setStep] = useState<number>(1);
  const [type, setType] = useState<EvidenceType>('Project');
  const [title, setTitle] = useState('');
  const [organizationOrEvent, setOrganizationOrEvent] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [metrics, setMetrics] = useState('');
  const [url, setUrl] = useState('');
  const [fileName, setFileName] = useState('');
  const [rawSkills, setRawSkills] = useState('');
  const [autoVerifyDemo, setAutoVerifyDemo] = useState(false);

  if (!isOpen) return null;

  const activityTypes: { type: EvidenceType; label: string; icon: any; weight: number; desc: string }[] = [
    { type: 'Internship', label: 'Internship', icon: Briefcase, weight: 30, desc: 'Industry engineering or lab research role' },
    { type: 'Project', label: 'Project / Capstone', icon: FolderPlus, weight: 25, desc: 'Substantial standalone code or thesis' },
    { type: 'Hackathon', label: 'Hackathon', icon: Sparkles, weight: 20, desc: 'Sprint hackathon prototype or prize' },
    { type: 'Competition', label: 'Competition', icon: Trophy, weight: 18, desc: 'ICPC, Kaggle, or Olympiad placement' },
    { type: 'Certificate', label: 'Certificate', icon: FileCheck, weight: 15, desc: 'AWS, GCP, Coursera, or vendor exam' },
    { type: 'Achievement', label: 'Achievement', icon: Award, weight: 12, desc: 'Paper award, fellowship, or honors' },
  ];

  const parsedSkills = rawSkills
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => normalizeSkillName(s).canonical);

  const baseWeight = EVIDENCE_TYPE_WEIGHTS[type] || 20;

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    addEvidence({
      title,
      type,
      description,
      date,
      organizationOrEvent: organizationOrEvent || 'University Academic Department',
      metrics: metrics || undefined,
      url: url || undefined,
      fileName: fileName || (url ? 'github_repository_link' : 'capstone_submission.pdf'),
      fileSize: fileName ? '1.4 MB' : undefined,
      skillsTagged: parsedSkills.length > 0 ? parsedSkills : ['Python', 'Machine Learning']
    }, autoVerifyDemo);

    triggerCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-[16px] bg-[#242C41] border border-[rgba(255,255,255,0.18)] shadow-2xl overflow-hidden flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-[rgba(255,255,255,0.10)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-[#7C8CFF]/20 text-[#7C8CFF] flex items-center justify-center font-mono-data font-bold text-xs">
              0{step}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-[#F1F4FA]">
                Log Verifiable Evidence
              </h2>
              <span className="text-[11px] font-mono-data text-[#8A94AD]">Step {step} of 4</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-[#8A94AD] hover:text-[#F1F4FA] rounded-[6px]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {step === 1 && (
            <div className="space-y-4 text-left">
              <div className="text-sm font-semibold text-[#F1F4FA]">
                Select Activity Classification
              </div>
              <p className="text-xs text-[#B4BCD0]">
                Each evidence type carries a mathematically weighted baseline contribution towards proof strength.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {activityTypes.map(at => {
                  const Icon = at.icon;
                  const isSelected = type === at.type;
                  return (
                    <button
                      key={at.type}
                      type="button"
                      onClick={() => setType(at.type)}
                      className={`p-3.5 rounded-[12px] border text-left transition-all ${
                        isSelected
                          ? 'bg-[#2D3650] border-[#7C8CFF] text-[#F1F4FA]'
                          : 'bg-[#1C2233] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.14)] text-[#B4BCD0]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-[#7C8CFF]' : 'text-[#8A94AD]'}`} />
                        <span className="text-[11px] font-mono-data text-[#4ADE80] font-bold">
                          +{at.weight} pts
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-[#F1F4FA]">{at.label}</div>
                      <div className="text-[10px] text-[#8A94AD] mt-1 leading-tight">{at.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                  Title of Activity / Project *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Model Inference Engine"
                  className="w-full px-3.5 py-2.5 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-sm text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                    Organization / Event
                  </label>
                  <input
                    type="text"
                    value={organizationOrEvent}
                    onChange={e => setOrganizationOrEvent(e.target.value)}
                    placeholder="e.g. Stanford AI Lab / HackMIT"
                    className="w-full px-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                  Summary & Responsibilities *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you architected, technical obstacles overcome, and team contribution."
                  className="w-full px-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                  Quantifiable Outcome Metric
                </label>
                <input
                  type="text"
                  value={metrics}
                  onChange={e => setMetrics(e.target.value)}
                  placeholder="e.g. 34% p99 latency reduction, 840+ GitHub stars"
                  className="w-full px-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-left">
              <div className="text-sm font-semibold text-[#F1F4FA]">
                Attach Verifiable Evidence Artifacts
              </div>
              <p className="text-xs text-[#B4BCD0]">
                Recruiters require verifiable links or signed evaluation documents to grant maximum confidence.
              </p>

              <div>
                <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                  Public Artifact URL (GitHub / Paper / Devpost)
                </label>
                <div className="relative">
                  <Link className="w-4 h-4 text-[#8A94AD] absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={url}
                    onChange={e => setUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                  />
                </div>
              </div>

              {/* Simulated file upload */}
              <div>
                <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                  Upload Signed Faculty Rubric or Certificate
                </label>
                <div 
                  onClick={() => setFileName('faculty_evaluation_signed_capstone.pdf')}
                  className="p-6 rounded-[12px] border-2 border-dashed border-[rgba(255,255,255,0.10)] hover:border-[#7C8CFF]/50 bg-[#1C2233] text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-5 h-5 text-[#8A94AD] mx-auto mb-2" />
                  {fileName ? (
                    <div className="text-xs font-mono-data text-[#4ADE80] font-semibold">
                      {fileName} (1.4 MB) · Attached
                    </div>
                  ) : (
                    <>
                      <div className="text-xs font-medium text-[#F1F4FA]">Click to attach file</div>
                      <div className="text-[10px] text-[#8A94AD] font-mono-data mt-1">PDF, DOCX, or PNG up to 25MB</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-left">
              <div className="text-sm font-semibold text-[#F1F4FA]">
                Tag Skills & Review Confidence Projection
              </div>

              <div>
                <label className="block text-xs font-mono-data text-[#8A94AD] uppercase tracking-wider mb-1">
                  Skills Proven (comma-separated)
                </label>
                <input
                  type="text"
                  value={rawSkills}
                  onChange={e => setRawSkills(e.target.value)}
                  placeholder="e.g. Python, PyTorch, Docker, C++"
                  className="w-full px-3.5 py-2 rounded-[8px] bg-[#1C2233] border border-[rgba(255,255,255,0.10)] text-xs text-[#F1F4FA] focus:outline-none focus:border-[#7C8CFF]"
                />
              </div>

              {/* Recognized Canonical Skills */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono-data text-[#8A94AD]">Recognized Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(parsedSkills.length > 0 ? parsedSkills : ['Python', 'Docker']).map((s, idx) => (
                    <span key={idx} className="text-xs font-mono-data px-2.5 py-0.5 rounded-[6px] bg-[#2D3650] text-[#7C8CFF]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projected Points Box */}
              <div className="p-3.5 rounded-[12px] bg-[#1C2233] border border-[rgba(255,255,255,0.08)] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono-data">
                  <span className="text-[#F1F4FA] font-semibold">Projected Score Impact</span>
                  <span className="text-[#4ADE80] font-bold">+{baseWeight} base points</span>
                </div>
                <p className="text-[11px] text-[#B4BCD0] leading-relaxed">
                  Upon submission, this item enters the Faculty Review Queue for Prof. Vance. Once approved, confidence recalculates across all tagged skills.
                </p>
              </div>

              {/* Instant Auto-Verify toggle for demo convenience */}
              <div className="p-3 rounded-[10px] bg-[#1C2233] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#F1F4FA] font-medium block">Instant Faculty Auto-Approval</span>
                  <span className="text-[10px] text-[#8A94AD]">Simulate immediate approval for testing</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerifyDemo}
                  onChange={e => setAutoVerifyDemo(e.target.checked)}
                  className="w-4 h-4 rounded accent-[#7C8CFF] cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.10)] flex items-center justify-between bg-[#1C2233]/40">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-1.5 rounded-[8px] text-xs font-medium text-[#B4BCD0] hover:text-[#F1F4FA] flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-[8px] text-xs font-semibold bg-[#2D3650] hover:bg-[#374263] text-[#F1F4FA] transition-colors flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 rounded-[8px] text-xs font-semibold bg-[#7C8CFF] hover:bg-[#6a7bff] text-white shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Submit for Verification</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
