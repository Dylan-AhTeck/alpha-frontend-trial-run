import { supabase } from "@/lib/supabase/client";
import { EmailCheckResponse } from "../types/auth.types";

// =============================================================================
// AUTH API FUNCTIONS
// =============================================================================

/**
 * Check if a user exists and their beta status
 */
export async function checkUserStatus(
  email: string
): Promise<EmailCheckResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/check-user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check user status");
  }

  return response.json();
}

/**
 * Request beta access for non-beta users
 */
export async function requestBetaAccess(email: string): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/non-beta-request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to submit beta request");
  }
}

/**
 * Resend email verification
 */
export async function resendEmailVerification(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/confirmed`,
    },
  });

  if (error) {
    throw error;
  }
}

/**
 * Fetch user role from backend
 */
export async function fetchUserRole(
  accessToken: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.role || null;
    } else {
      console.error("Failed to fetch user role:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
}
