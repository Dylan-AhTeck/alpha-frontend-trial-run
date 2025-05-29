// Chat API utilities for interfacing with our FastAPI backend

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
    messages?: any[];
  };
  tasks: any[];
}

/**
 * Generate a pending thread ID for frontend state management
 */
export function generatePendingThreadId(): string {
  return `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new thread via our FastAPI backend
 */
export async function createThread(): Promise<CreateThreadResponse> {
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
export async function getThreadState(threadId: string): Promise<ThreadState> {
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
export async function deleteThread(threadId: string): Promise<void> {
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
export async function streamMessages(
  threadId: string,
  messages: ChatMessage[]
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
export async function* parseSSEStream(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<any, void, unknown> {
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
          } catch (e) {
            console.warn("Failed to parse SSE data:", data);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
