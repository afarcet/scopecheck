import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: { id: string; email: string; role: 'investor' | 'founder'; created_at: string };
        Insert: { email: string; role: 'investor' | 'founder' };
      };
      investors: {
        Row: {
          id: string;
          handle: string;
          name: string;
          email: string;
          bio: string | null;
          firm: string | null;
          location: string | null;
          ticket_min: number | null;
          ticket_max: number | null;
          stages: string[];
          sectors: string[];
          geographies: string[];
          wont_invest_in: string | null;
          how_we_work: string | null;
          rejection_template: string | null;
          custom_fields: Record<string, unknown>[] | null;
          status: 'active' | 'paused';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['investors']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      founders: {
        Row: {
          id: string;
          handle: string;
          name: string;
          email: string;
          company_name: string;
          one_liner: string | null;
          stage: string | null;
          sector: string | null;
          geography: string | null;
          round_size: number | null;
          committed: number | null;
          available: number | null;
          traction_summary: string | null;
          deck_url: string | null;
          data_room_url: string | null;
          intro_video_url: string | null;
          what_we_want: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['founders']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
      applications: {
        Row: {
          id: string;
          investor_id: string;
          founder_id: string;
          status: 'new' | 'considering' | 'passed' | 'closed';
          custom_answers: Record<string, string> | null;
          investor_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>;
      };
    };
  };
};
