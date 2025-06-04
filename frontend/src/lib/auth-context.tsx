"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { AuthState } from "@/shared/types";
import { supabase } from "./supabase/client";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Listen for auth changes and handle redirects
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      // Update state
      console.log("Session:", session);
      setSession(session);
      setUser(session?.user ?? null);

      // Fetch user role from /me endpoint
      if (session?.access_token) {
        const role = await fetchUserRole(session.access_token);
        setUserRole(role);
      } else {
        setUserRole(null);
      }

      // Handle different auth events
      switch (event) {
        case "INITIAL_SESSION":
          // Initial session loaded - we can stop loading
          setLoading(false);
          // If user is already authenticated, redirect to dashboard
          // BUT don't redirect if we're on the confirmed page
          if (
            session?.user &&
            !window.location.pathname.startsWith("/confirmed")
          ) {
            router.push("/dashboard");
          }
          break;

        case "SIGNED_IN":
          // User just signed in - test JWT hook then redirect to dashboard
          setLoading(false);

          if (!window.location.pathname.startsWith("/confirmed")) {
            router.push("/dashboard");
          }
          break;

        case "SIGNED_OUT":
          // User signed out - redirect to home/login
          setLoading(false);
          router.push("/");
          break;

        case "TOKEN_REFRESHED":
          // Token was refreshed - no redirect needed, just update state
          setLoading(false);
          console.log("Token refreshed successfully");

          break;

        default:
          setLoading(false);
          break;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // Don't manually redirect - let the SIGNED_IN event handle it
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/confirmed`,
      },
    });
    if (error) throw error;
    // Don't manually redirect - let the auth event listener handle it
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // Don't manually redirect - let the SIGNED_OUT event handle it
  };

  // Helper function to fetch user role from /me endpoint
  const fetchUserRole = async (accessToken: string): Promise<string | null> => {
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
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        userRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
