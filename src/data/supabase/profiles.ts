import { supabase } from '../../lib/supabase';

export interface ProfileUpdate {
  full_name?: string;
  handle?: string;
  department?: string;
  batch?: number;
  headline?: string;
  bio?: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
  college?: string;
  is_public?: boolean;
}

/** Fetch a profile by user ID */
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(`getProfile: ${error.message}`);
  return data;
}

/** Update the current user's profile */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (error) throw new Error(`updateProfile: ${error.message}`);
}

/** Set a user's role (admin only - use service key in backend) */
export async function getStudentsForFaculty() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, department, batch, headline, avatar_url')
    .eq('role', 'student')
    .order('full_name');

  if (error) throw new Error(`getStudentsForFaculty: ${error.message}`);
  return data || [];
}

