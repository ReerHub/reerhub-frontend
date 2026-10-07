"use client";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin";
};
const isDedicatedAdminHost = () => {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return (
    host === "admin.reerhub.com" ||
    host === "admin-staging.reerhub.com" ||
    host === "admin.localhost"
  );
};

const base = () => (isDedicatedAdminHost() ? "/api/v1" : "/admin-api");
export const adminAuthPath = () =>
  isDedicatedAdminHost() ? "/auth" : "/admin/auth";
export const adminDashboardPath = () =>
  isDedicatedAdminHost() ? "/dashboard" : "/admin/dashboard";

function cookie(name: string) {
  return document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
async function csrf() {
  const token = cookie("csrfToken");
  if (token) return decodeURIComponent(token);
  const response = await fetch(`${base()}/auth/csrf`, {
    credentials: "include",
  });
  const json = await response.json().catch(() => ({}));
  return json.data?.csrfToken || cookie("csrfToken");
}
async function parse<T>(response: Response): Promise<T> {
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      json.message || `Request failed (${response.status})`,
    ) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (!Object.prototype.hasOwnProperty.call(json, "data")) {
    throw new Error(
      "The admin API returned an invalid response. Please retry.",
    );
  }
  return json.data as T;
}
async function call<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const token = method === "GET" ? undefined : await csrf();
  const response = await fetch(`${base()}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "x-csrf-token": token } : {}),
      ...init.headers,
    },
  });
  if (
    response.status === 401 &&
    retry &&
    (!path.startsWith("/admin/auth/") || path === "/admin/auth/session")
  ) {
    const refreshed = await call<{ id: string }>(
      "/admin/auth/refresh",
      { method: "POST" },
      false,
    ).catch(() => null);
    if (refreshed) return call<T>(path, init, false);
  }
  return parse<T>(response);
}

export const adminGoogleLogin = (idToken: string) =>
  call<AdminUser>("/admin/auth/google", {
    method: "POST",
    body: JSON.stringify({ idToken }),
  });
export const adminSession = () => call<AdminUser>("/admin/auth/session");
export const adminLogout = () =>
  call<{ loggedOut: boolean }>("/admin/auth/logout", { method: "POST" });
export const getAdmin = <T>(path: string) => call<T>(path);
export const getAdminList = async <T>(path: string): Promise<T[]> => {
  const data = await call<unknown>(path);
  if (!Array.isArray(data)) {
    throw new Error("The admin API did not return a list. Please retry.");
  }
  return data as T[];
};
export const writeAdmin = <T>(
  path: string,
  method: "POST" | "PATCH",
  body?: unknown,
) => call<T>(path, { method, body: JSON.stringify(body || {}) });
