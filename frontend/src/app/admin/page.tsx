"use client";

import { AdminLayout, ThreadList, ThreadDetails } from "@/features/admin";
import { useAdminThreadsV2 } from "@/features/admin/hooks/useAdminThreadsV2";
import { ErrorBoundary } from "@/shared/components/feedback/ErrorBoundary";
import { useToast } from "@/shared/components/feedback/Toast";

export default function AdminPage() {
  const {
    // State
    selectedThread,
    allThreads,
    loading,
    error,
    deleting,
    user,
    isAuthorized,

    // Actions
    selectThread,
    deleteThread,
    handleLogout,
    handleBackToDashboard,
    fetchThreads,
  } = useAdminThreadsV2();

  const { ToastContainer } = useToast();

  // Redirect if not authorized (handled by hook)
  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AdminLayout
        user={user}
        onLogout={handleLogout}
        onBackToDashboard={handleBackToDashboard}
        onRefresh={fetchThreads}
        loading={loading}
      >
        <ErrorBoundary
          fallback={
            <div className="p-4 text-center">
              <p className="text-destructive">Failed to load thread list</p>
            </div>
          }
        >
          <ThreadList
            threads={allThreads}
            selectedThread={selectedThread}
            loading={loading}
            error={error}
            deleting={deleting}
            onThreadSelect={selectThread}
            onThreadDelete={deleteThread}
            onRefresh={fetchThreads}
          />
        </ErrorBoundary>

        <ErrorBoundary
          fallback={
            <div className="p-4 text-center">
              <p className="text-destructive">Failed to load thread details</p>
            </div>
          }
        >
          <ThreadDetails thread={selectedThread} />
        </ErrorBoundary>
      </AdminLayout>
      <ToastContainer />
    </ErrorBoundary>
  );
}
