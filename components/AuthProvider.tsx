"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  type ReactNode,
} from "react";
import { getMe, logout as apiLogout, type AuthUser } from "@/lib/auth";
import { resetSaved } from "@/lib/saved-store";
import { clearSharedReads } from "@/lib/read-sharing";

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const revision = useRef(0);

  const refresh = useCallback(async () => {
    const epoch = ++revision.current;
    try {
      const next = await getMe();
      if (epoch === revision.current) setUser(next);
    } catch {
      if (epoch === revision.current) setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    revision.current += 1;
    clearSharedReads();
    await apiLogout().catch(() => {});
    setUser(null);
    resetSaved();
  }, []);

  useEffect(() => {
    let active = true;
    const epoch = revision.current;
    getMe()
      .then((u) => {
        if (active && epoch === revision.current) setUser(u);
      })
      .catch(() => {
        if (active && epoch === revision.current) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
