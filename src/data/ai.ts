/**
 * FastAPI AI client for the Proofly frontend.
 * Calls the FastAPI service with the user's Supabase JWT.
 */
import { getAccessToken } from '../lib/supabase-auth';

const AI_URL = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

async function fetchAI<T>(
  path: string,
  method: 'GET' | 'POST',
  body?: unknown
): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new Error('Not authenticated. Please sign in.');

  const res = await fetch(`${AI_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(`AI Service error (${res.status}): ${err.detail || res.statusText}`);
  }

  return res.json();
}

// ── 1. Project Similarity ────────────────────────────────────

export interface SimilarityMatch {
  project_id: string;
  title: string;
  student_name: string;
  score: number;
  semantic_score: number;
  structural_score: number;
  breakdown: Record<string, number>;
}

export interface SimilarityResult {
  matches: SimilarityMatch[];
  note: string;
}

export async function checkProjectSimilarity(
  title: string,
  description: string
): Promise<SimilarityResult> {
  return fetchAI<SimilarityResult>('/project-similarity', 'POST', { title, description });
}

// ── 2. Embed Evidence ────────────────────────────────────────

export async function embedEvidence(
  evidenceId: string,
  title: string,
  description: string
): Promise<{ evidence_id: string; status: string }> {
  return fetchAI('/embed-evidence', 'POST', {
    evidence_id: evidenceId,
    title,
    description,
  });
}

// ── 3. Skill Confidence ──────────────────────────────────────

export interface SkillScore {
  skill_name: string;
  confidence: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export async function getSkillConfidence(studentId: string): Promise<{
  student_id: string;
  skills: SkillScore[];
}> {
  return fetchAI(`/skill-confidence/${studentId}`, 'GET');
}

// ── 4. Opportunity Match ─────────────────────────────────────

export interface OpportunityMatchResult {
  opportunity_id: string;
  score: number;
  structural_skill_fit: number;
  semantic_fit: number;
  evidence_strength: number;
  you_have: { skill_name: string; confidence: number }[];
  you_need: { skill_name: string; weight: number; gap_score: number }[];
  why_matched: string[];
  next_best_action: string;
}

export async function getOpportunityMatch(
  opportunityId: string,
  opportunityTitle: string,
  opportunityDescription: string,
  requiredSkills: { skill_name: string; weight: number }[]
): Promise<OpportunityMatchResult> {
  return fetchAI('/opportunity-match', 'POST', {
    opportunity_id: opportunityId,
    opportunity_title: opportunityTitle,
    opportunity_description: opportunityDescription,
    required_skills: requiredSkills,
  });
}
