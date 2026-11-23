import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { signIn, signUp, signOut, onAuthStateChange } from '../lib/supabase-auth';
import type { AuthUser } from '../lib/supabase-auth';
import type { Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  role: 'student' | 'faculty' | 'placement' | 'admin';
  full_name: string;
  handle: string | null;
  department: string | null;
  batch: number | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  website_url: string | null;
  college: string | null;
  is_public: boolean;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'placement';
  avatar: string;
  college: string;
  department: string;
  headline: string;
  bio: string;
  batch?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  demoUser: DemoUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string, 
    password: string, 
    fullName: string, 
    role?: 'student' | 'faculty' | 'placement', 
    department?: string, 
    batch?: number
  ) => Promise<{ needsConfirmation?: boolean }>;
  signInAsDemo: (persona: DemoUser) => void;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_STORAGE_KEY = 'proofly_demo_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = isSupabaseConfigured;

  // Ensure any legacy demo persona is purged from local storage
  useEffect(() => {
    try {
      localStorage.removeItem(DEMO_STORAGE_KEY);
    } catch {
      // Ignored
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string, authUser?: AuthUser | null) => {
    if (!isConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Profile fetch error:', error.message);
      }
      if (data) {
        setProfile(data as Profile);
        return;
      }

      // If no profile row exists in Supabase table yet, auto-provision from auth metadata!
      const activeUser = authUser || user;
      const meta = (activeUser?.user_metadata || {}) as Record<string, any>;
      const fallbackProfile: Profile = {
        id: userId,
        role: (meta.role as any) || 'student',
        full_name: meta.full_name || activeUser?.email?.split('@')[0] || 'Campus Scholar',
        handle: meta.handle || null,
        department: meta.department || 'Computer Science & AI',
        batch: meta.batch ? parseInt(String(meta.batch)) || 2026 : 2026,
        headline: meta.headline || 'Verified Scholar',
        bio: meta.bio || '',
        avatar_url: meta.avatar_url || null,
        github_url: meta.github_url || null,
        linkedin_url: meta.linkedin_url || null,
        website_url: meta.website_url || null,
        college: meta.college || 'Stanford University',
        is_public: true,
      };

      setProfile(fallbackProfile);

      // Attempt to persist the profile row into Supabase public.profiles
      supabase
        .from('profiles')
        .upsert({
          id: userId,
          role: fallbackProfile.role,
          full_name: fallbackProfile.full_name,
          department: fallbackProfile.department,
          batch: fallbackProfile.batch,
          headline: fallbackProfile.headline,
          college: fallbackProfile.college,
          is_public: true,
        }, { onConflict: 'id' })
        .then(({ error: upsertErr }) => {
          if (upsertErr) {
            console.warn('[AuthContext] Auto-upsert profile row info:', upsertErr.message);
          }
        });
    } catch (err) {
      console.warn('[AuthContext] Profile fetch exception:', err);
    }
  }, [isConfigured, user]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id, user);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isConfigured) {
      setIsLoading(false);
      return;
    }

    // Initialize session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    }).catch(err => {
      console.warn('[AuthContext] Session init failed:', err);
      setIsLoading(false);
    });

    // Subscribe to future auth changes
    const unsubscribe = onAuthStateChange(async (authUser) => {
      setUser(authUser);
      if (authUser) {
        await fetchProfile(authUser.id);
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } else {
        setProfile(null);
        setSession(null);
      }
    });

    return unsubscribe;
  }, [isConfigured, fetchProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      throw new Error(
        'Supabase credentials not configured in .env. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }
    const data = await signIn(email, password);
    setUser(data.user);
    setSession(data.session);
    setDemoUser(null);
    if (data.user) await fetchProfile(data.user.id);
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    fullName: string, 
    role: 'student' | 'faculty' | 'placement' = 'student', 
    department?: string, 
    batch?: number
  ) => {
    if (!isConfigured) {
      throw new Error(
        'Supabase credentials not configured in .env. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }
    const data = await signUp(email, password, fullName, role, department, batch);
    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      setDemoUser(null);
      setTimeout(() => fetchProfile(data.user!.id), 800);
      return { needsConfirmation: !data.session };
    }
    return { needsConfirmation: true };
  };

  const signInAsDemo = (_persona: DemoUser) => {
    console.warn('Demo persona sign-in is disabled. Please sign in with real Supabase credentials.');
  };

  const logOut = async () => {
    try {
      if (isConfigured) {
        await signOut();
      }
    } catch {
      // Ignored
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setDemoUser(null);
    localStorage.removeItem(DEMO_STORAGE_KEY);
  };

  const isAuthenticated = Boolean(user);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      demoUser,
      isAuthenticated,
      isLoading,
      isConfigured,
      signInWithEmail,
      signUpWithEmail,
      signInAsDemo,
      logOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
