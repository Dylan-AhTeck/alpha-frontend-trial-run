"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User } from "@/types";
import { getDummyUsers } from "./dummy-data";

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem("alpha-user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Ensure we get fresh dummy data on refresh
        const dummyUsers = getDummyUsers();
        const freshUser = dummyUsers.find(
          (u: User) => u.email === parsedUser.email
        );

        if (freshUser) {
          setUser(freshUser);
        } else {
          setUser(parsedUser);
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("alpha-user");
      }
    }
  }, []);

  const login = async (email: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const dummyUsers = getDummyUsers();
    let userToLogin = dummyUsers.find((u: User) => u.email === email);

    if (!userToLogin) {
      // For any email not in dummy data, use the first non-admin user as template
      // but with the entered email (for demo purposes)
      const templateUser = dummyUsers.find((u) => !u.isAdmin);
      if (templateUser && email !== "admin@alpha.com") {
        userToLogin = {
          ...templateUser,
          id: `user-${Date.now()}`,
          email,
          isAdmin: false,
        };
      } else {
        // Create new user for admin or fallback
        userToLogin = {
          id: `user-${Date.now()}`,
          email,
          threads: [],
          isAdmin: email === "admin@alpha.com",
        };
      }
    }

    setUser(userToLogin);
    setIsAuthenticated(true);
    localStorage.setItem("alpha-user", JSON.stringify(userToLogin));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("alpha-user");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
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
