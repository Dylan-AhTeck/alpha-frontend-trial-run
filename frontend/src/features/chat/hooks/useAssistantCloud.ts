import { useMemo } from "react";
import { AssistantCloud } from "@assistant-ui/react";
import { useAuth } from "@/lib/auth-context";
import { chatApi } from "../api/chat-api";

/**
 * Custom hook that creates and memoizes an AssistantCloud client
 * Can be used throughout the application while maintaining proper auth and caching
 */
export function useAssistantCloud() {
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
          return null;
        }

        // Exchange Supabase token for assistant-ui token via our backend
        const assistantToken = await chatApi.fetchAssistantToken(
          session.access_token
        );

        if (!assistantToken) {
          return null;
        }

        return assistantToken;
      },
    });
  }, [session, user, loading]);

  return {
    cloud,
    isReady: !loading && !!session && !!user && !!cloud,
    isLoading: loading,
    isAuthenticated: !!session && !!user,
  };
}
