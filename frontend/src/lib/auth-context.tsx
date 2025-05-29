"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthState, User, Thread, Message } from "@/types";
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
      const templateUser = dummyUsers.find((u: User) => !u.isAdmin);
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

  const addThread = (thread: Thread) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      threads: [thread, ...user.threads], // Add new thread at the beginning
    };

    setUser(updatedUser);
    localStorage.setItem("alpha-user", JSON.stringify(updatedUser));
  };

  const updateThread = (threadId: string, messages: Message[]) => {
    if (!user) return;

    const updatedThreads = user.threads.map((thread) =>
      thread.id === threadId
        ? { ...thread, messages, lastUpdated: new Date() }
        : thread
    );

    const updatedUser = {
      ...user,
      threads: updatedThreads.sort(
        (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
      ),
    };

    setUser(updatedUser);
    localStorage.setItem("alpha-user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, addThread, updateThread }}
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
