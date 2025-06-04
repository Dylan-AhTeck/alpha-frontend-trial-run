import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./useAuth";
import { UseAuthRedirectOptions } from "../types/auth.types";

/**
 * Hook for handling authentication-based redirects
 * @param options Configuration for redirect behavior
 */
export function useAuthRedirect(options: UseAuthRedirectOptions) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // If no condition provided, use default auth check
    const shouldRedirect = options.condition
      ? options.condition(user, userRole)
      : !user;

    if (shouldRedirect) {
      router.push(options.redirectTo);
    }
  }, [user, loading, userRole, router, options]);

  return { user, loading, userRole };
}
