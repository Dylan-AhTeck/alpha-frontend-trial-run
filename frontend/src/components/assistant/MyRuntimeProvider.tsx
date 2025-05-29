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
} from "@/lib/chatApi";

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

export function MyRuntimeProvider({ children }: PropsWithChildren) {
  // Create Assistant Cloud instance
  const cloud = useMemo(
    () =>
      new AssistantCloud({
        baseUrl:
          process.env["NEXT_PUBLIC_ASSISTANT_BASE_URL"] ||
          "https://proj-0sacnnij1jo5.assistant-api.com",
        anonymous: true, // Using anonymous mode for now
      }),
    []
  );

  // Configure the runtime with lazy thread creation
  const runtime = useCloudThreadListRuntime({
    cloud,
    runtimeHook: useMyLangGraphRuntime,
    create: async () => {
      console.log("[DEBUG] Creating new thread via API...");
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
      console.log("[DEBUG] Deleting thread:", externalId);
      await deleteThread(externalId);
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
