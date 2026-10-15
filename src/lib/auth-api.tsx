"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, type PublicUser } from "@/lib/api";

interface AuthCtx {
  user: PublicUser | null;
  ready: boolean;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<string | null>;
  signin: (email: string, password: string) => Promise<string | null>;
  signout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      await refresh();
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, [refresh]);

  const signup: AuthCtx["signup"] = async (name, email, password, phone) => {
    try {
      const { user, token } = await api.signup({ name, email, password, phone });
      setToken(token);
      setUser(user);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Signup failed";
    }
  };

  const signin: AuthCtx["signin"] = async (email, password) => {
    try {
      const { user, token } = await api.signin({ email, password });
      setToken(token);
      setUser(user);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Signin failed";
    }
  };

  const signout = () => {
    setToken(null);
    setUser(null);
  };

  const val = useMemo(
    () => ({ user, ready, signup, signin, signout, refresh }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, ready]
  );
  return <Ctx.Provider value={val}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
