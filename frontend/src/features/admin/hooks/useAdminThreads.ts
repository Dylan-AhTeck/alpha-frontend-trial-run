// Admin Threads Hook - Manages thread data and operations
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThreadWithUser } from "@/shared/types";
import { AdminState } from "../types/admin.types";
import * as adminAPI from "../api/admin-api";

export function useAdminThreads() {
  const { user, session, userRole, signOut } = useAuth();
  const router = useRouter();

  const [state, setState] = useState<AdminState>({
    selectedThread: null,
    allThreads: [],
    loading: false,
    error: null,
    deleting: null,
  });

  // Function to fetch threads from backend API
  const fetchThreads = async () => {
    if (!session) return;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      console.log("[ADMIN] Fetching threads from backend API...");
      const threads = await adminAPI.getAllThreads(session);
      console.log("[ADMIN] Received threads:", threads);
      setState((prev) => ({ ...prev, allThreads: threads }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch threads";
      console.error("[ADMIN] Error fetching threads:", errorMessage);
      setState((prev) => ({ ...prev, error: errorMessage }));
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // Handle thread selection
  const selectThread = (thread: ThreadWithUser) => {
    setState((prev) => ({ ...prev, selectedThread: thread }));
  };

  // Handle thread deletion with confirmation
  const deleteThread = async (threadId: string, threadTitle: string) => {
    if (!session) return;

    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete the thread "${threadTitle}"?\n\nThis action cannot be undone and will delete the thread from both LangGraph and Assistant Cloud.`
    );

    if (!confirmed) return;

    setState((prev) => ({ ...prev, deleting: threadId }));
    try {
      await adminAPI.deleteThread(threadId, session);

      // Remove the deleted thread from local state
      setState((prev) => ({
        ...prev,
        allThreads: prev.allThreads.filter((thread) => thread.id !== threadId),
        selectedThread:
          prev.selectedThread?.id === threadId ? null : prev.selectedThread,
      }));

      console.log(`Thread ${threadId} deleted successfully`);
    } catch (err) {
      console.error("Failed to delete thread:", err);
      alert(
        `Failed to delete thread: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setState((prev) => ({ ...prev, deleting: null }));
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    // Don't manually redirect - let the SIGNED_OUT event handle it
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  // Check auth and fetch threads on mount
  useEffect(() => {
    if (!session || userRole !== "admin") {
      router.push("/dashboard");
      return;
    }

    // Fetch real threads from backend
    fetchThreads();
  }, [session, userRole, router]);

  return {
    // State
    ...state,
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
