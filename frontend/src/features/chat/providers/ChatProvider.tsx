// Chat Provider - Manages chat/assistant runtime and authentication
"use client";

import { PropsWithChildren, useMemo } from "react";
import {
  AssistantRuntimeProvider,
  useCloudThreadListRuntime,
  useThreadListItemRuntime,
  AssistantCloud,
} from "@assistant-ui/react";
import {
  useLangGraphRuntime,
  type LangChainMessage,
} from "@assistant-ui/react-langgraph";
import { useAuth } from "@/lib/auth-context";
import { chatApi } from "../api/chat-api";

// Custom LangGraph runtime hook
const useChatLangGraphRuntime = () => {
  const threadListItemRuntime = useThreadListItemRuntime();

  const runtime = useLangGraphRuntime({
    stream: async function* (messages: LangChainMessage[]) {
      const { externalId } = await threadListItemRuntime.initialize();
      if (!externalId) throw new Error("Thread not found");

      console.log("[DEBUG] Streaming with thread ID:", externalId);
      const stream = await chatApi.streamMessages(externalId, messages);

      for await (const event of chatApi.parseSSEStream(stream)) {
        console.log("[DEBUG] Received event:", event);

        // Yield raw events - let useLangGraphRuntime handle conversion
        if (
          event &&
          typeof event === "object" &&
          "type" in event &&
          "data" in event
        ) {
          yield {
            event: (event as any).type,
            data: (event as any).data,
          };
        }
      }
    },
    onSwitchToThread: async (externalId: string) => {
      console.log("[DEBUG] Switching to thread:", externalId);

      try {
        // Fetch thread state from backend
        const threadState = await chatApi.getThreadState(externalId);
        console.log(
          "[DEBUG] Retrieved thread state for",
          externalId,
          ":",
          threadState
        );

        // Return the messages from the thread state
        return {
          messages: threadState.values.messages || [],
          interrupts: (threadState.tasks[0]?.interrupts || []) as any[],
        };
      } catch (error) {
        console.warn(
          "[WARN] Could not fetch thread state for",
          externalId,
          "- returning empty state"
        );
        console.warn("Error details:", error);
        // Return empty state as fallback - this is normal for Assistant Cloud managed threads
        return {
          messages: [],
          interrupts: [],
        };
      }
    },
  });

  return runtime;
};

export function ChatProvider({ children }: PropsWithChildren) {
  const { session, user, loading } = useAuth();

  // Create Assistant Cloud instance with proper token authentication
  const cloud = useMemo(() => {
    // Don't create cloud instance if user is not authenticated or still loading
    if (loading || !session || !user) return null;

    return new AssistantCloud({
      baseUrl:
        process.env["NEXT_PUBLIC_ASSISTANT_BASE_URL"] ||
        "https://proj-0sacnnij1jo5.assistant-api.com",
      authToken: async () => {
        // Get the Supabase access token
        if (!session?.access_token) {
          console.warn("[WARN] No access token available in session");
          return null;
        }

        // Exchange Supabase token for assistant-ui token via our backend
        const assistantToken = await chatApi.fetchAssistantToken(
          session.access_token
        );

        if (!assistantToken) {
          console.error("[ERROR] Failed to get assistant token from backend");
          return null;
        }

        console.log("[DEBUG] Using assistant-ui token for authentication");
        return assistantToken;
      },
    });
  }, [session, user, loading]);

  // Configure the runtime with lazy thread creation
  const runtime = useCloudThreadListRuntime({
    cloud: cloud!,
    runtimeHook: useChatLangGraphRuntime,
    create: async () => {
      console.log("[DEBUG] Creating new thread via API for user:", user?.id);
      try {
        const response = await chatApi.createThread();
        console.log("[DEBUG] Created thread with ID:", response.thread_id);
        return { externalId: response.thread_id };
      } catch (error) {
        console.error("[ERROR] Failed to create thread:", error);
        throw error;
      }
    },
    delete: async (externalId: string) => {
      console.log(
        "[DEBUG] Deleting thread:",
        externalId,
        "for user:",
        user?.id
      );
      await chatApi.deleteThread(externalId);
    },
  });

  // Don't render the provider if user is not authenticated
  if (loading || !session || !user || !cloud) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70">
          {loading ? "Loading assistant..." : "Please sign in to continue"}
        </div>
      </div>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
