// Admin Feature Types
// This file contains all types specific to admin functionality

import { ThreadWithUser } from "@/shared/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

// Admin page state types
export interface AdminState {
  selectedThread: ThreadWithUser | null;
  allThreads: ThreadWithUser[];
  loading: boolean;
  error: string | null;
  deleting: string | null;
}

// Admin API response types
export interface AdminThreadsResponse {
  threads: ThreadWithUser[];
  total: number;
}

// Admin filter and sort options
export interface ThreadFilters {
  userEmail?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  messageCount?: {
    min: number;
    max: number;
  };
}

export interface ThreadSortOptions {
  field: "lastUpdated" | "userEmail" | "messageCount" | "title";
  direction: "asc" | "desc";
}

// Admin actions
export interface AdminActions {
  onThreadSelect: (thread: ThreadWithUser) => void;
  onThreadDelete: (threadId: string, threadTitle: string) => Promise<void>;
  onRefresh: () => void;
  onLogout: () => Promise<void>;
  onBackToDashboard: () => void;
}

// Component props interfaces
export interface AdminLayoutProps {
  user: SupabaseUser;
  onLogout: () => Promise<void>;
  onBackToDashboard: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export interface ThreadListProps {
  threads: ThreadWithUser[];
  selectedThread: ThreadWithUser | null;
  loading: boolean;
  error: string | null;
  deleting: string | null;
  onThreadSelect: (thread: ThreadWithUser) => void;
  onThreadDelete: (threadId: string, threadTitle: string) => Promise<void>;
  onRefresh: () => void;
}

export interface ThreadDetailsProps {
  thread: ThreadWithUser | null;
}

export interface BulkActionsProps {
  selectedThreads: string[];
  onBulkDelete: (threadIds: string[]) => Promise<void>;
  onSelectAll: () => void;
  onClearSelection: () => void;
  disabled?: boolean;
}
