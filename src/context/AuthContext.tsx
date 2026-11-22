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
  const [demoUser, setDemoUser] = useState<DemoUser | null>(() => {
    try {
      const saved = localStorage.getItem(DEMO_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  const isConfigured = isSupabaseConfigured;

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[AuthContext] Profile fetch error:', error.message);
        return;
      }
      if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.warn('[AuthContext] Profile fetch exception:', err);
    }
  }, [isConfigured]);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
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
        setDemoUser(null);
        localStorage.removeItem(DEMO_STORAGE_KEY);
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
        setDemoUser(null);
        localStorage.removeItem(DEMO_STORAGE_KEY);
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
        'Supabase credentials not configured in .env. Please add VITE_SUPABASE_ANON_KEY or use Instant Demo Access.'
      );
    }
    const data = await signIn(email, password);
    setUser(data.user);
    setSession(data.session);
    setDemoUser(null);
    localStorage.removeItem(DEMO_STORAGE_KEY);
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
        'Supabase credentials not configured in .env. Please add VITE_SUPABASE_ANON_KEY or use Instant Demo Access.'
      );
    }
    const data = await signUp(email, password, fullName, role, department, batch);
    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      setDemoUser(null);
      localStorage.removeItem(DEMO_STORAGE_KEY);
      setTimeout(() => fetchProfile(data.user!.id), 800);
      return { needsConfirmation: !data.session };
    }
    return { needsConfirmation: true };
  };

  const signInAsDemo = (persona: DemoUser) => {
    setDemoUser(persona);
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(persona));
    setUser(null);
    setSession(null);
    setProfile({
      id: persona.id,
      role: persona.role,
      full_name: persona.name,
      handle: persona.id,
      department: persona.department,
      batch: persona.batch ? parseInt(persona.batch.replace(/\D/g, '')) || 2026 : 2026,
      headline: persona.headline,
      bio: persona.bio,
      avatar_url: persona.avatar,
      github_url: null,
      linkedin_url: null,
      website_url: null,
      college: persona.college,
      is_public: true,
    });
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

  const isAuthenticated = Boolean(user || demoUser);

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
