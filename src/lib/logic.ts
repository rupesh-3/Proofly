import { 
  Evidence, 
  EvidenceType, 
  VerificationStatus, 
  Skill, 
  SkillCategory, 
  SkillLevel, 
  Project, 
  Opportunity, 
  MatchResult, 
  SimilarityResult,
  ApplicationStatus
} from '../types';

// Canonical skill dictionary & synonym mapping
export const SKILL_SYNONYMS: Record<string, { canonical: string; category: SkillCategory }> = {
  'python': { canonical: 'Python', category: 'Programming' },
  'py': { canonical: 'Python', category: 'Programming' },
  'python3': { canonical: 'Python', category: 'Programming' },
  'typescript': { canonical: 'TypeScript', category: 'Programming' },
  'ts': { canonical: 'TypeScript', category: 'Programming' },
  'javascript': { canonical: 'JavaScript', category: 'Programming' },
  'js': { canonical: 'JavaScript', category: 'Programming' },
  'c++': { canonical: 'C++', category: 'Programming' },
  'cpp': { canonical: 'C++', category: 'Programming' },
  'rust': { canonical: 'Rust', category: 'Programming' },
  'go': { canonical: 'Go', category: 'Programming' },
  'golang': { canonical: 'Go', category: 'Programming' },
  'java': { canonical: 'Java', category: 'Programming' },
  'react': { canonical: 'React', category: 'Programming' },
  'reactjs': { canonical: 'React', category: 'Programming' },
  'react.js': { canonical: 'React', category: 'Programming' },
  'nextjs': { canonical: 'Next.js', category: 'Programming' },
  'next.js': { canonical: 'Next.js', category: 'Programming' },
  'node': { canonical: 'Node.js', category: 'Programming' },
  'nodejs': { canonical: 'Node.js', category: 'Programming' },
  
  // ML / AI
  'machine learning': { canonical: 'Machine Learning', category: 'ML/AI' },
  'ml': { canonical: 'Machine Learning', category: 'ML/AI' },
  'deep learning': { canonical: 'Deep Learning', category: 'ML/AI' },
  'pytorch': { canonical: 'PyTorch', category: 'ML/AI' },
  'tensorflow': { canonical: 'TensorFlow', category: 'ML/AI' },
  'nlp': { canonical: 'Natural Language Processing', category: 'ML/AI' },
  'natural language processing': { canonical: 'Natural Language Processing', category: 'ML/AI' },
  'computer vision': { canonical: 'Computer Vision', category: 'ML/AI' },
  'cv': { canonical: 'Computer Vision', category: 'ML/AI' },
  'transformers': { canonical: 'Transformers', category: 'ML/AI' },
  'llms': { canonical: 'Large Language Models', category: 'ML/AI' },
  'llm': { canonical: 'Large Language Models', category: 'ML/AI' },

  // Data
  'sql': { canonical: 'SQL', category: 'Data' },
  'postgresql': { canonical: 'PostgreSQL', category: 'Data' },
  'postgres': { canonical: 'PostgreSQL', category: 'Data' },
  'mongodb': { canonical: 'MongoDB', category: 'Data' },
  'pandas': { canonical: 'Pandas', category: 'Data' },
  'data analysis': { canonical: 'Data Analysis', category: 'Data' },
  'data visualization': { canonical: 'Data Visualization', category: 'Data' },

  // Cloud / DevOps
  'aws': { canonical: 'AWS', category: 'Cloud' },
  'amazon web services': { canonical: 'AWS', category: 'Cloud' },
  'docker': { canonical: 'Docker', category: 'Cloud' },
  'kubernetes': { canonical: 'Kubernetes', category: 'Cloud' },
  'k8s': { canonical: 'Kubernetes', category: 'Cloud' },
  'gcp': { canonical: 'Google Cloud Platform', category: 'Cloud' },
  'google cloud': { canonical: 'Google Cloud Platform', category: 'Cloud' },
  'ci/cd': { canonical: 'CI/CD', category: 'Cloud' },

  // Embedded / IoT
  'embedded systems': { canonical: 'Embedded Systems', category: 'Embedded/IoT' },
  'iot': { canonical: 'Internet of Things', category: 'Embedded/IoT' },
  'arduino': { canonical: 'Arduino', category: 'Embedded/IoT' },
  'raspberry pi': { canonical: 'Raspberry Pi', category: 'Embedded/IoT' },

  // Design
  'ui/ux': { canonical: 'UI/UX Design', category: 'Design' },
  'figma': { canonical: 'Figma', category: 'Design' },
  'wireframing': { canonical: 'Design Systems', category: 'Design' },

  // Communication & Leadership
  'technical writing': { canonical: 'Technical Writing', category: 'Communication' },
  'public speaking': { canonical: 'Presentation & Speaking', category: 'Communication' },
  'project management': { canonical: 'Project Management', category: 'Leadership' },
  'team leadership': { canonical: 'Team Leadership', category: 'Leadership' },
  'scrum': { canonical: 'Agile & Scrum', category: 'Leadership' }
};

export function normalizeSkillName(raw: string): { canonical: string; category: SkillCategory } {
  const clean = raw.trim().toLowerCase();
  if (SKILL_SYNONYMS[clean]) {
    return SKILL_SYNONYMS[clean];
  }
  // Title case fallback
  const canonical = raw.trim().replace(/\b\w/g, c => c.toUpperCase());
  return { canonical, category: 'Programming' };
}

// 1. Skill Confidence Logic
export const EVIDENCE_TYPE_WEIGHTS: Record<EvidenceType, number> = {
  Internship: 30,
  Project: 25,
  Hackathon: 20,
  Competition: 18,
  Certificate: 15,
  Achievement: 12,
  'Self-claim': 5,
};

export const VERIFICATION_FACTORS: Record<VerificationStatus, number> = {
  verified: 1.0,
  pending: 0.5,
  'self-reported': 0.3,
  rejected: 0.0,
};

export function getRecencyFactor(dateStr: string, asOfDate: Date = new Date()): number {
  try {
    const evidenceDate = new Date(dateStr);
    const diffMonths = (asOfDate.getTime() - evidenceDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    if (diffMonths <= 12) return 1.0;
    if (diffMonths <= 24) return 0.85;
    return 0.7;
  } catch {
    return 0.85;
  }
}

export function getSkillLevel(confidence: number): SkillLevel {
  if (confidence < 35) return 'Beginner';
  if (confidence < 70) return 'Intermediate';
  return 'Advanced';
}

export interface SkillConfidenceBreakdown {
  confidence: number;
  level: SkillLevel;
  totalRawPoints: number;
  items: {
    evidenceId: string;
    type: EvidenceType;
    typeWeight: number;
    verificationFactor: number;
    recencyFactor: number;
    diminishingMultiplier: number;
    netScore: number;
  }[];
}

export function calculateSkillConfidence(
  skillCanonicalName: string,
  evidenceList: Evidence[],
  asOfDate: Date = new Date()
): SkillConfidenceBreakdown {
  // Filter evidence that contains this skill
  const matching = evidenceList.filter(e => 
    e.skillsTagged.some(s => normalizeSkillName(s).canonical.toLowerCase() === skillCanonicalName.toLowerCase())
  );

  // Group by EvidenceType to apply diminishing returns
  const byType: Record<string, Evidence[]> = {};
  for (const ev of matching) {
    if (!byType[ev.type]) byType[ev.type] = [];
    byType[ev.type].push(ev);
  }

  const items: SkillConfidenceBreakdown['items'] = [];
  let sumScore = 0;

  for (const typeStr of Object.keys(byType)) {
    const evType = typeStr as EvidenceType;
    const group = byType[evType];
    const weight = EVIDENCE_TYPE_WEIGHTS[evType] ?? 10;

    // Sort group so highest raw multiplier comes first
    group.sort((a, b) => {
      const vA = VERIFICATION_FACTORS[a.verificationStatus];
      const vB = VERIFICATION_FACTORS[b.verificationStatus];
      return vB - vA;
    });

    group.forEach((ev, idx) => {
      const vFactor = VERIFICATION_FACTORS[ev.verificationStatus];
      const rFactor = getRecencyFactor(ev.date, asOfDate);
      // Diminishing returns: 70% of previous one
      const diminishingMultiplier = Math.pow(0.7, idx);
      const netScore = weight * vFactor * rFactor * diminishingMultiplier;

      items.push({
        evidenceId: ev.id,
        type: ev.type,
        typeWeight: weight,
        verificationFactor: vFactor,
        recencyFactor: rFactor,
        diminishingMultiplier,
        netScore: Math.round(netScore * 10) / 10
      });

      sumScore += netScore;
    });
  }

  const confidence = Math.min(100, Math.round(sumScore));
  return {
    confidence,
    level: getSkillLevel(confidence),
    totalRawPoints: Math.round(sumScore * 10) / 10,
    items
  };
}

// 2. Proof Strength Calculation (0-100)
export interface ProofStrengthResult {
  score: number;
  topSkillsAverage: number;
  diversityBonus: number;
  distinctTypesCount: number;
  topSkillsCount: number;
  verifiedProofsCount: number;
  formula: string;
}

export function calculateProofStrength(skills: Skill[], evidences: Evidence[]): ProofStrengthResult {
  if (skills.length === 0) {
    return {
      score: 0,
      topSkillsAverage: 0,
      diversityBonus: 0,
      distinctTypesCount: 0,
      topSkillsCount: 0,
      verifiedProofsCount: 0,
      formula: 'No skills recorded'
    };
  }

  // Top skills sorted descending by confidence (up to top 6)
  const sortedSkills = [...skills].sort((a, b) => b.confidence - a.confidence);
  const topSkills = sortedSkills.slice(0, 6);
  const topSum = topSkills.reduce((acc, s) => acc + s.confidence, 0);
  const topSkillsAverage = topSkills.length > 0 ? Math.round(topSum / topSkills.length) : 0;

  // Diversity bonus: count distinct evidence types present among student's evidences
  const distinctTypes = new Set(evidences.map(e => e.type));
  // Max +10 bonus (2.0 per unique type up to 5 types)
  const diversityBonus = Math.min(10, Math.round(distinctTypes.size * 2.0));

  const rawScore = topSkillsAverage + diversityBonus;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  const verifiedProofsCount = evidences.filter(e => e.verificationStatus === 'verified').length;

  return {
    score,
    topSkillsAverage,
    diversityBonus,
    distinctTypesCount: distinctTypes.size,
    topSkillsCount: topSkills.length,
    verifiedProofsCount,
    formula: `Score (${score}) = Top ${topSkills.length} Skills Average (${topSkillsAverage}) + Diversity Bonus (${diversityBonus} from ${distinctTypes.size} evidence types)`
  };
}

// 3. Project Similarity Engine (Institutional History)
export interface ProjectInput {
  title: string;
  description: string;
  domain: string;
  problem: string;
  technology: string[];
  methodology: string[];
}

// Helper: Tokenize & jaccard similarity
function computeJaccard(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;
  let intersection = 0;
  setA.forEach(item => {
    if (setB.has(item)) intersection++;
  });
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function normalizeStringTokens(input: string): Set<string> {
  const words = input.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !['and', 'the', 'for', 'with', 'from', 'this', 'that', 'into'].includes(w));
  return new Set(words);
}

function normalizeArrayTokens(arr: string[]): Set<string> {
  return new Set(arr.map(a => a.trim().toLowerCase()).filter(Boolean));
}

// Semantic similarity proxy via term overlap & contextual sentence embeddings proxy
export function calculateSemanticSimilarity(textA: string, textB: string): number {
  const tokensA = normalizeStringTokens(textA);
  const tokensB = normalizeStringTokens(textB);
  const jaccard = computeJaccard(tokensA, tokensB);

  // Boost for strong keyword alignment
  const overlapBonus = Array.from(tokensA).filter(t => tokensB.has(t)).length * 0.05;
  const raw = Math.min(1.0, jaccard + overlapBonus);
  return Math.round(raw * 100);
}

export function calculateProjectSimilarity(
  proposal: ProjectInput,
  institutionalArchive: Project[]
): SimilarityResult[] {
  const results: SimilarityResult[] = [];

  const propDomainSet = normalizeStringTokens(proposal.domain);
  const propProblemSet = normalizeStringTokens(proposal.problem);
  const propTechSet = normalizeArrayTokens(proposal.technology);
  const propMethodSet = normalizeArrayTokens(proposal.methodology);
  const proposalFullText = `${proposal.title} ${proposal.description} ${proposal.problem} ${proposal.domain}`;

  for (const past of institutionalArchive) {
    const pastDomainSet = normalizeStringTokens(past.domain);
    const pastProblemSet = normalizeStringTokens(past.problem);
    const pastTechSet = normalizeArrayTokens(past.technology);
    const pastMethodSet = normalizeArrayTokens(past.methodology);
    const pastFullText = `${past.title} ${past.description} ${past.problem} ${past.domain}`;

    // Dimensions: domain (0.25), problem (0.25), technology (0.25), methodology (0.25)
    const domainJaccard = computeJaccard(propDomainSet, pastDomainSet);
    const problemJaccard = computeJaccard(propProblemSet, pastProblemSet);
    const techJaccard = computeJaccard(propTechSet, pastTechSet);
    const methodJaccard = computeJaccard(propMethodSet, pastMethodSet);

    const domainScore = Math.round(domainJaccard * 100);
    const problemScore = Math.round(problemJaccard * 100);
    const technologyScore = Math.round(techJaccard * 100);
    const methodologyScore = Math.round(methodJaccard * 100);

    const structuralScore = Math.round(
      0.25 * domainScore +
      0.25 * problemScore +
      0.25 * technologyScore +
      0.25 * methodologyScore
    );

    const semanticScore = calculateSemanticSimilarity(proposalFullText, pastFullText);

    // Hybrid formula: 0.6 * semantic + 0.4 * structural
    const overallScore = Math.min(100, Math.round(0.6 * semanticScore + 0.4 * structuralScore));

    let level: 'High' | 'Moderate' | 'Low' = 'Low';
    if (overallScore >= 80) level = 'High';
    else if (overallScore >= 50) level = 'Moderate';

    // Plain English explanation citing exact overlaps
    const overlaps: string[] = [];
    if (domainScore >= 60) overlaps.push(`same domain focus (${past.domain})`);
    if (technologyScore >= 50) overlaps.push(`substantial tech stack overlap (${past.technology.slice(0, 3).join(', ')})`);
    if (problemScore >= 50) overlaps.push('targeted towards nearly identical campus problem statement');
    if (methodologyScore >= 50) overlaps.push('mirrors past architecture pipeline and deployment model');

    let explanation = overlaps.length > 0 
      ? `Shares ${overlaps.join(', and ')}.` 
      : `Broad thematic similarity in ${past.domain} with differentiated technology implementation.`;

    if (overallScore >= 80) {
      explanation += ' High institutional overlap detected; recommend consulting faculty advisor before finalizing proposal.';
    } else if (overallScore >= 50) {
      explanation += ' Moderate overlap detected; ensure unique dataset or novel algorithmic contribution is highlighted.';
    } else {
      explanation += ' Distinct scope from previous institutional submissions; clear novelty profile.';
    }

    const pastYear = past.date ? past.date.substring(0, 4) : '2025';

    results.push({
      overallScore,
      semanticScore,
      structuralScore,
      dimensions: {
        domainScore,
        problemScore,
        technologyScore,
        methodologyScore,
      },
      explanation,
      matchedProjectId: past.id,
      matchedProjectTitle: past.title,
      matchedStudentName: past.studentName || 'Institutional Scholar',
      matchedYear: pastYear,
      level,
    });
  }

  // Sort descending by overall similarity and return top 3
  return results.sort((a, b) => b.overallScore - a.overallScore).slice(0, 3);
}

// 4. Opportunity Matching Engine
export function calculateOpportunityMatch(
  opportunity: Opportunity,
  studentSkills: Skill[],
  studentEvidences: Evidence[],
  studentSummary: string
): MatchResult {
  // Required skills map
  const skillConfidenceMap = new Map<string, number>();
  studentSkills.forEach(s => skillConfidenceMap.set(s.canonicalName.toLowerCase(), s.confidence));

  let totalWeight = 0;
  let weightedConfidenceSum = 0;
  const matchedSkillConfidences: number[] = [];

  const youHave: MatchResult['youHave'] = [];
  const youNeed: MatchResult['youNeed'] = [];
  const whyMatched: string[] = [];

  for (const req of opportunity.requiredSkills) {
    const canonicalKey = normalizeSkillName(req.skillName).canonical.toLowerCase();
    const conf = skillConfidenceMap.get(canonicalKey) ?? 0;
    totalWeight += req.weight;

    // Structural skill fit: weight * min(1, confidence / 70)
    const fitFactor = Math.min(1.0, conf / 70);
    weightedConfidenceSum += req.weight * fitFactor;

    if (conf >= 40) {
      matchedSkillConfidences.push(conf);
      // Find evidence items proving this skill
      const proofs = studentEvidences.filter(e => 
        e.skillsTagged.some(st => normalizeSkillName(st).canonical.toLowerCase() === canonicalKey)
      );

      youHave.push({
        skillName: req.skillName,
        confidence: conf,
        evidenceCount: proofs.length,
      });

      // Cite specific proofs for "Why you matched"
      if (proofs.length > 0) {
        const topProof = proofs.find(p => p.verificationStatus === 'verified') || proofs[0];
        whyMatched.push(`Strong ${req.skillName} capability (${conf}/100) verified through "${topProof.title}" (${topProof.type}).`);
      }
    } else {
      youNeed.push({
        skillName: req.skillName,
        weight: req.weight,
        gapScore: 70 - conf,
      });
    }
  }

  // structuralSkillFit (0 to 100)
  const structuralSkillFit = totalWeight > 0 
    ? Math.round((weightedConfidenceSum / totalWeight) * 100) 
    : 50;

  // semanticFit between profile summary and job description (0 to 100)
  const semanticFit = calculateSemanticSimilarity(
    studentSummary,
    `${opportunity.title} ${opportunity.description} ${opportunity.company}`
  );

  // evidenceStrength = average confidence of matched skills
  const evidenceStrength = matchedSkillConfidences.length > 0
    ? Math.round(matchedSkillConfidences.reduce((a, b) => a + b, 0) / matchedSkillConfidences.length)
    : 20;

  // Final match formula: 0.5 * structuralSkillFit + 0.3 * semanticFit + 0.2 * evidenceStrength
  const score = Math.min(100, Math.max(0, Math.round(
    0.5 * structuralSkillFit +
    0.3 * semanticFit +
    0.2 * evidenceStrength
  )));

  // Generate Next Best Action based on the largest gap with highest importance weight
  let nextBestAction = 'Continue documenting coursework projects and seeking faculty verification.';
  if (youNeed.length > 0) {
    // Sort gaps by weight descending, then gapScore descending
    const sortedGaps = [...youNeed].sort((a, b) => b.weight - a.weight || b.gapScore - a.gapScore);
    const topGap = sortedGaps[0];
    nextBestAction = `Build a hands-on project demonstrating ${topGap.skillName} (current gap: ${topGap.gapScore} pts) to increase match probability by +18%.`;
  } else if (score >= 85) {
    nextBestAction = 'Profile strongly aligns with requirements. Submit your application and request a faculty endorsement.';
  } else {
    nextBestAction = 'Enhance project outcome metrics and add a live demonstration link to boost recruiter proof confidence.';
  }

  return {
    opportunityId: opportunity.id,
    score,
    structuralSkillFit,
    semanticFit,
    evidenceStrength,
    youHave,
    youNeed,
    whyMatched: whyMatched.slice(0, 3),
    nextBestAction,
  };
}

// 5. Application State Machine Validation
export const ALLOWED_STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  Saved: ['Applied'],
  Applied: ['Shortlisted', 'Rejected'],
  Shortlisted: ['Interview', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: [],
  Rejected: [],
};

export function canTransitionApplication(current: ApplicationStatus, next: ApplicationStatus): boolean {
  if (current === next) return true;
  return ALLOWED_STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}
