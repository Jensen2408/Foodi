"use client";
import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  username: string;
  name: string | null;
  email: string;
  avatar: string | null;
  bio: string | null;
  website: string | null;
  isAdmin: boolean;
}

let cachedUser: User | null | undefined = undefined;
const listeners = new Set<(u: User | null) => void>();

export function clearUserCache() {
  cachedUser = undefined;
  listeners.forEach((fn) => fn(null));
}

export function useUser() {
  const [user, setUser] = useState<User | null | undefined>(cachedUser);

  useEffect(() => {
    listeners.add(setUser);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => {
        cachedUser = u;
        listeners.forEach((fn) => fn(u));
      });
    return () => { listeners.delete(setUser); };
  }, []);

  const mutate = useCallback((u: User | null) => {
    cachedUser = u;
    listeners.forEach((fn) => fn(u));
  }, []);

  return { user: user ?? null, loading: user === undefined, mutate };
}
