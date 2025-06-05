// Admin Threads Hook v2 - React Query powered version
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThreadWithUser } from "@/shared/types";
import {
  useAdminThreadsQuery,
  useDeleteThreadMutation,
} from "./useAdminThreadsQuery";
import { useToast } from "@/shared/components/feedback/Toast";

export function useAdminThreadsV2() {
  const { user, session, userRole, signOut } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();

  // Local state for selected thread
  const [selectedThread, setSelectedThread] = useState<ThreadWithUser | null>(
    null
  );

  // React Query hooks
  const {
    data: allThreads = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useAdminThreadsQuery();
  const deleteThreadMutation = useDeleteThreadMutation();

  // Convert React Query error to string
  const error = queryError ? (queryError as Error).message : null;

  // Handle thread selection
  const selectThread = (thread: ThreadWithUser) => {
    setSelectedThread(thread);
  };

  // Handle thread deletion with confirmation
  const deleteThread = async (threadId: string, threadTitle: string) => {
    if (!session) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the thread "${threadTitle}"?\n\nThis action cannot be undone and will delete the thread from both LangGraph and Assistant Cloud.`
    );

    if (!confirmed) return;

    try {
      await deleteThreadMutation.mutateAsync({ threadId });

      // Clear selected thread if it was the deleted one
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }

      addToast({
        type: "success",
        title: "Thread deleted",
        description: `Successfully deleted "${threadTitle}"`,
      });

    } catch (err) {

      addToast({
        type: "error",
        title: "Failed to delete thread",
        description:
          err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Handle manual refresh
  const fetchThreads = () => {
    refetch();
  };

  // Check auth and redirect if not authorized
  useEffect(() => {
    if (!session || userRole !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [session, userRole, router]);

  return {
    // State
    selectedThread,
    allThreads,
    loading,
    error,
    deleting: deleteThreadMutation.isPending ? "deleting" : null,
    user,
    session,
    userRole,

    // Actions
    fetchThreads,
    selectThread,
    deleteThread,
    handleLogout,
    handleBackToDashboard,

    // Computed
    isAuthorized: session && userRole === "admin",
  };
}
