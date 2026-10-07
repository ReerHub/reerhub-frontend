import { NextRequest } from "next/server";

type Params = { params: Promise<{ path: string[] }> };

async function proxy(request: NextRequest, { params }: Params) {
  const { path } = await params;
  const base = (process.env.API_URL || "http://localhost:8000/api/v1").replace(
    /\/+$/,
    "",
  );
  const target = `${base}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  for (const name of [
    "content-type",
    "cookie",
    "x-csrf-token",
    "authorization",
    "x-request-id",
  ]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-reerhub-admin-origin", "admin-console");
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body,
    redirect: "manual",
  });
  const responseHeaders = new Headers();
  for (const name of ["content-type", "x-request-id"]) {
    const value = upstream.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  // Preserve both access and refresh Set-Cookie headers independently. A
  // comma-joined header can make browsers discard one of the two sessions.
  const cookieHeaders = (
    upstream.headers as Headers & { getSetCookie?: () => string[] }
  ).getSetCookie?.();
  if (cookieHeaders?.length) {
    for (const value of cookieHeaders)
      responseHeaders.append("set-cookie", value);
  } else {
    const value = upstream.headers.get("set-cookie");
    if (value) responseHeaders.set("set-cookie", value);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;

export const runtime = "nodejs";
