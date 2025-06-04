// Thread List Component - Displays list of user conversations in sidebar
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { MessageCircle, User, Loader2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Sidebar } from "@/shared/components/layout";
import { ThreadListProps } from "../types/admin.types";

export default function ThreadList({
  threads,
  selectedThread,
  loading,
  error,
  deleting,
  onThreadSelect,
  onThreadDelete,
  onRefresh,
}: ThreadListProps) {
  return (
    <Sidebar width="md">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-white/10">
        <h2 className="font-semibold text-white/90">User Conversations</h2>
        <p className="text-sm text-white/60 mt-1">
          {threads.length} total conversations
        </p>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-white/60" />
            <span className="ml-2 text-white/60">Loading conversations...</span>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <p className="text-red-400 text-sm mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black"
            >
              Try Again
            </Button>
          </div>
        )}

        {!loading && !error && threads.length === 0 && (
          <div className="p-8 text-center">
            <MessageCircle className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h3 className="text-white/70 font-medium mb-2">No Conversations</h3>
            <p className="text-white/50 text-sm">
              No user conversations found in the system.
            </p>
          </div>
        )}

        {!loading && !error && threads.length > 0 && (
          <div className="space-y-1 p-2">
            {threads.map((thread) => (
              <div
                key={thread.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                  selectedThread?.id === thread.id
                    ? "bg-white/10 border border-white/20"
                    : "hover:bg-white/5"
                }`}
                onClick={() => onThreadSelect(thread)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-4 h-4 text-white/60 flex-shrink-0" />
                      <span className="text-sm text-white/80 truncate">
                        {thread.user_email || "Unknown User"}
                      </span>
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1 truncate">
                      {thread.title || "Untitled Conversation"}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>
                        {thread.messages.length} message
                        {thread.messages.length !== 1 ? "s" : ""}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(thread.last_updated), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onThreadDelete(
                        thread.id,
                        thread.title || "Untitled Conversation"
                      );
                    }}
                    disabled={deleting === thread.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                  >
                    {deleting === thread.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
