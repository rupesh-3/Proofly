import React, { createContext, useContext, useState, useMemo } from 'react';
import { 
  User, 
  Evidence, 
  Skill, 
  Project, 
  Opportunity, 
  Application, 
  ProjectProposal, 
  InAppNotification,
  UserRole,
  ApplicationStatus,
  MatchResult,
  SimilarityResult,
  EvidenceType
} from '../types';
import { 
  MOCK_USERS, 
  MOCK_EVIDENCES, 
  INSTITUTIONAL_PROJECT_ARCHIVE, 
  MOCK_OPPORTUNITIES, 
  MOCK_APPLICATIONS, 
  MOCK_PROPOSALS, 
  MOCK_NOTIFICATIONS 
} from '../data/mockData';
import { 
  normalizeSkillName, 
  calculateSkillConfidence, 
  calculateProofStrength, 
  ProofStrengthResult,
  calculateOpportunityMatch,
  calculateProjectSimilarity,
  ProjectInput,
  canTransitionApplication
} from '../lib/logic';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Current user & authentication
  currentUser: User;
  allUsers: User[];
  currentRole: UserRole;
  switchUser: (userId: string) => void;
  updateCurrentUserProfile: (updates: Partial<User>) => void;

  // Active view/navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Evidences & Skills (Reactive)
  evidences: Evidence[];
  studentEvidences: Evidence[];
  studentSkills: Skill[];
  proofStrength: ProofStrengthResult;
  addEvidence: (newEvidence: Omit<Evidence, 'id' | 'studentId' | 'verificationStatus'>, autoVerify?: boolean) => Evidence;
  verifyEvidence: (evidenceId: string, verifierName: string) => void;
  rejectEvidence: (evidenceId: string, reason: string) => void;

  // Institutional Projects & Proposals
  institutionalProjects: Project[];
  proposals: ProjectProposal[];
  submitProposal: (proposalInput: ProjectInput) => ProjectProposal;
  reviewProposal: (proposalId: string, status: 'approved' | 'changes_requested' | 'flagged', feedback: string) => void;
  checkProjectSimilarity: (input: ProjectInput) => SimilarityResult[];

  // Opportunities & Applications
  opportunities: Opportunity[];
  studentApplications: Application[];
  opportunityMatches: Record<string, MatchResult>;
  applyForOpportunity: (opportunityId: string) => void;
  updateApplicationStatus: (applicationId: string, newStatus: ApplicationStatus, note?: string) => boolean;
  createOpportunity: (newOpp: Omit<Opportunity, 'id' | 'applicantCount' | 'status'>) => Opportunity;

  // Notifications
  notifications: InAppNotification[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Global search & command palette
  isCommandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Confetti trigger
  triggerCelebration: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users & Role state
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('std-1'); // Default to Alex Rivera
  const currentUser = useMemo(() => {
    return allUsers.find(u => u.id === currentUserId) || allUsers[0];
  }, [allUsers, currentUserId]);

  const currentRole = currentUser.role;

  // Active navigation tab: Default to Dashboard, redirect overview/landing/applications to dashboard
  const [activeTab, _setActiveTab] = useState<string>('dashboard');

  const setActiveTab = (tab: string) => {
    if (tab === 'landing' || tab === 'applications') {
      _setActiveTab('dashboard');
    } else {
      _setActiveTab(tab);
    }
  };

  // Data states
  const [evidences, setEvidences] = useState<Evidence[]>(MOCK_EVIDENCES);
  const [institutionalProjects, setInstitutionalProjects] = useState<Project[]>(INSTITUTIONAL_PROJECT_ARCHIVE);
  const [proposals, setProposals] = useState<ProjectProposal[]>(MOCK_PROPOSALS);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [applications, setApplications] = useState<Application[]>(MOCK_APPLICATIONS);
  const [notifications, setNotifications] = useState<InAppNotification[]>(MOCK_NOTIFICATIONS);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Switch active user
  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      // Route appropriately if currently on a role-specific page
      if (user.role === 'student' && (activeTab === 'faculty' || activeTab === 'placement')) {
        _setActiveTab('dashboard');
      } else if (user.role === 'faculty') {
        _setActiveTab('faculty');
      } else if (user.role === 'placement') {
        _setActiveTab('placement');
      }
    }
  };

  const updateCurrentUserProfile = (updates: Partial<User>) => {
    setAllUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u));
  };

  // Student specific evidences
  const studentEvidences = useMemo(() => {
    return evidences.filter(e => e.studentId === currentUser.id);
  }, [evidences, currentUser.id]);

  // Derived Skills for the active student using exact logic layer
  const studentSkills = useMemo(() => {
    const rawSkillsMap = new Map<string, { canonical: string; category: any; evidenceIds: string[] }>();

    studentEvidences.forEach(ev => {
      ev.skillsTagged.forEach(rawTag => {
        const { canonical, category } = normalizeSkillName(rawTag);
        const key = canonical.toLowerCase();
        if (!rawSkillsMap.has(key)) {
          rawSkillsMap.set(key, { canonical, category, evidenceIds: [] });
        }
        rawSkillsMap.get(key)!.evidenceIds.push(ev.id);
      });
    });

    const skillsList: Skill[] = [];
    rawSkillsMap.forEach((val) => {
      const breakdown = calculateSkillConfidence(val.canonical, studentEvidences);
      skillsList.push({
        id: `skill-${val.canonical.toLowerCase().replace(/\s+/g, '-')}`,
        canonicalName: val.canonical,
        category: val.category,
        confidence: breakdown.confidence,
        level: breakdown.level,
        evidenceIds: val.evidenceIds,
      });
    });

    // Sort descending by confidence
    return skillsList.sort((a, b) => b.confidence - a.confidence);
  }, [studentEvidences]);

  // Derived Proof Strength
  const proofStrength = useMemo(() => {
    return calculateProofStrength(studentSkills, studentEvidences);
  }, [studentSkills, studentEvidences]);

  // Derived student applications
  const studentApplications = useMemo(() => {
    return applications.filter(a => a.studentId === currentUser.id);
  }, [applications, currentUser.id]);

  // Opportunity matches for the student
  const studentSummary = useMemo(() => {
    return `${currentUser.headline}. ${currentUser.bio}. Skills: ${studentSkills.map(s => s.canonicalName).join(', ')}.`;
  }, [currentUser, studentSkills]);

  const opportunityMatches = useMemo(() => {
    const map: Record<string, MatchResult> = {};
    opportunities.forEach(opp => {
      map[opp.id] = calculateOpportunityMatch(opp, studentSkills, studentEvidences, studentSummary);
    });
    return map;
  }, [opportunities, studentSkills, studentEvidences, studentSummary]);

  // Confetti effect helper
  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#7C8CFF', '#2DD4BF', '#4ADE80', '#FFFFFF']
      });
    } catch {
      // Fallback safe
    }
  };

  // Add evidence
  const addEvidence = (
    newEv: Omit<Evidence, 'id' | 'studentId' | 'verificationStatus'>,
    autoVerify: boolean = false
  ): Evidence => {
    const id = `ev-${Date.now()}`;
    const evidenceItem: Evidence = {
      ...newEv,
      id,
      studentId: currentUser.id,
      verificationStatus: autoVerify ? 'verified' : 'pending',
      verifiedBy: autoVerify ? 'Institutional Verification Service' : undefined,
      verifiedAt: autoVerify ? new Date().toISOString().split('T')[0] : undefined,
    };

    setEvidences(prev => [evidenceItem, ...prev]);

    // If student, create notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Evidence Submitted for Verification',
        message: `"${newEv.title}" was submitted to Faculty Review Queue.`,
        type: 'info',
        timestamp: 'Just now',
        read: false,
        linkTab: 'profile'
      },
      ...prev
    ]);

    if (autoVerify) {
      triggerCelebration();
    }

    return evidenceItem;
  };

  // Verify evidence (Faculty action)
  const verifyEvidence = (evidenceId: string, verifierName: string) => {
    setEvidences(prev => prev.map(ev => {
      if (ev.id === evidenceId) {
        return {
          ...ev,
          verificationStatus: 'verified',
          verifiedBy: verifierName,
          verifiedAt: new Date().toISOString().split('T')[0],
          rejectionReason: undefined
        };
      }
      return ev;
    }));

    // Find the student ID of this evidence to notify them
    const targetEv = evidences.find(e => e.id === evidenceId);
    if (targetEv) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetEv.studentId,
          title: 'Evidence Verified by Faculty!',
          message: `Prof. Vance verified "${targetEv.title}". Your skill confidence scores have updated.`,
          type: 'verification',
          timestamp: 'Just now',
          read: false,
          linkTab: 'profile'
        },
        ...prev
      ]);
    }

    triggerCelebration();
  };

  // Reject evidence (Faculty action)
  const rejectEvidence = (evidenceId: string, reason: string) => {
    setEvidences(prev => prev.map(ev => {
      if (ev.id === evidenceId) {
        return {
          ...ev,
          verificationStatus: 'rejected',
          rejectionReason: reason,
        };
      }
      return ev;
    }));

    const targetEv = evidences.find(e => e.id === evidenceId);
    if (targetEv) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: targetEv.studentId,
          title: 'Verification Action: Clarification Required',
          message: `Prof. Vance requested revisions on "${targetEv.title}": "${reason}"`,
          type: 'info',
          timestamp: 'Just now',
          read: false,
          linkTab: 'profile'
        },
        ...prev
      ]);
    }
  };

  // Submit project proposal
  const submitProposal = (proposalInput: ProjectInput): ProjectProposal => {
    const similarityResults = calculateProjectSimilarity(proposalInput, institutionalProjects);
    
    const newProposal: ProjectProposal = {
      id: `prop-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      title: proposalInput.title,
      domain: proposalInput.domain,
      problem: proposalInput.problem,
      technology: proposalInput.technology,
      methodology: proposalInput.methodology,
      description: proposalInput.description,
      submittedAt: new Date().toISOString(),
      status: 'pending',
      similarityMatches: similarityResults.map(r => ({
        matchedProjectId: r.matchedProjectId,
        matchedTitle: r.matchedProjectTitle,
        matchedAuthor: `${r.matchedStudentName} (${r.matchedYear})`,
        overallSimilarity: r.overallScore,
        breakdown: {
          domain: r.dimensions.domainScore,
          problem: r.dimensions.problemScore,
          technology: r.dimensions.technologyScore,
          methodology: r.dimensions.methodologyScore
        }
      }))
    };

    setProposals(prev => [newProposal, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Project Proposal Dispatched',
        message: `"${proposalInput.title}" analyzed for institutional originality and queued for faculty review.`,
        type: 'info',
        timestamp: 'Just now',
        read: false,
        linkTab: 'faculty'
      },
      ...prev
    ]);

    return newProposal;
  };

  // Review proposal (Faculty action)
  const reviewProposal = (
    proposalId: string, 
    status: 'approved' | 'changes_requested' | 'flagged', 
    feedback: string
  ) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId) {
        return {
          ...p,
          status,
          feedback,
          reviewedBy: currentUser.name,
          reviewedAt: new Date().toISOString()
        };
      }
      return p;
    }));

    const prop = proposals.find(p => p.id === proposalId);
    if (prop) {
      setNotifications(prev => [
        {
          id: `notif-${Date.now()}`,
          userId: prop.studentId,
          title: `Proposal Status: ${status === 'approved' ? 'Approved' : status === 'flagged' ? 'Overlap Flagged' : 'Changes Requested'}`,
          message: `${currentUser.name} reviewed "${prop.title}": ${feedback || 'Review completed.'}`,
          type: 'info',
          timestamp: 'Just now',
          read: false
        },
        ...prev
      ]);
    }
  };

  // Check project similarity
  const checkProjectSimilarity = (input: ProjectInput): SimilarityResult[] => {
    return calculateProjectSimilarity(input, institutionalProjects);
  };

  // Apply for opportunity
  const applyForOpportunity = (opportunityId: string) => {
    const existing = applications.find(a => a.opportunityId === opportunityId && a.studentId === currentUser.id);
    if (existing) {
      if (existing.status === 'Saved') {
        updateApplicationStatus(existing.id, 'Applied', 'Candidate formally submitted verified profile.');
      }
      return;
    }

    const newApp: Application = {
      id: `app-${Date.now()}`,
      opportunityId,
      studentId: currentUser.id,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      updatedDate: new Date().toISOString().split('T')[0],
      history: [
        {
          status: 'Applied',
          timestamp: new Date().toISOString(),
          note: 'Profile with verified skill evidence chain submitted.'
        }
      ]
    };

    setApplications(prev => [newApp, ...prev]);

    // Increment opportunity applicant count
    setOpportunities(prev => prev.map(opp => {
      if (opp.id === opportunityId) {
        return { ...opp, applicantCount: opp.applicantCount + 1 };
      }
      return opp;
    }));

    triggerCelebration();

    const opp = opportunities.find(o => o.id === opportunityId);
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: 'Application Dispatched!',
        message: `Your verified profile was submitted to ${opp?.company || 'Company'}.`,
        type: 'application',
        timestamp: 'Just now',
        read: false,
        linkTab: 'opportunities'
      },
      ...prev
    ]);
  };

  // Update application status
  const updateApplicationStatus = (
    applicationId: string, 
    newStatus: ApplicationStatus, 
    note?: string
  ): boolean => {
    let success = false;
    setApplications(prev => prev.map(app => {
      if (app.id === applicationId) {
        if (!canTransitionApplication(app.status, newStatus)) {
          console.warn(`Disallowed transition from ${app.status} to ${newStatus}`);
          return app;
        }
        success = true;
        const newHistory = [
          ...app.history,
          {
            status: newStatus,
            timestamp: new Date().toISOString(),
            note: note || `Status transitioned to ${newStatus}`
          }
        ];
        return {
          ...app,
          status: newStatus,
          updatedDate: new Date().toISOString().split('T')[0],
          history: newHistory,
        };
      }
      return app;
    }));

    if (newStatus === 'Offer') {
      triggerCelebration();
    }

    return success;
  };

  // Create new opportunity (Placement officer action)
  const createOpportunity = (
    newOpp: Omit<Opportunity, 'id' | 'applicantCount' | 'status'>
  ): Opportunity => {
    const opp: Opportunity = {
      ...newOpp,
      id: `opp-${Date.now()}`,
      applicantCount: 0,
      status: 'open',
    };

    setOpportunities(prev => [opp, ...prev]);
    return opp;
  };

  // Notification management
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        currentRole,
        switchUser,
        updateCurrentUserProfile,
        activeTab,
        setActiveTab,
        evidences,
        studentEvidences,
        studentSkills,
        proofStrength,
        addEvidence,
        verifyEvidence,
        rejectEvidence,
        institutionalProjects,
        proposals,
        submitProposal,
        reviewProposal,
        checkProjectSimilarity,
        opportunities,
        studentApplications,
        opportunityMatches,
        applyForOpportunity,
        updateApplicationStatus,
        createOpportunity,
        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        isCommandPaletteOpen,
        setCommandPaletteOpen,
        triggerCelebration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
