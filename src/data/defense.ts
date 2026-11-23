/**
 * Proofly Frontend — AI Defense Service Client
 *
 * Extends the existing ai.ts client with endpoints for the
 * Zero-Trust Proof-of-Competency defense protocol.
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

// ── Types ────────────────────────────────────────────────────

export interface DefenseQuestion {
  question_id: string;
  question_type: 'tradeoff' | 'counterfactual' | 'debug' | 'explain';
  question_text: string;
  context_snippet: string | null;
  time_limit_seconds: number;
  rubric: Record<string, number>;
  expected_key_concepts: string[];
}

export interface DefenseChallenge {
  challenge_id: string;
  evidence_id: string;
  evidence_type: string;
  title: string;
  questions: DefenseQuestion[];
  total_time_seconds: number;
  generated_at: string;
  artifact_hash: string;
}

export interface QuestionResponse {
  question_id: string;
  response_text: string;
  time_taken_seconds: number;
  keystroke_events: Array<{ key: string; timestamp_ms: number; event_type: string }>;
  tab_switch_count: number;
  paste_attempt_count: number;
}

export interface QuestionEvaluation {
  question_id: string;
  question_type: string;
  conceptual_precision: number;
  technical_depth: number;
  response_authenticity: number;
  weighted_score: number;
  feedback: string;
  key_concepts_hit: string[];
  key_concepts_missed: string[];
  flags: string[];
}

export interface TelemetryAnalysis {
  typing_cadence_score: number;
  mean_ikl_ms: number;
  ikl_std_ms: number;
  burstiness_index: number;
  pause_frequency: number;
  tab_switch_penalty: number;
  paste_penalty: number;
  overall_confidence: number;
  flags: string[];
}

export interface DefenseReport {
  challenge_id: string;
  evidence_id: string;
  student_id: string;
  asi_score: number;
  telemetry_confidence: number;
  combined_defense_score: number;
  defense_level: 'Passed' | 'Marginal' | 'Failed';
  question_evaluations: QuestionEvaluation[];
  telemetry_analysis: TelemetryAnalysis;
  transcript: Array<{
    question: string;
    question_type: string;
    response: string;
    score: number;
    time_taken: number;
    feedback: string;
  }>;
  evaluated_at: string;
  report_hash: string;
}

export interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: { id: string; name: string; publicKeyBase64: string };
  issuanceDate: string;
  expirationDate: string;
  credentialSubject: {
    id: string;
    name: string;
    competency: { skill: string; confidence: number; level: string; calibrationModel: string };
    evidenceChain: {
      merkleRoot: string;
      evidenceCount: number;
      highestProofLevel: number;
      hasAIDefense: boolean;
      hasFacultyAttestation: boolean;
    };
  };
  proof: { type: string; created: string; proofValue: string };
}

// ── API Calls ────────────────────────────────────────────────

/**
 * Generate a defense challenge for an evidence item.
 * The backend analyzes the artifact and produces grounded questions.
 */
export async function generateDefenseChallenge(input: {
  evidence_id: string;
  evidence_type: string;
  title: string;
  description: string;
  report_text?: string;
  code_snippet?: string;
  tech_stack?: string[];
  claimed_skills?: string[];
}): Promise<DefenseChallenge> {
  return fetchAI<DefenseChallenge>('/defense/generate', 'POST', input);
}

/**
 * Submit defense responses for evaluation.
 * Returns the full defense report with scores and telemetry analysis.
 */
export async function submitDefenseResponses(submission: {
  challenge_id: string;
  evidence_id: string;
  student_id: string;
  responses: QuestionResponse[];
  started_at: string;
  completed_at: string;
}): Promise<DefenseReport> {
  return fetchAI<DefenseReport>('/defense/evaluate', 'POST', submission);
}

/**
 * Get the defense report for an evidence item (if one exists).
 */
export async function getDefenseReport(evidenceId: string): Promise<DefenseReport | null> {
  try {
    return await fetchAI<DefenseReport>(`/defense/report/${evidenceId}`, 'GET');
  } catch {
    return null;
  }
}

/**
 * Issue a W3C Verifiable Credential for a skill.
 */
export async function issueVerifiableCredential(
  skillName: string
): Promise<VerifiableCredential> {
  return fetchAI<VerifiableCredential>('/credential/issue', 'POST', {
    skill_name: skillName,
  });
}

/**
 * Verify a credential's cryptographic signature.
 */
export async function verifyCredential(
  credential: VerifiableCredential
): Promise<{ valid: boolean; details: string }> {
  return fetchAI('/credential/verify', 'POST', { credential });
}



// ── Phase 1 & 2 Adaptive Models ─────────────────────────────

export interface DefenseTurn {
  turn_number: number;
  item_id: string;
  item_type: 'tradeoff' | 'counterfactual' | 'debug';
  question_text: string;
  context_citation?: string | null;
  context_snippet?: string | null;
  time_limit_seconds: number;
  student_response?: string | null;
  response_time_seconds?: number | null;
  evaluated: boolean;
  observed_category?: number | null;
  raw_score?: number | null;
  feedback?: string | null;
  evidence_citations?: string[];
}

export interface AdaptiveDefenseSession {
  session_id: string;
  evidence_id: string;
  student_id: string;
  artifact_title: string;
  artifact_summary: string;
  total_turns: number;
  current_turn: number;
  status: 'in_progress' | 'completed' | 'faculty_reviewed';
  turns: DefenseTurn[];
  final_competency?: {
    theta_map: number;
    score_percentile: number;
    standard_error: number;
    ci_95: [number, number];
    reliability_index: number;
    classification: string;
  } | null;
  created_at: string;
  completed_at?: string | null;
}

export interface ProvenanceReport {
  repository_identifier: string;
  analyzed_at: string;
  total_files: number;
  total_loc: number;
  total_ast_nodes: number;
  mean_complexity: number;
  authors: Array<{
    author: string;
    email: string;
    commit_count: number;
    lines_added: number;
    lines_deleted: number;
    net_lines: number;
    ast_nodes_contributed: number;
    percentage_contribution: number;
  }>;
  trajectory: {
    total_commits: number;
    timespan_days: number;
    average_commits_per_day: number;
    gini_coefficient: number;
    trajectory_pattern: string;
    workflow_context: string;
    semantic_churn_ratio: number;
  };
  completeness: {
    has_readme: boolean;
    has_tests: boolean;
    has_package_spec: boolean;
    has_ci_config: boolean;
    has_license: boolean;
    modular_structure_score: number;
    overall_completeness_score: number;
    identified_technologies: string[];
    documentation_density: number;
  };
  structural_fingerprint: string;
  summary_notes: string[];
}

export interface IRTEstimateResult {
  skill_name: string;
  theta_map: number;
  theta_percentile: number;
  standard_error: number;
  ci_95_lower: number;
  ci_95_upper: number;
  test_information: number;
  reliability_index: number;
  competency_classification: string;
  faculty_prior_applied: boolean;
  evidence_count: number;
  diagnostics: Record<string, unknown>;
}

// ── Adaptive & Provenance Client Calls ───────────────────────

export async function analyzeRepositoryProvenance(input: {
  repository_identifier: string;
  files: Record<string, string>;
  commits?: Array<Record<string, unknown>>;
}): Promise<ProvenanceReport> {
  return fetchAI<ProvenanceReport>('/provenance/analyze', 'POST', input);
}

export async function startAdaptiveDefenseSession(input: {
  evidence_id: string;
  student_id: string;
  title: string;
  description: string;
  tech_stack?: string[];
  report_text?: string;
  code_snippet?: string;
}): Promise<AdaptiveDefenseSession> {
  return fetchAI<AdaptiveDefenseSession>('/adaptive-defense/start', 'POST', input);
}

export async function submitAdaptiveTurn(input: {
  session_id: string;
  student_response: string;
  response_time_seconds: number;
  telemetry_summary?: Record<string, unknown>;
}): Promise<AdaptiveDefenseSession> {
  return fetchAI<AdaptiveDefenseSession>('/adaptive-defense/turn', 'POST', input);
}

export async function estimateIRTCompetency(input: {
  skill_name: string;
  observations: Array<{ item_id: string; observed_category: number; response_time_seconds?: number; raw_eval_score?: number }>;
  items: Array<{ item_id: string; item_type?: string; discrimination?: number; difficulty_thresholds?: number[] }>;
  faculty_prior_mean?: number;
  faculty_prior_sd?: number;
}): Promise<IRTEstimateResult> {
  return fetchAI<IRTEstimateResult>('/competency/estimate-irt', 'POST', input);
}
