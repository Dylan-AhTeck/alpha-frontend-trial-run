"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  PageContainer,
  Sidebar,
  MainContent,
} from "@/shared/components/layout";
import { ErrorBoundary } from "@/shared/components/feedback";
import { useDashboard, DashboardHeader } from "@/features/dashboard";
import { ChatProvider, Thread, ThreadList } from "@/features/chat";

export default function DashboardPage() {
  const {
    selectedAgent,
    loading,
    error,
    user,
    session,
    userRole,
    handleAgentChange,
    handleLogout,
    handleAdminClick,
  } = useDashboard();

  const router = useRouter();

  // Redirect to login if no session
  useEffect(() => {
    if (!loading && !session) {
      router.push("/login");
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-full">
          <div className="text-white/70">Loading...</div>
        </div>
      </PageContainer>
    );
  }

  if (!session || !user) {
    return null; // Will redirect to login
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <ErrorBoundary>
      <ChatProvider>
        <PageContainer>
          <DashboardHeader
            currentAgent={selectedAgent}
            onAgentChange={handleAgentChange}
            user={user}
            userRole={userRole}
            onLogout={handleLogout}
            onAdminClick={handleAdminClick}
          />

          <MainContent layout="split">
            <Sidebar width="md" className="p-4">
              <div className="mb-4">
                <h2 className="font-semibold text-white/90 mb-2">
                  Conversations
                </h2>
              </div>
              <ThreadList />
            </Sidebar>

            <div className="flex-1 flex flex-col">
              <Thread />
            </div>
          </MainContent>
        </PageContainer>
      </ChatProvider>
    </ErrorBoundary>
  );
}
