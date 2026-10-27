export type UserRole = 'student' | 'faculty' | 'placement';

export type SkillCategory = 
  | 'Programming' 
  | 'ML/AI' 
  | 'Data' 
  | 'Cloud' 
  | 'Embedded/IoT' 
  | 'Design' 
  | 'Communication' 
  | 'Leadership';

export type EvidenceType = 
  | 'Internship' 
  | 'Project' 
  | 'Hackathon' 
  | 'Competition' 
  | 'Certificate' 
  | 'Achievement' 
  | 'Self-claim';

export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'self-reported';

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  college: string;
  department: string;
  headline: string;
  bio: string;
  github?: string;
  linkedin?: string;
  website?: string;
  batch?: string;
  isVerifiedStudent?: boolean;
  publicProfileSettings?: {
    showProofScore: boolean;
    showGpa: boolean;
    showCertificates: boolean;
    allowDirectInquiries: boolean;
  };
}

export interface Evidence {
  id: string;
  studentId: string;
  title: string;
  type: EvidenceType;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  url?: string;
  fileName?: string;
  fileSize?: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string; // Faculty name
  verifiedAt?: string;
  rejectionReason?: string;
  skillsTagged: string[];
  metrics?: string;
  organizationOrEvent?: string;
}

export interface Skill {
  id: string;
  canonicalName: string;
  category: SkillCategory;
  confidence: number; // 0-100
  level: SkillLevel;
  evidenceIds: string[];
}

export interface Project {
  id: string;
  studentId: string;
  studentName?: string;
  title: string;
  description: string;
  domain: string;
  problem: string;
  technology: string[];
  methodology: string[];
  metrics: string;
  githubUrl?: string;
  liveUrl?: string;
  verified: boolean;
  facultyVerifier?: string;
  date: string;
  similarityChecked?: boolean;
  institutionalOverlapScore?: number;
}

export interface ProjectProposal {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  domain: string;
  problem: string;
  technology: string[];
  methodology: string[];
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'changes_requested' | 'flagged';
  feedback?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  similarityMatches?: {
    matchedProjectId: string;
    matchedTitle: string;
    matchedAuthor: string;
    overallSimilarity: number;
    breakdown: {
      domain: number;
      problem: number;
      technology: number;
      methodology: number;
    };
  }[];
}

export interface RequiredSkill {
  skillName: string;
  weight: number; // 1 to 5
}

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  logo?: string;
  type: 'internship' | 'full-time' | 'research';
  location: string;
  workplaceType: 'Remote' | 'Hybrid' | 'On-site';
  stipendOrSalary: string;
  deadline: string;
  description: string;
  requiredSkills: RequiredSkill[];
  postedBy: string;
  status: 'open' | 'closed';
  applicantCount: number;
}

export type ApplicationStatus = 
  | 'Saved' 
  | 'Applied' 
  | 'Shortlisted' 
  | 'Interview' 
  | 'Offer' 
  | 'Rejected';

export interface ApplicationHistoryItem {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  studentId: string;
  status: ApplicationStatus;
  appliedDate: string;
  updatedDate: string;
  history: ApplicationHistoryItem[];
}

export interface SimilarityResult {
  overallScore: number;
  semanticScore: number;
  structuralScore: number;
  dimensions: {
    domainScore: number;
    problemScore: number;
    technologyScore: number;
    methodologyScore: number;
  };
  explanation: string;
  matchedProjectId: string;
  matchedProjectTitle: string;
  matchedStudentName: string;
  matchedYear: string;
  level: 'High' | 'Moderate' | 'Low';
}

export interface MatchResult {
  opportunityId: string;
  score: number; // 0-100
  structuralSkillFit: number;
  semanticFit: number;
  evidenceStrength: number;
  youHave: {
    skillName: string;
    confidence: number;
    evidenceCount: number;
  }[];
  youNeed: {
    skillName: string;
    weight: number;
    gapScore: number;
  }[];
  whyMatched: string[];
  nextBestAction: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'verification' | 'match' | 'application' | 'info';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}
