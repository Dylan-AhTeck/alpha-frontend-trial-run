import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { ThreadWithUser } from "@/shared/types";
import { useAssistantCloud } from "@/features/chat";
import * as adminAPI from "../api/admin-api";

// Query keys for React Query
export const adminQueryKeys = {
  threads: ["admin", "threads"] as const,
  thread: (id: string) => ["admin", "thread", id] as const,
};

/**
 * Hook for fetching all admin threads with React Query
 */
export function useAdminThreadsQuery() {
  const { session } = useAuth();

  return useQuery({
    queryKey: adminQueryKeys.threads,
    queryFn: () => {
      if (!session) {
        throw new Error("No session available");
      }
      return adminAPI.getAllThreads(session);
    },
    enabled: !!session,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });
}

/**
 * Hook for deleting a thread with optimistic updates
 * Also removes the thread from AssistantCloud
 */
export function useDeleteThreadMutation() {
  const { session } = useAuth();
  const { cloud } = useAssistantCloud();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadId }: { threadId: string }) => {
      if (!session) {
        throw new Error("No session available");
      }

      // First delete from backend
      await adminAPI.deleteThread(threadId, session);

      // Then delete from AssistantCloud if available
      if (cloud) {
        try {
          // List all threads and find the one with matching external_id
          const assistantThreads = await cloud.threads.list();

          // Handle the response - it might be an array or have a data property
          const threadsArray = assistantThreads.threads;

          const matchingThread = threadsArray.find(
            (thread) => thread.external_id === threadId
          );

          if (matchingThread?.id) {
            await cloud.threads.delete(matchingThread.id);
          }
        } catch {
          // Don't throw here - backend deletion was successful
        }
      }

      return { threadId };
    },
    onMutate: async ({ threadId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.threads });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<ThreadWithUser[]>(
        adminQueryKeys.threads
      );

      // Optimistically update the cache
      queryClient.setQueryData<ThreadWithUser[]>(
        adminQueryKeys.threads,
        (old) => (old ? old.filter((thread) => thread.id !== threadId) : [])
      );

      // Return context with the previous and new data
      return { previousThreads };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousThreads) {
        queryClient.setQueryData(
          adminQueryKeys.threads,
          context.previousThreads
        );
      }
    },
    onSettled: () => {
      // Refetch threads after mutation (success or error)
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.threads });
    },
  });
}

/**
 * Hook for bulk deleting threads
 * Also removes threads from AssistantCloud
 */
export function useBulkDeleteThreadsMutation() {
  const { session } = useAuth();
  const { cloud } = useAssistantCloud();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ threadIds }: { threadIds: string[] }) => {
      if (!session) {
        throw new Error("No session available");
      }

      // First delete from backend
      await adminAPI.bulkDeleteThreads(threadIds, session);

      // Then delete from AssistantCloud if available
      if (cloud) {
        try {
          // List all threads and find matching ones
          const assistantThreads = await cloud.threads.list();

          // Handle the response - it might be an array or have a data property
          const threadsArray = Array.isArray(assistantThreads)
            ? assistantThreads
            : (assistantThreads as { data?: unknown[] }).data || [];

          const matchingThreads = threadsArray.filter(
            (thread: { id?: string; metadata?: { externalId?: string } }) =>
              threadIds.includes(thread.metadata?.externalId || "")
          );

          // Delete each matching thread
          const deletePromises = matchingThreads.map(
            async (thread: { id?: string }) => {
              if (thread.id) {
                try {
                  await cloud.threads.delete(thread.id);
                } catch {
                  // Continue with other deletions even if one fails
                }
              }
            }
          );

          await Promise.allSettled(deletePromises);
        } catch {
          // Don't throw here - backend deletion was successful
        }
      }

      return { threadIds };
    },
    onMutate: async ({ threadIds }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: adminQueryKeys.threads });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<ThreadWithUser[]>(
        adminQueryKeys.threads
      );

      // Optimistically update the cache
      queryClient.setQueryData<ThreadWithUser[]>(
        adminQueryKeys.threads,
        (old) =>
          old ? old.filter((thread) => !threadIds.includes(thread.id)) : []
      );

      // Return context with the previous data
      return { previousThreads };
    },
    onError: (err, variables, context) => {
      // Rollback to the previous value on error
      if (context?.previousThreads) {
        queryClient.setQueryData(
          adminQueryKeys.threads,
          context.previousThreads
        );
      }
    },
    onSettled: () => {
      // Refetch threads after mutation
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.threads });
    },
  });
}
