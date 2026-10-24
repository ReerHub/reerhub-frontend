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
import {
  notifySessionChange,
  subscribeSessionChange,
} from "@/lib/session-sync";

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

  const identity = useRef<string | null>(null);

  const applyUser = useCallback((next: AuthUser | null) => {
    if (identity.current !== (next?.id || null)) {
      clearSharedReads();
      resetSaved(next?.id);
      identity.current = next?.id || null;
    }
    setUser(next);
  }, []);

  const checkSession = useCallback(
    async (announce = false) => {
      const epoch = ++revision.current;
      try {
        const next = await getMe();
        if (epoch === revision.current) {
          applyUser(next);
          if (announce) notifySessionChange();
        }
      } catch {
        if (epoch === revision.current) applyUser(null);
      } finally {
        if (epoch === revision.current) setLoading(false);
      }
    },
    [applyUser],
  );

  const refresh = useCallback(() => checkSession(true), [checkSession]);

  const logout = useCallback(async () => {
    const epoch = ++revision.current;
    clearSharedReads();
    await apiLogout().catch(() => {});
    if (epoch === revision.current) {
      applyUser(null);
      setLoading(false);
    }
    notifySessionChange();
  }, [applyUser]);

  useEffect(() => {
    // Announce the initial verified session once; received hints and focus checks never announce.
    void Promise.resolve().then(() => checkSession(true));
    const check = () => {
      void checkSession();
    };
    const visible = () => {
      if (document.visibilityState === "visible") check();
    };
    const unsubscribe = subscribeSessionChange(check);
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    document.addEventListener("visibilitychange", visible);
    return () => {
      revision.current += 1;
      unsubscribe();
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
      document.removeEventListener("visibilitychange", visible);
    };
  }, [checkSession]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
