import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// =============================================================================
// USER TYPES
// =============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  threads: Thread[];
  isAdmin?: boolean;
}

export interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null; // 'admin' or 'authenticated' or null
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// =============================================================================
// THREAD TYPES
// =============================================================================

export interface Thread {
  id: string;
  title: string;
  message_count: number;
  last_updated: string; // ISO string from backend
  created_at: string; // ISO string from backend
  user_email: string;
  user_id: string;
  status: string;
  messages: Message[];
  raw_metadata?: Record<string, unknown>;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string | null; // ISO string or null
}

// Enhanced Thread type that includes user info (for admin dashboard)
export interface ThreadWithUser extends Thread {
  userEmail: string;
  userId: string;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface EmailCheckResponse {
  email: string;
  exists: boolean;
  is_beta_user: boolean;
  verified: boolean;
  status: "not_beta" | "new_user" | "pending_verification" | "verified_user";
}

// =============================================================================
// LEGACY TYPES (TO BE REMOVED)
// =============================================================================

// @deprecated - Use Thread instead
export type BackendThread = Thread;

// @deprecated - Use Message instead
export type BackendMessage = Message;
