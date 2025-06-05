// Admin API - Feature-specific API functions
// This file contains all admin-related API calls

import { Session } from "@supabase/supabase-js";
import { BackendThread, Message, ThreadWithUser } from "@/shared/types";
import { config } from "@/lib/env";

const API_BASE_URL = config.NEXT_PUBLIC_API_BASE_URL;

/**
 * Transform a backend message to frontend format
 */
function transformBackendMessage(backendMessage: {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string | null;
}): Message {
  return {
    id: backendMessage.id,
    content: backendMessage.content,
    role: backendMessage.role,
    timestamp: backendMessage.timestamp,
  };
}

/**
 * Transform a backend thread to frontend format
 */
function transformBackendThread(backendThread: BackendThread): ThreadWithUser {
  return {
    id: backendThread.id,
    title: backendThread.title,
    messages: backendThread.messages.map(transformBackendMessage),
    last_updated: backendThread.last_updated,
    message_count: backendThread.message_count || backendThread.messages.length,
    created_at: backendThread.created_at || backendThread.last_updated,
    user_email: backendThread.user_email,
    user_id: backendThread.user_id,
    status: backendThread.status || "active",
    raw_metadata: backendThread.raw_metadata,
    userEmail: backendThread.user_email,
    userId: backendThread.user_id,
  };
}

/**
 * Transform array of backend threads to frontend format and sort by last updated
 */
function transformBackendThreads(
  backendThreads: BackendThread[]
): ThreadWithUser[] {
  return backendThreads
    .map(transformBackendThread)
    .sort(
      (a, b) =>
        new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );
}

/**
 * Fetch all threads from the admin endpoint
 */
export async function getAllThreads(
  session: Session
): Promise<ThreadWithUser[]> {
  const response = await fetch(`${API_BASE_URL}/api/admin/threads`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to fetch admin threads: ${response.status} - ${errorText}`
    );
  }

  const backendThreads: BackendThread[] = await response.json();
  return transformBackendThreads(backendThreads);
}

/**
 * Delete a thread (admin action)
 */
export async function deleteThread(
  threadId: string,
  session: Session
): Promise<void> {
  // Step 1: Delete from backend (LangGraph)
  const response = await fetch(
    `${API_BASE_URL}/api/admin/threads/${threadId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete thread from backend: ${response.status} - ${errorText}`
    );
  }
}

/**
 * Bulk delete multiple threads
 */
export async function bulkDeleteThreads(
  threadIds: string[],
  session: Session
): Promise<void> {
  const deletePromises = threadIds.map((id) => deleteThread(id, session));
  await Promise.all(deletePromises);
}

// Export transformation utilities for testing/other uses
export { transformBackendThread, transformBackendThreads };
