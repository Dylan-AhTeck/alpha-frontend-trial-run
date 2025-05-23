"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle, Plus } from "lucide-react";
import { Thread as ThreadType } from "@/types";
import { formatDistanceToNow } from "date-fns";

// Wrapper component that creates a fresh runtime
function FreshThreadWrapper() {
  const runtime = useChatRuntime({
    api: "/api/chat",
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex-1 flex flex-col">
        {/* New Thread Header */}
        <div className="border-b border-white/10 p-4 bg-black/30">
          <h3 className="font-semibold">New Chat with Dylan IdentityX</h3>
          <p className="text-sm text-white/60">
            Start a live conversation with Dylan
          </p>
        </div>
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
}

export default function DashboardPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const [selectedThread, setSelectedThread] = useState<ThreadType | null>(null);
  const [threadKey, setThreadKey] = useState(0);

  const runtime = useChatRuntime({
    api: "/api/chat",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Auto-select first thread if available
    if (user?.threads && user.threads.length > 0 && !selectedThread) {
      setSelectedThread(user.threads[0]);
    }
  }, [isAuthenticated, router, user?.threads, selectedThread]);

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleNewThread = () => {
    // Reset the selected thread to show the assistant-ui interface
    setSelectedThread(null);
    // Force a new runtime instance by changing the key
    setThreadKey((prev) => prev + 1);
  };

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="h-screen bg-black text-white flex flex-col">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/50 backdrop-blur-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">D</span>
              </div>
              <h1 className="text-xl font-bold">Dylan IdentityX</h1>
            </div>

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
          {/* Sidebar - Thread List */}
          <div className="w-80 border-r border-white/10 bg-black/30 backdrop-blur-sm">
            <div className="p-4 border-b border-white/10">
              <h2 className="font-semibold text-white/90">Conversations</h2>
            </div>

            <div className="p-2">
              <Button
                onClick={handleNewThread}
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 mb-2"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Thread
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {user.threads && user.threads.length > 0 ? (
                <div className="space-y-1 p-2">
                  {user.threads.map((thread) => (
                    <button
                      key={thread.id}
                      onClick={() => setSelectedThread(thread)}
                      className={`w-full text-left p-3 rounded-lg transition-all hover:bg-white/10 ${
                        selectedThread?.id === thread.id
                          ? "bg-white/20 border border-white/30"
                          : "bg-white/5"
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <MessageCircle className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-sm truncate">
                          {thread.title}
                        </span>
                      </div>
                      <div className="text-xs text-white/60">
                        {formatDistanceToNow(thread.lastUpdated, {
                          addSuffix: true,
                        })}
                      </div>
                      <div className="text-xs text-white/50">
                        {thread.messages.length} messages
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-white/60">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs">
                    Start a new thread to begin chatting
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 flex flex-col">
            {selectedThread ? (
              <div className="flex-1 flex flex-col">
                {/* Thread Header */}
                <div className="border-b border-white/10 p-4 bg-black/30">
                  <h3 className="font-semibold">{selectedThread.title}</h3>
                  <p className="text-sm text-white/60">
                    {selectedThread.messages.length} messages • Last updated{" "}
                    {formatDistanceToNow(selectedThread.lastUpdated, {
                      addSuffix: true,
                    })}
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {selectedThread.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-white/10 text-white border border-white/20"
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="border-t border-white/10 p-4 bg-black/30">
                  <p className="text-sm text-white/60 text-center">
                    This is a demo conversation. Click &quot;New Thread&quot; to
                    start a live chat with Dylan.
                  </p>
                </div>
              </div>
            ) : (
              <FreshThreadWrapper key={threadKey} />
            )}
          </div>
        </div>
      </div>
    </AssistantRuntimeProvider>
  );
}
