// Admin Feature Exports
// This file provides a clean API for the admin feature

// Components
export { default as AdminLayout } from "./components/AdminLayout";
export { default as ThreadList } from "./components/ThreadList";
export { default as ThreadDetails } from "./components/ThreadDetails";

// Hooks
export { useAdminThreadsV2 } from "./hooks/useAdminThreadsV2";
export {
  useAdminThreadsQuery,
  useDeleteThreadMutation,
  useBulkDeleteThreadsMutation,
  adminQueryKeys,
} from "./hooks/useAdminThreadsQuery";

// Types
export type * from "./types/admin.types";

// API
export * from "./api/admin-api";
