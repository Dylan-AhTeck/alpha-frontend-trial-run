"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { Thread as ThreadType, User as UserType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { getDummyUsers } from "@/lib/dummy-data";

export default function AdminPage() {
  const { user, session, signOut } = useAuth();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedThread, setSelectedThread] = useState<ThreadType | null>(null);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (!session || !user?.email?.includes("admin")) {
      router.push("/dashboard");
      return;
    }

    // Load all users and their threads
    const users = getDummyUsers().filter((u) => !u.isAdmin);
    setAllUsers(users);
  }, [session, user, router]);

  if (!session || !user?.email?.includes("admin")) {
    return null; // Will redirect
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard");
  };

  const handleLogout = async () => {
    await signOut();
    // Don't manually redirect - let the SIGNED_OUT event handle it
  };

  // Get all threads from all users, sorted by last updated
  const allThreads = allUsers
    .flatMap((u) =>
      u.threads.map((thread) => ({
        ...thread,
        userEmail: u.email,
        userId: u.id,
      }))
    )
    .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());

  return (
    <div className="h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="h-6 w-px bg-white/20" />
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-white/70">{user.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - All User Threads */}
        <div className="w-80 border-r border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="p-4 border-b border-white/10">
            <h2 className="font-semibold text-white/90">User Conversations</h2>
            <p className="text-xs text-white/60 mt-1">
              {allThreads.length} total conversations from {allUsers.length}{" "}
              users
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {allThreads.length > 0 ? (
              <div className="space-y-1 p-2">
                {allThreads.map((thread) => (
                  <button
                    key={`${thread.userId}-${thread.id}`}
                    onClick={() => {
                      const threadUser = allUsers.find(
                        (u) => u.id === thread.userId
                      );
                      setSelectedUser(threadUser || null);
                      setSelectedThread(thread);
                    }}
                    className={`w-full text-left p-3 rounded-lg transition-all hover:bg-white/10 ${
                      selectedThread?.id === thread.id
                        ? "bg-white/20 border border-white/30"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="w-4 h-4 text-blue-400" />
                      <span className="font-medium text-sm truncate">
                        {thread.userEmail}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageCircle className="w-3 h-3 text-green-400" />
                      <span className="text-sm text-white/80 truncate">
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
                <p className="text-sm">No conversations found</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversation View */}
        <div className="flex-1 flex flex-col">
          {selectedThread && selectedUser ? (
            <div className="flex-1 flex flex-col">
              {/* Conversation Header */}
              <div className="border-b border-white/10 p-4 bg-black/30">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-lg">
                    {selectedUser.email}
                  </h3>
                </div>
                <h4 className="font-medium text-white/90 mb-1">
                  {selectedThread.title}
                </h4>
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
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="flex flex-col max-w-[80%]">
                        <div
                          className={`rounded-lg p-3 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-white/10 text-white border border-white/20"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-white/50 mt-1 px-1">
                          {message.role === "user"
                            ? selectedUser.email
                            : "Dylan IdentityX"}{" "}
                          • {message.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-white/60">
                <MessageCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Select a Conversation
                </h3>
                <p className="text-sm">
                  Choose a user conversation from the sidebar to view the
                  complete thread
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
