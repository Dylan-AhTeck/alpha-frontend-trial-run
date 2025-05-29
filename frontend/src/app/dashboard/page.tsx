"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import { IdentitySelector } from "@/components/dashboard/identity-selector";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState("dylan");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Runtime provider for the entire dashboard with better thread management
  const runtime = useChatRuntime({
    api: "/api/chat",
    // Enable automatic thread title generation
    maxSteps: 10,
    // You can add additional configuration here for thread management
  });

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleAgentChange = (agentId: string) => {
    // For now, we'll just update the state
    // In the future, this could switch between different agent APIs
    if (agentId !== "coming-soon") {
      setSelectedAgent(agentId);
    }
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md p-4">
          <div className="flex items-center justify-between">
            <IdentitySelector
              currentAgent={selectedAgent}
              onAgentChange={handleAgentChange}
            />

            <div className="flex items-center space-x-4">
              <span className="text-sm text-white/70">{user.email}</span>
              {user.isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/admin")}
                  className="bg-purple-600/20 border-purple-500/30 text-purple-200 hover:bg-purple-600 hover:text-white"
                >
                  Admin Dashboard
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Assistant UI Thread List - handles thread creation automatically */}
          <div className="w-80 border-r border-white/10 bg-black/30 backdrop-blur-sm p-4">
            <div className="mb-4">
              <h2 className="font-semibold text-white/90 mb-2">
                Conversations
              </h2>
            </div>
            <ThreadList />
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col min-h-0">
            <Thread />
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
