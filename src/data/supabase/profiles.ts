import { supabase } from '../../lib/supabase';
import type { User, UserRole } from '../../types';

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

export function profileToUser(row: any): User {
  return {
    id: row.id,
    name: row.full_name || 'Campus Scholar',
    email: row.email || '',
    role: (row.role as UserRole) || 'student',
    avatar: row.avatar_url || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80`,
    college: row.college || 'Stanford University',
    department: row.department || 'Computer Science & AI',
    headline: row.headline || 'Verified Scholar',
    bio: row.bio || '',
    github: row.github_url || '',
    linkedin: row.linkedin_url || '',
    website: row.website_url || '',
    batch: row.batch ? `Class of ${row.batch}` : 'Class of 2026',
    isVerifiedStudent: true,
  };
}

/** Fetch all registered profiles from Supabase */
export async function getAllProfiles(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn(`getAllProfiles: ${error.message}`);
    return [];
  }
  return (data || []).map(profileToUser);
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

