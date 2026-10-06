import { API_BASE, type Job } from "@/lib/reerhub";

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
    targetLocations?: string[];
    availability?: "actively-looking" | "open" | "not-looking";
    education?: string;
    experienceSummary?: string;
  };
  notificationPreferences?: {
    digest?: "daily" | "weekdays" | "weekly" | "paused";
  };
  membership?: {
    isPro: boolean;
    subscription: BillingState["subscription"];
  };
  createdAt?: string;
};

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const hit = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

async function ensureCsrf(): Promise<string | null> {
  const existing = getCookie("csrfToken");
  if (existing) return existing;
  try {
    const res = await fetch(`${API_BASE}/auth/csrf`, {
      credentials: "include",
    });
    const json = await res.json().catch(() => ({}));
    return json.data?.csrfToken || getCookie("csrfToken");
  } catch {
    return null;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await doFetch(path, init);
  if (res.status === 401 && !path.startsWith("/auth/")) {
    // Access cookie may have expired while the refresh cookie is still
    // valid — rotate once and retry instead of forcing a re-login.
    // NOTE: the refresh call itself is a POST and always needs a CSRF
    // token, even when the original request was a GET (e.g. GET /users/me
    // on page load — the most common refresh trigger).
    const csrf = await ensureCsrf();
    const refreshed = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(csrf ? { "x-csrf-token": csrf } : {}),
      },
    });
    if (refreshed.ok) {
      const retry = await doFetch(path, init);
      return readBody<T>(retry);
    }
  }
  return readBody<T>(res);
}

async function doFetch(path: string, init?: RequestInit) {
  const method = (init?.method || "GET").toUpperCase();
  const csrf = method === "GET" ? null : await ensureCsrf();
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrf ? { "x-csrf-token": csrf } : {}),
      ...(init?.headers || {}),
    },
  });
}

async function readBody<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(
      json.message || `Request failed (${res.status})`,
    ) as Error & {
      status?: number;
      code?: string;
      data?: BillingState;
    };
    err.status = res.status;
    err.code = json.code;
    err.data = json.data;
    throw err;
  }
  return json.data as T;
}

/** Keep post-login redirects inside the app (blocks open-redirect abuse). */
export function safeNext(raw: string | null): string {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export const requestMagicLink = (body: {
  email: string;
  turnstileToken?: string;
}) =>
  request<{ sent: boolean }>("/auth/magic-link", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const verifyMagicLink = (token: string) =>
  request<AuthUser>(`/auth/verify-magic?token=${encodeURIComponent(token)}`);

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

export const resendVerifyPublic = (email: string, turnstileToken?: string) =>
  request<{ sent: boolean }>("/auth/verify-email/resend", {
    method: "POST",
    body: JSON.stringify({ email, turnstileToken }),
  });

export const verifyEmail = (token: string) =>
  request<{ verified: boolean }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

export const savedIds = () => request<string[]>("/users/me/saved/ids");
export const getSavedJobs = async (page = 1) => {
  const res = await doFetch(`/users/me/saved?page=${page}&limit=21`);
  if (res.status === 401) {
    await getMe();
    const retry = await doFetch(`/users/me/saved?page=${page}&limit=21`);
    if (!retry.ok) throw new Error("Could not load saved roles");
    return retry.json() as Promise<{
      data: Job[];
      meta: { totalPages: number };
    }>;
  }
  if (!res.ok) throw new Error("Could not load saved roles");
  return res.json() as Promise<{ data: Job[]; meta: { totalPages: number } }>;
};

export const saveJob = (jobId: string) =>
  request<{ saved: boolean }>(`/users/me/saved/${jobId}`, { method: "POST" });

export const unsaveJob = (jobId: string) =>
  request<{ saved: boolean }>(`/users/me/saved/${jobId}`, { method: "DELETE" });

export const changePassword = (currentPassword: string, newPassword: string) =>
  request<{ changed: boolean }>("/users/me/password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const exportMyData = () =>
  request<{
    user: AuthUser;
    savedJobs: unknown[];
    counts: { savedJobs: number };
    exportedAt: string;
  }>("/users/me/export");

export const deleteAccount = () =>
  request<{ deleted: boolean }>("/users/me", { method: "DELETE" });

export type Recommendation = {
  _id: string;
  title: string;
  companyId: { name: string; slug: string; logoUrl?: string };
  locations: { city?: string }[];
  firstSeenAt: string;
  fit: { score: number; reasons: string[] };
};

export const getRecommendations = () =>
  request<{ profileCompletion: number; jobs: Recommendation[] }>(
    "/recommendations",
  );

export const setRecommendationFeedback = (jobId: string, feedback: string) =>
  request<{ feedback: string }>(`/recommendations/${jobId}/feedback`, {
    method: "PATCH",
    body: JSON.stringify({ feedback }),
  });

export type BillingState = {
  subscription: null | {
    plan: string;
    status: string;
    trialEndsAt?: string;
    currentPeriodEndsAt?: string;
    cancelledAt?: string;
    isPro?: boolean;
    accessEndsAt?: string | null;
    cancelAtPeriodEnd?: boolean;
    checkoutNeedsReview?: boolean;
    payments: {
      razorpayPaymentId?: string;
      amount?: number;
      status?: string;
      paidAt?: string;
    }[];
  };
};
export const getBilling = () => request<BillingState>("/billing");
export const beginCheckout = (planId = "pro-monthly") =>
  request<{
    subscription: BillingState["subscription"];
    checkout: null | { subscriptionId: string; keyId: string };
  }>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ planId }),
  });
export const verifyCheckout = (body: {
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}) =>
  request<BillingState>("/billing/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
export const cancelSubscription = () =>
  request<BillingState>("/billing/cancel", { method: "POST" });
