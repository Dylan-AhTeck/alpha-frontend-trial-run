"use client";

import {
  AdminLayout,
  ThreadList,
  ThreadDetails,
  useAdminThreads,
} from "@/features/admin";

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
  } = useAdminThreads();

  // Redirect if not authorized (handled by hook)
  if (!isAuthorized || !user) {
    return null;
  }

  return (
    <AdminLayout
      user={user}
      onLogout={handleLogout}
      onBackToDashboard={handleBackToDashboard}
      onRefresh={fetchThreads}
      loading={loading}
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
      <ThreadDetails thread={selectedThread} />
    </AdminLayout>
  );
}
