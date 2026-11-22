import { supabase } from '../../lib/supabase';
import type { Evidence, EvidenceType, VerificationStatus } from '../../types';

// Map DB snake_case types → frontend camelCase Evidence type
function dbToEvidence(row: Record<string, unknown>): Evidence {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    title: row.title as string,
    type: mapDbType(row.type as string),
    description: (row.description as string) || '',
    date: (row.event_date as string) || (row.created_at as string).split('T')[0],
    url: (row.proof_url as string) || undefined,
    fileName: (row.proof_file_path as string)?.split('/').pop() || undefined,
    verificationStatus: mapDbStatus(row.status as string),
    skillsTagged: [], // populated separately via evidence_skills join
    metrics: (row.metrics as string) || undefined,
    organizationOrEvent: (row.organization as string) || undefined,
  };
}

function mapDbType(t: string): EvidenceType {
  const map: Record<string, EvidenceType> = {
    project: 'Project',
    hackathon: 'Hackathon',
    internship: 'Internship',
    certificate: 'Certificate',
    competition: 'Competition',
    achievement: 'Achievement',
  };
  return map[t] ?? 'Project';
}

function mapDbStatus(s: string): VerificationStatus {
  const map: Record<string, VerificationStatus> = {
    self_reported: 'self-reported',
    pending: 'pending',
    verified: 'verified',
    rejected: 'rejected',
    revoked: 'rejected',
  };
  return map[s] ?? 'self-reported';
}

function evidenceTypeToDb(t: EvidenceType): string {
  return t.toLowerCase().replace('-', '');
}

/** Fetch all evidence for a student, including skill tags */
export async function getStudentEvidence(studentId: string): Promise<Evidence[]> {
  const { data, error } = await supabase
    .from('evidence')
    .select(`
      *,
      evidence_skills (
        skills ( canonical_name )
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getStudentEvidence: ${error.message}`);

  return (data || []).map((row) => {
    const ev = dbToEvidence(row);
    // Flatten skill names from join
    const skillJoin = (row.evidence_skills as Array<{ skills: { canonical_name: string } }>) || [];
    ev.skillsTagged = skillJoin.map((s) => s.skills.canonical_name);
    return ev;
  });
}

/** Insert a new evidence record + link skills + optional file upload */
export async function insertEvidence(
  studentId: string,
  input: Omit<Evidence, 'id' | 'studentId' | 'verificationStatus'>,
  file?: File
): Promise<Evidence> {
  const { data: ev, error } = await supabase
    .from('evidence')
    .insert({
      student_id: studentId,
      type: evidenceTypeToDb(input.type),
      title: input.title,
      description: input.description,
      proof_url: input.url || null,
      event_date: input.date || null,
      status: 'self_reported',
      metrics: input.metrics || null,
      organization: input.organizationOrEvent || null,
    })
    .select()
    .single();

  if (error) throw new Error(`insertEvidence: ${error.message}`);

  // Link skills in junction table
  if (input.skillsTagged?.length) {
    await linkSkillsToEvidence(ev.id, input.skillsTagged);
  }

  // Upload file if provided
  let uploadedPath: string | null = null;
  if (file) {
    uploadedPath = await uploadEvidenceFile(studentId, ev.id, file);
  }

  const result = dbToEvidence(ev);
  result.skillsTagged = input.skillsTagged || [];
  if (file) {
    result.fileName = file.name;
    result.fileSize = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  }
  return result;
}

/** Upsert skills by canonical name and link to evidence */
async function linkSkillsToEvidence(evidenceId: string, skillNames: string[]) {
  for (const name of skillNames) {
    try {
      // Upsert skill (insert if new)
      const { data: skill, error: skillErr } = await supabase
        .from('skills')
        .upsert({ canonical_name: name }, { onConflict: 'canonical_name' })
        .select('id')
        .single();

      if (skillErr || !skill) continue;

      // Link evidence ↔ skill
      await supabase
        .from('evidence_skills')
        .upsert({ evidence_id: evidenceId, skill_id: skill.id }, { onConflict: 'evidence_id,skill_id' });
    } catch (err) {
      console.warn('[linkSkillsToEvidence] Note:', err);
    }
  }
}

/** Upload a file to private evidence-files bucket */
export async function uploadEvidenceFile(
  studentId: string,
  evidenceId: string,
  file: File
): Promise<string> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `${studentId}/${evidenceId}/${cleanName}`;
  
  try {
    const { error } = await supabase.storage
      .from('evidence-files')
      .upload(path, file, { upsert: true });

    if (error) {
      console.warn(
        '[uploadEvidenceFile] Supabase Storage notice: ' +
        error.message +
        '. If the bucket does not exist yet, create a private bucket named "evidence-files" in Supabase Storage.'
      );
      return path;
    }

    // Update evidence row with file path
    await supabase
      .from('evidence')
      .update({ proof_file_path: path })
      .eq('id', evidenceId);

    return path;
  } catch (err) {
    console.warn('[uploadEvidenceFile] Upload caught error:', err);
    return path;
  }
}

/** Get a signed URL for a private evidence file (expires in 1 hour) */
export async function getEvidenceFileUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from('evidence-files')
    .createSignedUrl(filePath, 3600);

  if (error) throw new Error(`getEvidenceFileUrl: ${error.message}`);
  return data.signedUrl;
}

