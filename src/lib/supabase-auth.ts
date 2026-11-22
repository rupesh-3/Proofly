import { supabase } from './supabase';
import type { User } from '@supabase/supabase-js';

export type AuthUser = User;

/**
 * Sign up with email + password.
 * The database trigger auto-creates the profile row.
 */
export async function signUp(
  email: string, 
  password: string, 
  fullName: string, 
  role: string = 'student', 
  department?: string, 
  batch?: number
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName,
        role,
        department: department || '',
        batch: batch || null,
      },
    },
  });
  if (error) throw error;

  // Ensure profile has matching metadata if session is immediately available
  if (data.user) {
    try {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        full_name: fullName,
        role: role as 'student' | 'faculty' | 'placement' | 'admin',
        department: department || null,
        batch: batch || null,
      }, { onConflict: 'id' });
    } catch {
      // Trigger handles fallback
    }
  }

  return data;
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin,
  });
  if (error) throw error;
}

/**
 * Sign in with email + password.
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current session (null if not logged in).
 */
export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the access token for FastAPI calls.
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession();
  return session?.access_token ?? null;
}

/**
 * Subscribe to auth state changes.
 * Returns the unsubscribe function.
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}

