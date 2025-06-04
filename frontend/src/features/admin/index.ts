// Admin Feature - Clean Export API
// This file provides a centralized export for all admin functionality

// Components
export { default as AdminLayout } from "./components/AdminLayout";
export { default as ThreadList } from "./components/ThreadList";
export { default as ThreadDetails } from "./components/ThreadDetails";

// Hooks
export { useAdminThreads } from "./hooks/useAdminThreads";

// API Functions
export * as adminAPI from "./api/admin-api";

// Types
export type {
  AdminState,
  AdminActions,
  AdminLayoutProps,
  ThreadListProps,
  ThreadDetailsProps,
  ThreadFilters,
  ThreadSortOptions,
  AdminThreadsResponse,
} from "./types/admin.types";
