"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";

interface UserSubscription {
  status: string;
  currentPeriodEnd?: string;
}

interface User {
  id: string;
  email: string;
  name?: string | null;
  role: string;
  ageVerified: boolean;
  avatarUrl?: string | null;
  subscription?: UserSubscription | null;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch("/api/auth/me", { signal: controller.signal });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Cookie inválido/expirado — apaga para não criar loop proxy ↔ auth
        await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro ao fazer login");
    }

    const data = await res.json();
    flushSync(() => {
      setUser(data.user);
    });

    if (data.user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
  };

  const isSubscribed = user?.subscription?.status === "ACTIVE";
  const isAdmin = user?.role === "ADMIN";

  return (
    <AuthContext.Provider
      value={{ user, loading, isSubscribed, isAdmin, login, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
