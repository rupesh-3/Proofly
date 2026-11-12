import { supabase } from '../../lib/supabase';
import type { Opportunity, Application } from '../../types';

function dbToOpportunity(row: Record<string, unknown>): Opportunity {
  return {
    id: row.id as string,
    title: row.title as string,
    company: row.company as string,
    type: (row.type as 'internship' | 'full-time' | 'research') || 'internship',
    location: (row.location as string) || 'Remote',
    workplaceType: (row.workplace as 'Remote' | 'Hybrid' | 'On-site') || 'Remote',
    stipendOrSalary: (row.stipend as string) || 'Not specified',
    deadline: (row.deadline as string) || '',
    description: (row.description as string) || '',
    requiredSkills: [],
    postedBy: (row.posted_by as string) || '',
    status: (row.status as 'open' | 'closed') || 'open',
    applicantCount: 0,
  };
}

/** Get all open opportunities with required skills */
export async function getOpportunities(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from('opportunities')
    .select(`
      *,
      opportunity_skills (
        weight,
        skills ( canonical_name )
      )
    `)
    .eq('status', 'open')
    .order('created_at', { ascending: false });

  if (error) throw new Error(`getOpportunities: ${error.message}`);

  return (data || []).map((row) => {
    const opp = dbToOpportunity(row);
    const skillJoin = (row.opportunity_skills as Array<{ weight: number; skills: { canonical_name: string } }>) || [];
    opp.requiredSkills = skillJoin.map((s) => ({
      skillName: s.skills.canonical_name,
      weight: s.weight,
    }));
    return opp;
  });
}

/** Placement officer creates a new opportunity */
export async function createOpportunity(
  postedBy: string,
  input: Omit<Opportunity, 'id' | 'applicantCount' | 'status'>
): Promise<Opportunity> {
  const { data, error } = await supabase
    .from('opportunities')
    .insert({
      posted_by: postedBy,
      title: input.title,
      company: input.company,
      description: input.description,
      location: input.location,
      type: input.type,
      workplace: input.workplaceType,
      stipend: input.stipendOrSalary,
      deadline: input.deadline || null,
      status: 'open',
    })
    .select()
    .single();

  if (error) throw new Error(`createOpportunity: ${error.message}`);

  // Link skills
  for (const req of input.requiredSkills) {
    const { data: skill } = await supabase
      .from('skills')
      .upsert({ canonical_name: req.skillName }, { onConflict: 'canonical_name' })
      .select('id')
      .single();

    if (skill) {
      await supabase.from('opportunity_skills').insert({
        opportunity_id: data.id,
        skill_id: skill.id,
        weight: req.weight,
      });
    }
  }

  return dbToOpportunity(data);
}

/** Get all applications for a student */
export async function getStudentApplications(studentId: string): Promise<Application[]> {
  const { data, error } = await supabase
    .from('applications')
    .select(`
      *,
      application_history ( status, note, created_at )
    `)
    .eq('student_id', studentId)
    .order('updated_at', { ascending: false });

  if (error) throw new Error(`getStudentApplications: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    opportunityId: row.opportunity_id,
    studentId: row.student_id,
    status: row.status as Application['status'],
    appliedDate: row.applied_date || '',
    updatedDate: row.updated_at?.split('T')[0] || '',
    history: (row.application_history || []).map((h: Record<string, unknown>) => ({
      status: h.status as Application['status'],
      timestamp: h.created_at as string,
      note: h.note as string | undefined,
    })),
  }));
}

/** Student applies for an opportunity */
export async function applyForOpportunity(studentId: string, opportunityId: string): Promise<void> {
  const { data: app, error } = await supabase
    .from('applications')
    .insert({
      student_id: studentId,
      opportunity_id: opportunityId,
      status: 'Applied',
      applied_date: new Date().toISOString().split('T')[0],
    })
    .select('id')
    .single();

  if (error) throw new Error(`applyForOpportunity: ${error.message}`);

  // Record history
  await supabase.from('application_history').insert({
    application_id: app.id,
    status: 'Applied',
    note: 'Profile with verified skill evidence chain submitted.',
  });
}

