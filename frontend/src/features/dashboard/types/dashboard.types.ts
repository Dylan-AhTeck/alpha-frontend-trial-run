// Dashboard Types - Type definitions for dashboard feature
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

export interface DashboardHeaderProps {
  currentAgent: string;
  onAgentChange: (agentId: string) => void;
  user: SupabaseUser | null;
  userRole: string | null;
  onLogout: () => void;
  onAdminClick: () => void;
}

export interface DashboardState {
  selectedAgent: string;
  loading: boolean;
  error: string | null;
}

export interface UseDashboardReturn {
  selectedAgent: string;
  loading: boolean;
  error: string | null;
  user: SupabaseUser | null;
  session: Session | null;
  userRole: string | null;
  handleAgentChange: (agentId: string) => void;
  handleLogout: () => void;
  handleAdminClick: () => void;
}
