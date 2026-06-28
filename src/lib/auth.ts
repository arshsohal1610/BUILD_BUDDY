// Mock client-side auth for demo. Replace with Flask/FastAPI calls later.
import { useEffect, useState } from "react";

export type User = {
  username: string;
  email: string;
};

const KEY = "buildbuddy-user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export function setUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) window.localStorage.setItem(KEY, JSON.stringify(user));
  else window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("buildbuddy-auth"));
}

export function useUser() {
  const [user, set] = useState<User | null>(null);
  useEffect(() => {
    set(getUser());
    const handler = () => set(getUser());
    window.addEventListener("buildbuddy-auth", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("buildbuddy-auth", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return user;
}
