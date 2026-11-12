import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { signIn, signUp, signOut, onAuthStateChange } from '../lib/supabase-auth';
import type { AuthUser } from '../lib/supabase-auth';
import type { Session } from '@supabase/supabase-js';

interface Profile {
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

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isLiveMode: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DATA_MODE = import.meta.env.VITE_DATA_MODE || 'mock';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isLiveMode = DATA_MODE === 'live';

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[AuthContext] Failed to fetch profile:', error.message);
      return;
    }
    setProfile(data as Profile);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    if (!isLiveMode) {
      setIsLoading(false);
      return;
    }

    // Initialize session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
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
  }, [isLiveMode, fetchProfile]);

  const signInWithEmail = async (email: string, password: string) => {
    const data = await signIn(email, password);
    setUser(data.user);
    setSession(data.session);
    if (data.user) await fetchProfile(data.user.id);
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const data = await signUp(email, password, fullName);
    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      // Profile created by DB trigger; fetch it
      setTimeout(() => fetchProfile(data.user!.id), 500);
    }
  };

  const logOut = async () => {
    await signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isLoading,
      isLiveMode,
      signInWithEmail,
      signUpWithEmail,
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

