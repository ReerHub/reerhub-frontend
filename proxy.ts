import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/dashboard", "/profile", "/billing/success"];
const isAdminHost = (host: string) =>
  host === "admin.localhost" || host.startsWith("admin.");

const hidden = (req: NextRequest) => {
  const url = req.nextUrl.clone();
  // No route exists at this internal path, which produces a real 404 rather
  // than exposing a redirect hint about the admin console.
  url.pathname = "/__reerhub_not_found";
  return NextResponse.rewrite(url);
};

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const admin = isAdminHost(req.headers.get("host")?.split(":")[0] || "");

  if (admin) {
    const url = req.nextUrl.clone();
    if (pathname === "/" || pathname === "/dashboard") {
      url.pathname = "/admin-dashboard";
      return NextResponse.rewrite(url);
    }
    if (pathname === "/auth") {
      url.pathname = "/admin-auth";
      return NextResponse.rewrite(url);
    }
    if (pathname.startsWith("/api/v1/")) {
      url.pathname = `/admin-api/${pathname.slice("/api/v1/".length)}`;
      return NextResponse.rewrite(url);
    }
    return hidden(req);
  }

  // These implementation routes must never be reachable from the public
  // product host. Public customer login remains at /login.
  if (
    pathname === "/auth" ||
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
