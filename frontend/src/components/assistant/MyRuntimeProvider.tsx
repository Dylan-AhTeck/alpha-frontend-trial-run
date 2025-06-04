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
import {
  streamMessages,
  parseSSEStream,
  getThreadState,
  createThread,
  deleteThread,
} from "@/shared/api/chatApi";
import { useAuth } from "@/lib/auth-context";

// Custom LangGraph runtime hook
const useMyLangGraphRuntime = () => {
  const threadListItemRuntime = useThreadListItemRuntime();

  const runtime = useLangGraphRuntime({
    stream: async function* (messages: LangChainMessage[]) {
      const { externalId } = await threadListItemRuntime.initialize();
      if (!externalId) throw new Error("Thread not found");

      console.log("[DEBUG] Streaming with thread ID:", externalId);
      const stream = await streamMessages(externalId, messages as any);

      for await (const event of parseSSEStream(stream)) {
        console.log("[DEBUG] Received event:", event);

        // Yield raw events - let useLangGraphRuntime handle conversion
        if (event.type && event.data) {
          yield {
            event: event.type,
            data: event.data,
          };
        }
      }
    },
    onSwitchToThread: async (externalId: string) => {
      console.log("[DEBUG] Switching to thread:", externalId);

      try {
        // Fetch thread state from backend
        const threadState = await getThreadState(externalId);
        console.log(
          "[DEBUG] Retrieved thread state for",
          externalId,
          ":",
          threadState
        );

        // Return the messages from the thread state
        return {
          messages: threadState.values.messages || [],
          interrupts: threadState.tasks[0]?.interrupts || [],
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

// Function to fetch assistant-ui token from our backend
async function fetchAssistantToken(
  supabaseToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/assistant/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "[ERROR] Failed to fetch assistant token:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    console.log("[DEBUG] Successfully fetched assistant token from backend");
    return data.token;
  } catch (error) {
    console.error("[ERROR] Error fetching assistant token:", error);
    return null;
  }
}

export function MyRuntimeProvider({ children }: PropsWithChildren) {
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
        const assistantToken = await fetchAssistantToken(session.access_token);

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
    runtimeHook: useMyLangGraphRuntime,
    create: async () => {
      console.log("[DEBUG] Creating new thread via API for user:", user?.id);
      try {
        const response = await createThread();
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
      await deleteThread(externalId);
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
