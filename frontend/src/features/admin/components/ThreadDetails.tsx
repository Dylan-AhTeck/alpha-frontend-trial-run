// Thread Details Component - Displays conversation messages and details
import React from "react";
import { MessageCircle, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ThreadDetailsProps } from "../types/admin.types";

export default function ThreadDetails({ thread }: ThreadDetailsProps) {
  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-white/60">
          <MessageCircle className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Conversation</h3>
          <p className="text-sm">
            Choose a user conversation from the sidebar to view the complete
            thread
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Conversation Header */}
      <div className="border-b border-white/10 p-4 bg-black/30">
        <div className="flex items-center space-x-3 mb-2">
          <User className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-lg">{thread.userEmail}</h3>
        </div>
        <h4 className="font-medium text-white/90 mb-1">{thread.title}</h4>
        <p className="text-sm text-white/60">
          {thread.messages.length} messages • Last updated{" "}
          {formatDistanceToNow(new Date(thread.last_updated), {
            addSuffix: true,
          })}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {thread.messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
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
                    ? thread.userEmail
                    : "Dylan IdentityX"}{" "}
                  •{" "}
                  {message.timestamp
                    ? new Date(message.timestamp).toLocaleString()
                    : "Unknown time"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
