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
  const [reportText, setReportText] = useState('');
  
  // File uploads
  const [reportFileName, setReportFileName] = useState('');
  const [reportFileObject, setReportFileObject] = useState<File | null>(null);
  const [certFileName, setCertFileName] = useState('');
  const [certFileObject, setCertFileObject] = useState<File | null>(null);

  const [rawSkills, setRawSkills] = useState('');
  const [autoVerifyDemo, setAutoVerifyDemo] = useState(false);
  const reportInputRef = React.useRef<HTMLInputElement | null>(null);
  const certInputRef = React.useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const activityTypes: { type: EvidenceType; label: string; icon: any; weight: number; desc: string }[] = [
    { type: 'Internship', label: 'Internship', icon: Briefcase, weight: 30, desc: 'Industry engineering or lab research role' },
    { type: 'Project', label: 'Project / Capstone', icon: FolderPlus, weight: 25, desc: 'Substantial standalone code or thesis' },
    { type: 'Hackathon', label: 'Hackathon', icon: Sparkles, weight: 20, desc: 'Sprint hackathon project or prize' },
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

    const primaryFileName = reportFileName || certFileName || (url ? 'github_repository_link' : `${type.toLowerCase()}_artifact.pdf`);
    const primaryFileSize = reportFileObject 
      ? `${(reportFileObject.size / (1024 * 1024)).toFixed(1)} MB` 
      : (certFileObject ? `${(certFileObject.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB');

    addEvidence({
      title,
      type,
      description,
      date,
      organizationOrEvent: organizationOrEvent || (type === 'Internship' ? 'Industry Corporation' : 'University Academic Department'),
      metrics: metrics || undefined,
      url: url || undefined,
      fileName: primaryFileName,
      fileSize: primaryFileSize,
      reportText: reportText.trim() || description,
      certificateFileName: certFileName || undefined,
      certificateFileSize: certFileObject ? `${(certFileObject.size / (1024 * 1024)).toFixed(1)} MB` : undefined,
      skillsTagged: parsedSkills.length > 0 ? parsedSkills : (type === 'Internship' ? ['Data Analytics', 'PowerBI', 'SQL'] : ['Python', 'Machine Learning'])
    }, autoVerifyDemo, reportFileObject || certFileObject || undefined);

    triggerCelebration();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col justify-between"
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-mono font-bold text-xs">
              0{step}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Log Verifiable Evidence
              </h2>
              <span className="text-[11px] font-mono text-slate-500">Step {step} of 4</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {step === 1 && (
            <div className="space-y-4 text-left">
              <div className="text-sm font-semibold text-slate-900">
                Select Activity Classification
              </div>
              <p className="text-xs text-slate-600">
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
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/70 border-indigo-400 text-slate-900 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                        <span className="text-[11px] font-mono text-emerald-600 font-bold">
                          +{at.weight} pts
                        </span>
                      </div>
                      <div className="font-semibold text-xs text-slate-900">{at.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1 leading-tight">{at.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Title of Activity / Project *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Distributed Model Inference Engine"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                    Organization / Event
                  </label>
                  <input
                    type="text"
                    value={organizationOrEvent}
                    onChange={e => setOrganizationOrEvent(e.target.value)}
                    placeholder="e.g. Stanford AI Lab / HackMIT"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                    Completion Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Summary & Responsibilities *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe what you architected, technical obstacles overcome, and team contribution."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Quantifiable Outcome Metric
                </label>
                <input
                  type="text"
                  value={metrics}
                  onChange={e => setMetrics(e.target.value)}
                  placeholder="e.g. 34% p99 latency reduction, 840+ GitHub stars"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 text-left">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {type === 'Internship' && 'Attach Internship Report & Completion Certificate'}
                  {type === 'Project' && 'Provide Source Code Repository & Architecture Report'}
                  {type === 'Certificate' && 'Attach Official Certificate & Curriculum Details'}
                  {type === 'Hackathon' && 'Attach Hackathon Submission & Award Proof'}
                  {type === 'Competition' && 'Attach Competition Profile & Scorecard'}
                  {type === 'Achievement' && 'Attach Research Manuscript & Publication DOI'}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {type === 'Internship' && 'Upload your work report and completion certificate. For non-code roles (e.g. Data Analytics / PowerBI), questions are generated directly from your report.'}
                  {type === 'Project' && 'Link your GitHub/GitLab repository or hosted application, and attach a system architecture report.'}
                  {type === 'Certificate' && 'Provide the certificate document and syllabus to allow AI to generate questions testing the claimed curriculum.'}
                  {type === 'Hackathon' && 'Provide your Devpost/GitHub submission link and project documentation.'}
                  {type === 'Competition' && 'Provide your profile ranking and solution approach summary.'}
                  {type === 'Achievement' && 'Provide your paper PDF and research methodology abstract.'}
                </p>
              </div>

              {/* ─── CASE 1: INTERNSHIP ─── */}
              {type === 'Internship' && (
                <div className="space-y-3.5">
                  {/* Report Upload / Text Paste */}
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold flex items-center justify-between">
                      <span>1. Internship Project Report / Summary *</span>
                      <span className="text-[10px] text-indigo-600 lowercase font-mono">grounds Socratic defense</span>
                    </label>
                    <textarea
                      rows={3}
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      placeholder="Paste your project report summary, key deliverables, data architecture, or DAX / SQL queries (e.g., Star schema design, PowerBI measures, ETL pipelines, business KPIs achieved)..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none font-normal"
                    />
                    <div className="mt-1.5 flex items-center justify-between">
                      <input
                        type="file"
                        ref={reportInputRef}
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt,.pptx"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReportFileObject(file);
                            setReportFileName(file.name);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => reportInputRef.current?.click()}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{reportFileName ? `Attached: ${reportFileName}` : 'Or attach report document (.pdf, .docx)'}</span>
                      </button>
                      {reportFileName && (
                        <span className="text-[10px] text-emerald-600 font-mono font-semibold">✓ Report loaded</span>
                      )}
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      2. Internship Completion Certificate / Offer Letter *
                    </label>
                    <input
                      type="file"
                      ref={certInputRef}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCertFileObject(file);
                          setCertFileName(file.name);
                        }
                      }}
                    />
                    <div 
                      onClick={() => certInputRef.current?.click()}
                      className="p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 text-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      {certFileName ? (
                        <div className="text-xs font-mono text-emerald-600 font-semibold">
                          {certFileName} · Attached
                        </div>
                      ) : (
                        <div className="text-xs text-slate-700">Click to attach signed certificate or letter (PDF / PNG)</div>
                      )}
                    </div>
                  </div>

                  {/* Optional Live Link */}
                  <div>
                    <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                      3. Live Dashboard / Project Link (Optional)
                    </label>
                    <div className="relative">
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://app.powerbi.com/... or https://github.com/..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ─── CASE 2: PROJECT / CAPSTONE ─── */}
              {type === 'Project' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      1. Repository or Hosted Application URL *
                    </label>
                    <div className="relative">
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        required
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://github.com/username/project or https://myproject.vercel.app"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Proofly will analyze repository AST, commit history, and code complexity.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      2. Project Technical Report or Architecture Overview
                    </label>
                    <textarea
                      rows={3}
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      placeholder="Describe architectural tradeoffs, microservices boundaries, database schemas, latency targets, and key algorithms implemented..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                    />
                    <div className="mt-1.5 flex items-center justify-between">
                      <input
                        type="file"
                        ref={reportInputRef}
                        className="hidden"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setReportFileObject(file);
                            setReportFileName(file.name);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => reportInputRef.current?.click()}
                        className="text-[11px] font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{reportFileName ? `Attached: ${reportFileName}` : 'Or attach report PDF / design document'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── CASE 3: CERTIFICATE ─── */}
              {type === 'Certificate' && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      1. Official Certificate Document / Digital Badge *
                    </label>
                    <input
                      type="file"
                      ref={certInputRef}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCertFileObject(file);
                          setCertFileName(file.name);
                        }
                      }}
                    />
                    <div 
                      onClick={() => certInputRef.current?.click()}
                      className="p-4 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 text-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      {certFileName ? (
                        <div className="text-xs font-mono text-emerald-600 font-semibold">
                          {certFileName} · Attached
                        </div>
                      ) : (
                        <div className="text-xs text-slate-700">Click to attach official certificate PDF or badge image</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      2. Credential Verification URL / Certificate ID
                    </label>
                    <div className="relative">
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://www.credly.com/badges/... or verification URL"
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      3. Course Syllabus & Learning Resource Topics
                    </label>
                    <textarea
                      rows={2}
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      placeholder="List the key syllabus modules, exam competencies, or learning materials covered so Proofly's Socratic test evaluates the specific curriculum..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                    />
                  </div>
                </div>
              )}

              {/* ─── CASE 4: HACKATHON / COMPETITION / ACHIEVEMENT ─── */}
              {['Hackathon', 'Competition', 'Achievement'].includes(type) && (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      {type === 'Hackathon' && '1. Devpost / Project Submission URL'}
                      {type === 'Competition' && '1. Contest Profile / Leaderboard URL'}
                      {type === 'Achievement' && '1. Publication Link / DOI'}
                    </label>
                    <div className="relative">
                      <Link className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      {type === 'Hackathon' && '2. Submission Architecture & APIs Integrated'}
                      {type === 'Competition' && '2. Algorithmic Strategy & Complexity Approach'}
                      {type === 'Achievement' && '2. Paper Abstract & Novel Contributions'}
                    </label>
                    <textarea
                      rows={3}
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      placeholder="Outline the core methodology, data structures, algorithms, or APIs you utilized..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 leading-relaxed resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-700 uppercase tracking-wider mb-1 font-semibold">
                      3. Award Certificate or Scorecard (PDF / PNG)
                    </label>
                    <input
                      type="file"
                      ref={certInputRef}
                      className="hidden"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setCertFileObject(file);
                          setCertFileName(file.name);
                        }
                      }}
                    />
                    <div 
                      onClick={() => certInputRef.current?.click()}
                      className="p-3 rounded-xl border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 text-center cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <div className="text-xs text-slate-700">
                        {certFileName ? `${certFileName} · Attached` : 'Click to attach certificate / paper PDF'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-left">
              <div className="text-sm font-semibold text-slate-900">
                Tag Skills & Review Confidence Projection
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-wider mb-1 font-semibold">
                  Skills Proven (comma-separated)
                </label>
                <input
                  type="text"
                  value={rawSkills}
                  onChange={e => setRawSkills(e.target.value)}
                  placeholder="e.g. Python, PyTorch, Docker, C++"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-500 font-semibold">Recognized Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(parsedSkills.length > 0 ? parsedSkills : ['Python', 'Docker']).map((s, idx) => (
                    <span key={idx} className="text-xs font-mono px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-900 font-semibold">Projected Score Impact</span>
                  <span className="text-emerald-600 font-bold">+{baseWeight} base points</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Upon submission, this item enters the Faculty Review Queue for Prof. Vance. Once approved, confidence recalculates across all tagged skills.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-900 font-medium block">Direct Institutional Verification</span>
                  <span className="text-[10px] text-slate-500">Auto-verify with pre-authenticated credentials</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerifyDemo}
                  onChange={e => setAutoVerifyDemo(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
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
