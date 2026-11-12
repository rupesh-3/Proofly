import { supabase } from '../../lib/supabase';

export interface VerificationInput {
  evidenceId: string;
  verifierId: string;
  decision: 'verified' | 'rejected';
  checkedExists?: boolean;
  checkedAuthorship?: boolean;
  checkedQuality?: boolean;
  remarks?: string;
}

/**
 * Faculty submits a verification decision.
 * The DB trigger automatically updates evidence.status.
 */
export async function submitVerification(input: VerificationInput): Promise<void> {
  const { error } = await supabase.from('verifications').insert({
    evidence_id: input.evidenceId,
    verifier_id: input.verifierId,
    decision: input.decision,
    checked_exists: input.checkedExists ?? null,
    checked_authorship: input.checkedAuthorship ?? null,
    checked_quality: input.checkedQuality ?? null,
    remarks: input.remarks ?? null,
  });

  if (error) throw new Error(`submitVerification: ${error.message}`);
}

/**
 * Fetch all evidence pending verification (faculty view).
 * Returns evidence joined with student profile.
 */
export async function getPendingEvidence() {
  const { data, error } = await supabase
    .from('evidence')
    .select(`
      *,
      profiles ( full_name, department, college ),
      evidence_skills (
        skills ( canonical_name )
      )
    `)
    .in('status', ['self_reported', 'pending'])
    .order('created_at', { ascending: true });

  if (error) throw new Error(`getPendingEvidence: ${error.message}`);
  return data || [];
}

/**
 * Get all verifications made by a faculty member.
 */
export async function getFacultyVerifications(facultyId: string) {
  const { data, error } = await supabase
    .from('verifications')
    .select(`
      *,
      evidence ( title, type, student_id,
        profiles ( full_name )
      )
    `)
    .eq('verifier_id', facultyId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getFacultyVerifications: ${error.message}`);
  return data || [];
}

