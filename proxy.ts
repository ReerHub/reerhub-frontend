import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isDedicatedAdminHost, isSharedAdminTestHost } from "@/lib/admin-host";

const PROTECTED = ["/dashboard", "/profile", "/billing/success"];

const hidden = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  // No route exists at this internal path, which produces a real 404 rather
  // than exposing a redirect hint about the admin console.
  url.pathname = "/__reerhub_not_found";
  return NextResponse.rewrite(url);
};

const adminRewrite = (req: NextRequest, pathname: string) => {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-reerhub-admin-surface", "1");
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = req.headers.get("host") || "";
  const admin = isDedicatedAdminHost(host);
  const sharedTestHost = isSharedAdminTestHost(host);

  if (admin) {
    if (pathname === "/" || pathname === "/dashboard") {
      return adminRewrite(req, "/admin-dashboard");
    }
    if (pathname === "/auth") {
      return adminRewrite(req, "/admin-auth");
    }
    if (pathname.startsWith("/api/v1/")) {
      return adminRewrite(
        req,
        `/admin-api/${pathname.slice("/api/v1/".length)}`,
      );
    }
    return hidden(req);
  }

  // Staging and local run the public site and the admin UI on one hostname.
  // Their admin routes therefore have an explicit /admin prefix so they never
  // collide with the public home or customer dashboard.
  if (sharedTestHost) {
    if (pathname === "/admin/auth") return adminRewrite(req, "/admin-auth");
    if (pathname === "/admin/dashboard")
      return adminRewrite(req, "/admin-dashboard");
    if (pathname.startsWith("/admin-api/")) return NextResponse.next();
  }

  // These implementation routes must never be reachable from the public
  // product host. Public customer login remains at /login.
  if (
    pathname === "/auth" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/admin-auth") ||
    pathname.startsWith("/admin-dashboard") ||
    pathname.startsWith("/admin-api")
  ) {
    return hidden(req);
  }

  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  const session =
    req.cookies.get("accessToken")?.value ||
    req.cookies.get("refreshToken")?.value ||
    req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/).*)"],
};
