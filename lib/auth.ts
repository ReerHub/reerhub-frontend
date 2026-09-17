import { API_BASE } from "@/lib/reerhub";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  authProvider: "email" | "google";
  role: string;
  emailVerified: boolean;
  profile: {
    headline?: string;
    currentRole?: string;
    techTrack?: string;
    techRoles?: string[];
    skills?: string[];
    city?: string;
    experienceYears?: number;
    remoteType?: string;
  };
  createdAt?: string;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await doFetch(path, init);
  if (res.status === 401 && !path.startsWith("/auth/")) {
    // Access cookie may have expired while the refresh cookie is still
    // valid — rotate once and retry instead of forcing a re-login.
    const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (refreshed.ok) {
      const retry = await doFetch(path, init);
      return readBody<T>(retry);
    }
  }
  return readBody<T>(res);
}

async function doFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
}

async function readBody<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      json.message || `Request failed (${res.status})`,
    ) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return json.data as T;
}

/** Keep post-login redirects inside the app (blocks open-redirect abuse). */
export function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export const signup = (body: {
  name: string;
  email: string;
  password: string;
}) =>
  request<AuthUser>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const login = (body: { email: string; password: string }) =>
  request<AuthUser>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const googleLogin = (idToken: string) =>
  request<AuthUser>("/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });

export const logout = () =>
  request<{ loggedOut: boolean }>("/auth/logout", { method: "POST" });

export const getMe = () => request<AuthUser>("/users/me");

export const updateMe = (body: Record<string, unknown>) =>
  request<AuthUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const requestVerifyEmail = () =>
  request<{ sent: boolean }>("/auth/verify-email/request", { method: "POST" });

export const verifyEmail = (token: string) =>
  request<{ verified: boolean }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const forgotPassword = (email: string) =>
  request<{ sent: boolean }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

export const resetPassword = (token: string, password: string) =>
  request<{ reset: boolean }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });

export const savedIds = () => request<string[]>("/users/me/saved/ids");

export const saveJob = (jobId: string) =>
  request<{ saved: boolean }>(`/users/me/saved/${jobId}`, { method: "POST" });

export const unsaveJob = (jobId: string) =>
  request<{ saved: boolean }>(`/users/me/saved/${jobId}`, { method: "DELETE" });
