import React from 'react';
import { 
  FolderPlus, 
  Sparkles, 
  Briefcase, 
  FileCheck, 
  Trophy, 
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { EvidenceType } from '../../types';

export interface EvidenceTypeStyle {
  type: EvidenceType;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: LucideIcon;
  label: string;
}

export const EVIDENCE_TYPE_STYLES: Record<string, EvidenceTypeStyle> = {
  Project: {
    type: 'Project',
    color: '#3730A3', // indigo-800
    bgColor: '#EEF2FF', // indigo-50
    borderColor: '#C7D2FE', // indigo-200
    icon: FolderPlus,
    label: 'Project'
  },
  Hackathon: {
    type: 'Hackathon',
    color: '#92400E', // amber-800
    bgColor: '#FEF3C7', // amber-50
    borderColor: '#FDE68A', // amber-200
    icon: Sparkles,
    label: 'Hackathon'
  },
  Internship: {
    type: 'Internship',
    color: '#115E59', // teal-800
    bgColor: '#F0FDFA', // teal-50
    borderColor: '#99F6E4', // teal-200
    icon: Briefcase,
    label: 'Internship'
  },
  Certificate: {
    type: 'Certificate',
    color: '#075985', // sky-800
    bgColor: '#F0F9FF', // sky-50
    borderColor: '#BAE6FD', // sky-200
    icon: FileCheck,
    label: 'Certificate'
  },
  Competition: {
    type: 'Competition',
    color: '#6B21A8', // purple-800
    bgColor: '#FAF5FF', // purple-50
    borderColor: '#E9D5FF', // purple-200
    icon: Trophy,
    label: 'Competition'
  },
  Achievement: {
    type: 'Achievement',
    color: '#78350F', // warm-800
    bgColor: '#FFFBEB', // warm-50
    borderColor: '#FDE68A', // warm-200
    icon: Award,
    label: 'Achievement'
  }
};

export function getTypeStyle(type: EvidenceType): EvidenceTypeStyle {
  return EVIDENCE_TYPE_STYLES[type] || EVIDENCE_TYPE_STYLES.Project;
}

// 1. Level Meter (3 segments: Beginner, Intermediate, Advanced)
export const LevelMeter: React.FC<{ level: 'Beginner' | 'Intermediate' | 'Advanced' }> = ({ level }) => {
  const activeSegments = level === 'Beginner' ? 1 : level === 'Intermediate' ? 2 : 3;
  return (
    <div className="flex items-center gap-1.5" title={`Skill Level: ${level}`}>
      <div className={`w-3.5 h-1.5 rounded-full transition-colors ${activeSegments >= 1 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      <div className={`w-3.5 h-1.5 rounded-full transition-colors ${activeSegments >= 2 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      <div className={`w-3.5 h-1.5 rounded-full transition-colors ${activeSegments >= 3 ? 'bg-slate-900' : 'bg-slate-200'}`} />
      <span className="text-[10px] font-mono-data text-slate-500 ml-1">{level}</span>
    </div>
  );
};

// 2. Status Indicator
export const StatusIndicator: React.FC<{ status: 'verified' | 'pending' | 'rejected' | 'self-reported'; showLabel?: boolean }> = ({ status, showLabel = true }) => {
  const getStatusConfig = (st: string) => {
    switch (st) {
      case 'verified':
        return { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', icon: CheckCircle2, label: 'Verified' };
      case 'pending':
        return { color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', icon: Clock, label: 'Pending Review' };
      case 'rejected':
        return { color: '#9F1239', bg: '#FFF1F2', border: '#FECDD3', icon: AlertTriangle, label: 'Needs Revision' };
      default:
        return { color: '#475569', bg: '#F1F5F9', border: '#CBD5E1', icon: HelpCircle, label: 'Self-Reported' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  return (
    <span 
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-data font-semibold"
      style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

// 3. Animated Score Ring (SVG circle gauge)
export const ScoreRing: React.FC<{ score: number; size?: number; strokeWidth?: number; color?: string }> = ({ 
  score, 
  size = 52, 
  strokeWidth = 4, 
  color = '#2563EB' 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <span className="absolute font-mono-data font-bold text-xs text-slate-800">
        {Math.round(score)}
      </span>
    </div>
  );
};

// 4. Trend Sparkline
export const TrendSparkline: React.FC<{ data: number[]; width?: number; height?: number; color?: string }> = ({
  data,
  width = 72,
  height = 24,
  color = '#2563EB'
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((val, idx) => {
    const x = idx * stepX;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

// 5. Company Avatar
export const CompanyAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 36 }) => {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  return (
    <div 
      className="rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs font-mono-data shrink-0"
      style={{ width: size, height: size }}
      title={name}
    >
      {initials || 'CO'}
    </div>
  );
};

// 6. Evidence Legend
export const EvidenceLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
      {Object.values(EVIDENCE_TYPE_STYLES).map(st => (
        <span key={st.type} className="inline-flex items-center gap-1.5 text-slate-600">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
          <span>{st.label}</span>
        </span>
      ))}
    </div>
  );
};
