// Chat API - API functions for chat/assistant functionality
import { LangChainMessage } from "@assistant-ui/react-langgraph";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CreateThreadResponse {
  thread_id: string;
}

export interface SendMessageRequest {
  messages: ChatMessage[];
}

export interface ThreadState {
  values: {
    messages?: LangChainMessage[];
  };
  tasks: {
    interrupts?: unknown[];
  }[];
}

/**
 * Generate a pending thread ID for frontend state management
 */
function generatePendingThreadId(): string {
  return `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new thread via our FastAPI backend
 */
async function createThread(): Promise<CreateThreadResponse> {
  const response = await fetch(`${API_BASE_URL}/api/threads`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    throw new Error(`Failed to create thread: ${response.status}`);
  }

  return response.json();
}

/**
 * Get thread state from the backend
 */
async function getThreadState(threadId: string): Promise<ThreadState> {
  const response = await fetch(`${API_BASE_URL}/api/threads/${threadId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get thread state: ${response.status}`);
  }

  return await response.json();
}

/**
 * Delete a thread via our FastAPI backend
 */
async function deleteThread(threadId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/threads/${threadId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete thread: ${response.status}`);
  }
}

/**
 * Stream messages to a thread via our FastAPI backend
 */
async function streamMessages(
  threadId: string,
  messages: LangChainMessage[]
): Promise<ReadableStream<Uint8Array>> {
  const response = await fetch(
    `${API_BASE_URL}/api/threads/${threadId}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to stream messages: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("No response body available");
  }

  return response.body;
}

/**
 * Helper function to parse Server-Sent Events (SSE) from stream
 */
async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<unknown, void, unknown> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            return;
          }
          try {
            yield JSON.parse(data);
          } catch {
            console.warn("Failed to parse SSE data:", data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Function to fetch assistant-ui token from our backend
 */
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

// Export as an object for cleaner imports
export const chatApi = {
  generatePendingThreadId,
  createThread,
  getThreadState,
  deleteThread,
  streamMessages,
  parseSSEStream,
  fetchAssistantToken,
};
