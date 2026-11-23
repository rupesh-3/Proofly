import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
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
import { useAuth } from './AuthContext';
import { insertEvidence, getStudentEvidence, getAllEvidence } from '../data/supabase/evidence';
import { getAllProfiles, updateProfile } from '../data/supabase/profiles';
import { getOpportunities, getStudentApplications } from '../data/supabase/opportunities';
import { submitVerification } from '../data/supabase/verifications';
import { embedEvidence, checkProjectSimilarity as checkProjectSimilarityAI } from '../data/ai';
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
  addEvidence: (
    newEvidence: Omit<Evidence, 'id' | 'studentId' | 'verificationStatus'>, 
    autoVerify?: boolean,
    file?: File
  ) => Promise<Evidence> | Evidence;
  verifyEvidence: (evidenceId: string, verifierName: string) => void;
  rejectEvidence: (evidenceId: string, reason: string) => void;
  updateEvidence: (evidenceId: string, updates: Partial<Evidence>) => void;

  // Institutional Projects & Proposals
  institutionalProjects: Project[];
  proposals: ProjectProposal[];
  submitProposal: (proposalInput: ProjectInput) => ProjectProposal;
  reviewProposal: (proposalId: string, status: 'approved' | 'changes_requested' | 'flagged', feedback: string) => void;
  checkProjectSimilarity: (input: ProjectInput) => Promise<SimilarityResult[]> | SimilarityResult[];

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
  const auth = useAuth();

  // Users & Role state (initialized empty, populated from Supabase)
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // Fetch real user profiles from Supabase
  useEffect(() => {
    if (auth.isConfigured) {
      getAllProfiles()
        .then(profiles => {
          if (profiles && profiles.length > 0) {
            setAllUsers(profiles);
          }
        })
        .catch(err => {
          console.warn('[AppContext] Could not fetch Supabase profiles:', err);
        });
    }
  }, [auth.isConfigured, auth.user?.id]);

  // Derive active user strictly from Supabase auth profile
  const currentUser: User = useMemo(() => {
    if (auth.profile) {
      return {
        id: auth.profile.id,
        name: auth.profile.full_name || auth.user?.email?.split('@')[0] || 'Member',
        email: auth.user?.email || '',
        role: (auth.profile.role as UserRole) || 'student',
        avatar: auth.profile.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80`,
        college: auth.profile.college || 'Institutional Campus',
        department: auth.profile.department || 'Academic Department',
        headline: auth.profile.headline || 'Verified Scholar',
        bio: auth.profile.bio || '',
        batch: auth.profile.batch ? `Class of ${auth.profile.batch}` : 'Class of 2026',
        isVerifiedStudent: true,
      };
    }
    if (auth.user) {
      return {
        id: auth.user.id,
        name: auth.user.email?.split('@')[0] || 'Member',
        email: auth.user.email || '',
        role: 'student' as UserRole,
        avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80`,
        college: 'Institutional Campus',
        department: 'Academic Department',
        headline: 'Verified Scholar',
        bio: '',
        batch: 'Class of 2026',
        isVerifiedStudent: true,
      };
    }
    return {
      id: '',
      name: 'Campus Scholar',
      email: '',
      role: 'student' as UserRole,
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80`,
      college: 'Institutional Campus',
      department: 'Academic Department',
      headline: 'Institutional Scholar',
      bio: '',
      batch: '',
      isVerifiedStudent: false,
    };
  }, [auth.profile, auth.user]);

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

  // Data states (initialized empty for live data)
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [institutionalProjects, setInstitutionalProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<ProjectProposal[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  // Fetch real opportunities from Supabase
  useEffect(() => {
    if (auth.isConfigured) {
      getOpportunities()
        .then(opps => {
          if (opps && opps.length > 0) {
            setOpportunities(opps);
          }
        })
        .catch(err => {
          console.warn('[AppContext] Could not fetch Supabase opportunities:', err);
        });
    }
  }, [auth.isConfigured]);

  // Switch active user
  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUserId(userId);
      if (user.role === 'student' && (activeTab === 'faculty' || activeTab === 'placement')) {
        _setActiveTab('dashboard');
      } else if (user.role === 'faculty') {
        _setActiveTab('faculty');
      } else if (user.role === 'placement') {
        _setActiveTab('placement');
      }
    }
  };

  const updateCurrentUserProfile = async (updates: Partial<User>) => {
    setAllUsers(prev => {
      const exists = prev.some(u => u.id === currentUser.id);
      if (exists) {
        return prev.map(u => u.id === currentUser.id ? { ...u, ...updates } : u);
      } else {
        return [{ ...currentUser, ...updates }, ...prev];
      }
    });

    if (auth.user?.id) {
      try {
        await updateProfile(auth.user.id, {
          full_name: updates.name,
          headline: updates.headline,
          bio: updates.bio,
          department: updates.department,
          college: updates.college,
          github_url: updates.github,
          linkedin_url: updates.linkedin,
          website_url: updates.website,
        });
        await auth.refreshProfile();
      } catch (e) {
        console.warn('[AppContext] Could not update profile in Supabase:', e);
      }
    }
  };

  // Fetch real evidence and applications from Supabase when authenticated
  React.useEffect(() => {
    if (auth.isConfigured && auth.user?.id) {
      const role = auth.profile?.role;
      if (role === 'faculty' || role === 'placement') {
        getAllEvidence()
          .then((realEvs: Evidence[]) => {
            if (realEvs) setEvidences(realEvs);
          })
          .catch((err: any) => console.warn('[AppContext] Could not fetch all evidence:', err));
      } else {
        getStudentEvidence(auth.user.id)
          .then((realEvs: Evidence[]) => {
            if (realEvs) setEvidences(realEvs);
          })
          .catch((err: any) => {
            console.warn('[AppContext] Could not fetch Supabase evidence:', err);
          });

        getStudentApplications(auth.user.id)
          .then((realApps: Application[]) => {
            if (realApps) setApplications(realApps);
          })
          .catch((err: any) => {
            console.warn('[AppContext] Could not fetch Supabase applications:', err);
          });
      }
    }
  }, [auth.isConfigured, auth.user?.id, auth.profile?.role]);

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

  // Add evidence (persists to Supabase + uploads file + requests FastAPI embedding)
  const addEvidence = async (
    newEv: Omit<Evidence, 'id' | 'studentId' | 'verificationStatus'>,
    autoVerify: boolean = false,
    file?: File
  ): Promise<Evidence> => {
    const tempId = `ev-${Date.now()}`;
    let evidenceItem: Evidence = {
      ...newEv,
      id: tempId,
      studentId: currentUser.id,
      verificationStatus: autoVerify ? 'verified' : 'pending',
      verifiedBy: autoVerify ? 'Institutional Verification Service' : undefined,
      verifiedAt: autoVerify ? new Date().toISOString().split('T')[0] : undefined,
      fileName: file ? file.name : newEv.fileName,
      fileSize: file ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : newEv.fileSize,
    };

    // If authenticated with Supabase account, persist to database
    if (auth.isConfigured && auth.user?.id) {
      try {
        const saved = await insertEvidence(auth.user.id, newEv, file);
        evidenceItem = {
          ...saved,
          verificationStatus: autoVerify ? 'verified' : saved.verificationStatus,
          verifiedBy: autoVerify ? 'Institutional Verification Service' : saved.verifiedBy,
        };

        // Asynchronously request AI service to compute and store embedding vector
        embedEvidence(saved.id, saved.title, saved.description).catch(err => {
          console.info('[embedEvidence] FastAPI note:', err?.message || err);
        });
      } catch (err: any) {
        console.warn('[addEvidence] Supabase insert note:', err?.message || err);
      }
    }

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

  // Verify evidence (Faculty action - updates local state + writes to Supabase verifications table)
  const verifyEvidence = async (evidenceId: string, verifierName: string) => {
    // If authenticated in Supabase, submit verification record to Postgres
    if (auth.isConfigured && auth.user?.id) {
      try {
        await submitVerification({
          evidenceId,
          verifierId: auth.user.id,
          decision: 'verified',
          checkedExists: true,
          checkedAuthorship: true,
          checkedQuality: true,
          remarks: `Attested and verified by ${verifierName}`,
        });
      } catch (err: any) {
        console.warn('[verifyEvidence] Supabase note:', err?.message || err);
      }
    }

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
          message: `${verifierName} verified "${targetEv.title}". Your skill confidence scores have updated.`,
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

  // Update evidence fields (e.g. Socratic defense results, IRT score, attestation)
  const updateEvidence = (evidenceId: string, updates: Partial<Evidence>) => {
    setEvidences(prev => prev.map(ev => {
      if (ev.id === evidenceId) {
        return { ...ev, ...updates };
      }
      return ev;
    }));
  };

  // Reject evidence (Faculty action - updates local state + writes to Supabase verifications table)
  const rejectEvidence = async (evidenceId: string, reason: string) => {
    // If authenticated in Supabase, submit decision to Postgres
    if (auth.isConfigured && auth.user?.id) {
      try {
        await submitVerification({
          evidenceId,
          verifierId: auth.user.id,
          decision: 'rejected',
          remarks: reason,
        });
      } catch (err: any) {
        console.warn('[rejectEvidence] Supabase note:', err?.message || err);
      }
    }

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
          message: `Revisions requested on "${targetEv.title}": "${reason}"`,
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

  // Check project similarity (FastAPI pgvector AI service with fallback)
  const checkProjectSimilarity = async (input: ProjectInput): Promise<SimilarityResult[]> => {
    try {
      const aiResult = await checkProjectSimilarityAI(
        input.title,
        `${input.domain}. ${input.problem}. ${input.description}`
      );
      if (aiResult?.matches && aiResult.matches.length > 0) {
        return aiResult.matches.map(m => {
          const overallScore = Math.round(m.score);
          let level: 'High' | 'Moderate' | 'Low' = 'Low';
          if (overallScore >= 80) level = 'High';
          else if (overallScore >= 50) level = 'Moderate';

          return {
            overallScore,
            semanticScore: Math.round(m.semantic_score),
            structuralScore: Math.round(m.structural_score),
            dimensions: {
              domainScore: Math.round(m.structural_score),
              problemScore: Math.round(m.semantic_score),
              technologyScore: Math.round(m.structural_score),
              methodologyScore: Math.round(m.structural_score),
            },
            explanation: `Institutional overlap detected via 384-dim pgvector cosine similarity against verified departmental archive. ${m.score >= 70 ? 'High similarity found.' : 'Clear originality profile.'}`,
            matchedProjectId: m.project_id,
            matchedProjectTitle: m.title,
            matchedStudentName: m.student_name,
            matchedYear: '2025',
            level,
          };
        });
      }
    } catch (err: any) {
      console.info('[checkProjectSimilarity] FastAPI AI service note:', err?.message || err);
    }

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
        updateEvidence,
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
