// Dashboard Hook - Custom hook for dashboard state and business logic
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { UseDashboardReturn } from "../types/dashboard.types";

export function useDashboard(): UseDashboardReturn {
  const { user, session, userRole, signOut } = useAuth();
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState("dylan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if no session
  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  const handleAgentChange = (agentId: string) => {
    // For now, we'll just update the state
    // In the future, this could switch between different agent APIs
    if (agentId !== "coming-soon") {
      setSelectedAgent(agentId);
      setError(null);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut();
      // Don't manually redirect - let the SIGNED_OUT event handle it
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminClick = () => {
    router.push("/admin");
  };

  return {
    selectedAgent,
    loading,
    error,
    user,
    session,
    userRole,
    handleAgentChange,
    handleLogout,
    handleAdminClick,
  };
}
