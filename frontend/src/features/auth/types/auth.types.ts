import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  userRole: string | null; // 'admin' or 'authenticated' or null
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export interface EmailCheckResponse {
  status: "not_beta" | "new_user" | "pending_verification" | "verified_user";
  message: string;
}

// =============================================================================
// AUTH HOOK TYPES
// =============================================================================

export interface UseAuthOptions {
  redirectTo?: string;
  requireAuth?: boolean;
}

export interface UseAuthRedirectOptions {
  redirectTo: string;
  condition?: (user: SupabaseUser | null, userRole: string | null) => boolean;
}
