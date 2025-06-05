// Chat Provider - Manages chat/assistant runtime and authentication
"use client";

import { PropsWithChildren } from "react";
import {
  AssistantRuntimeProvider,
  useCloudThreadListRuntime,
  useThreadListItemRuntime,
} from "@assistant-ui/react";
import {
  useLangGraphRuntime,
  type LangChainMessage,
  type LangGraphInterruptState,
} from "@assistant-ui/react-langgraph";
import { chatApi } from "../api/chat-api";
import { useAssistantCloud } from "../hooks/useAssistantCloud";

// Custom LangGraph runtime hook
const useChatLangGraphRuntime = () => {
  const threadListItemRuntime = useThreadListItemRuntime();

  const runtime = useLangGraphRuntime({
    stream: async function* (messages: LangChainMessage[]) {
      const { externalId } = await threadListItemRuntime.initialize();
      if (!externalId) throw new Error("Thread not found");

      const stream = await chatApi.streamMessages(externalId, messages);

      for await (const event of chatApi.parseSSEStream(stream)) {
        // Yield raw events - let useLangGraphRuntime handle conversion
        if (
          event &&
          typeof event === "object" &&
          "type" in event &&
          "data" in event
        ) {
          yield {
            event: (event as { type: string; data: unknown }).type,
            data: (event as { type: string; data: unknown }).data,
          };
        }
      }
    },
    onSwitchToThread: async (externalId: string) => {
      try {
        // Fetch thread state from backend
        const threadState = await chatApi.getThreadState(externalId);

        // Return the messages from the thread state
        return {
          messages: threadState.values.messages || [],
          interrupts: (threadState.tasks[0]?.interrupts ||
            []) as LangGraphInterruptState[],
        };
      } catch {
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
  const { cloud, isReady, isLoading } = useAssistantCloud();

  // Configure the runtime with lazy thread creation
  const runtime = useCloudThreadListRuntime({
    cloud: cloud!,
    runtimeHook: useChatLangGraphRuntime,
    create: async () => {
      try {
        const response = await chatApi.createThread();
        return { externalId: response.thread_id };
      } catch (error) {
        throw error;
      }
    },
    delete: async (externalId: string) => {
      await chatApi.deleteThread(externalId);
    },
  });

  // Don't render the provider if user is not authenticated
  if (!isReady) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70">
          {isLoading ? "Loading assistant..." : "Please sign in to continue"}
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
