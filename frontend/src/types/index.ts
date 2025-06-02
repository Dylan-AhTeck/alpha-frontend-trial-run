import { User as SupabaseUser, Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name?: string;
  threads: Thread[];
  isAdmin?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Backend API response types
export interface EmailCheckResponse {
  email: string;
  exists: boolean;
  is_beta_user: boolean;
  verified: boolean;
  status: "not_beta" | "new_user" | "pending_verification" | "verified_user";
}
