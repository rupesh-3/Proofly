import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Proofly] Supabase env vars not set. Running in mock mode. ' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live mode.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      evidence: {
        Row: {
          id: string;
          student_id: string;
          type: 'project' | 'hackathon' | 'internship' | 'certificate' | 'competition' | 'achievement';
          title: string;
          description: string | null;
          proof_url: string | null;
          proof_file_path: string | null;
          proof_level: number;
          depth_factor: number;
          event_date: string | null;
          status: 'self_reported' | 'pending' | 'verified' | 'rejected' | 'revoked';
          similarity_flag: boolean;
          metrics: string | null;
          organization: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['evidence']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['evidence']['Insert']>;
      };
      opportunities: {
        Row: {
          id: string;
          posted_by: string | null;
          title: string;
          company: string;
          description: string | null;
          location: string | null;
          type: string;
          workplace: string;
          stipend: string | null;
          deadline: string | null;
          status: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['opportunities']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['opportunities']['Insert']>;
      };
      applications: {
        Row: {
          id: string;
          student_id: string;
          opportunity_id: string;
          status: string;
          applied_date: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['applications']['Insert']>;
      };
    };
  };
};

