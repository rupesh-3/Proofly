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
    color: '#8B7CFF',
    bgColor: '#8B7CFF18',
    borderColor: '#8B7CFF35',
    icon: FolderPlus,
    label: 'Project'
  },
  Hackathon: {
    type: 'Hackathon',
    color: '#FB923C',
    bgColor: '#FB923C18',
    borderColor: '#FB923C35',
    icon: Sparkles,
    label: 'Hackathon'
  },
  Internship: {
    type: 'Internship',
    color: '#2DD4BF',
    bgColor: '#2DD4BF18',
    borderColor: '#2DD4BF35',
    icon: Briefcase,
    label: 'Internship'
  },
  Certificate: {
    type: 'Certificate',
    color: '#38BDF8',
    bgColor: '#38BDF818',
    borderColor: '#38BDF835',
    icon: FileCheck,
    label: 'Certificate'
  },
  Competition: {
    type: 'Competition',
    color: '#F472B6',
    bgColor: '#F472B618',
    borderColor: '#F472B635',
    icon: Trophy,
    label: 'Competition'
  },
  Achievement: {
    type: 'Achievement',
    color: '#FFC773',
    bgColor: '#FFC77318',
    borderColor: '#FFC77335',
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
      <div className={`w-3.5 h-1.5 rounded-full transition-colors ${activeSegments >= 1 ? 'bg-[#8B7CFF]' : 'bg-[#1A2040]'}`} />
      <div className={`w-3.5 h-1.5 rounded-full transition-colors ${activeSegments >= 2 ? 'bg-[#8B7CFF]' : 'bg-[#1A2040]'}`} />
      <div className={`w-3.5 h-1.5 rounded-full transition-colors ${activeSegments >= 3 ? 'bg-[#8B7CFF]' : 'bg-[#1A2040]'}`} />
      <span className="text-[10px] font-mono-data text-[#8F99B8] ml-1">{level}</span>
    </div>
  );
};

// 2. Status Indicator
export const StatusIndicator: React.FC<{ status: 'verified' | 'pending' | 'rejected' | 'self-reported'; showLabel?: boolean }> = ({ status, showLabel = true }) => {
  const getStatusConfig = (st: string) => {
    switch (st) {
      case 'verified':
        return { color: '#4ADE80', bg: '#4ADE8018', border: '#4ADE8035', icon: CheckCircle2, label: 'Verified' };
      case 'pending':
        return { color: '#FFC773', bg: '#FFC77318', border: '#FFC77335', icon: Clock, label: 'Pending' };
      case 'rejected':
        return { color: '#FB7185', bg: '#FB718518', border: '#FB718535', icon: AlertTriangle, label: 'Rejected' };
      default:
        return { color: '#8F99B8', bg: '#8F99B818', border: '#8F99B835', icon: HelpCircle, label: 'Self-Reported' };
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
  color = '#8B7CFF' 
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
          stroke="rgba(255,255,255,0.08)"
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
      <span className="absolute font-mono-data font-bold text-xs" style={{ color }}>
        {Math.round(score)}
      </span>
    </div>
  );
};

// 4. Trend Sparkline (SVG)
export const TrendSparkline: React.FC<{ data?: number[]; color?: string; width?: number; height?: number }> = ({
  data = [50, 58, 62, 65, 74, 80, 86],
  color = '#4ADE80',
  width = 90,
  height = 24
}) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * width;
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

// 5. Evidence Legend
export const EvidenceLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs font-mono-data text-[#8F99B8]">
      <span className="text-[11px] uppercase tracking-wider text-[#8F99B8]">Evidence Types:</span>
      {Object.values(EVIDENCE_TYPE_STYLES).map(style => {
        const Icon = style.icon;
        return (
          <span 
            key={style.type} 
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md"
            style={{ backgroundColor: style.bgColor, color: style.color, border: `1px solid ${style.borderColor}` }}
          >
            <Icon className="w-3 h-3" />
            <span>{style.label}</span>
          </span>
        );
      })}
    </div>
  );
};

// 6. Company Avatar with Fallback
export const CompanyAvatar: React.FC<{ name: string; logoUrl?: string; size?: number }> = ({ name, logoUrl, size = 36 }) => {
  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={name} 
        className="rounded-lg object-cover bg-[#1A2040]" 
        style={{ width: size, height: size }} 
      />
    );
  }
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div 
      className="rounded-lg bg-gradient-to-br from-[#8B7CFF] to-[#2DD4BF] text-white font-mono-data font-bold flex items-center justify-center text-xs shadow-sm"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
};
