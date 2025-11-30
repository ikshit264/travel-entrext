"use client";

import { useEffect, useState } from "react";
import { User } from "@/utils/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user");
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: any) => {
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "signup", email, password, name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Signup failed");
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    user,
    loading,
    error,
    updateUser,
    login,
    signup,
    logout,
    refetch: fetchUser,
  };
}
