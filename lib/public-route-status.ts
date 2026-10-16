import { NextResponse, type NextRequest } from "next/server";
import { JOB_LANDINGS } from "./seo-landings";
import { jobUrl } from "./reerhub";

/** Normalize one directory URL; never infer inventory bounds from a failed read. */
export function directoryPageValue(value: string | null): number {
  if (!value || !/^\d+$/.test(value)) return 1;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

const unavailable = () =>
  new NextResponse(
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Temporarily unavailable | REERHUB</title></head><body style="font-family:system-ui;background:#fffefa;color:#241e30;margin:0;padding:10vh 24px"><main style="max-width:640px;margin:auto"><h1>Job information is temporarily unavailable.</h1><p>Please try again shortly to load the latest openings.</p><p><a href="" style="color:#6d4aff">Try again</a> · <a href="/">REERHUB home</a></p></main></body></html>',
    {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "60",
      },
    },
  );

/** Public data only. One bounded status read replaces the full job proxy fetch. */
export async function publicRouteResponse(
  req: NextRequest,
): Promise<NextResponse | null> {
  const { pathname, searchParams } = req.nextUrl;
  const query = new URLSearchParams();
  const job = /^\/jobs\/([^/]+)$/.exec(pathname);
  const company = /^\/companies\/([^/]+)$/.exec(pathname);
  const landing = JOB_LANDINGS[pathname.slice(1)];
  if (job) {
    const id = /(?:^|-)([a-f0-9]{24})$/.exec(job[1])?.[1];
    if (!id) return missing(req);
    query.set("kind", "job");
    query.set("id", id);
  } else if (company) {
    query.set("kind", "company");
    query.set("slug", company[1]);
  } else if (pathname === "/companies") {
    const page = directoryPageValue(searchParams.get("page"));
    const normalized = req.nextUrl.clone();
    normalized.searchParams.delete("page");
    if (page > 1) normalized.searchParams.set("page", String(page));
    if (normalized.search !== req.nextUrl.search)
      return NextResponse.redirect(normalized, 308);
    query.set("kind", "directory");
    query.set("page", String(page));
    query.set("q", (searchParams.get("q") || "").slice(0, 100));
    query.set(
      "hiring",
      searchParams.get("hiring") === "true" ? "true" : "false",
    );
  } else if (
    landing ||
    [
      "/",
      "/jobs",
      "/engineering-jobs",
      "/ai-jobs",
      "/remote-jobs",
      "/bengaluru-jobs",
      "/hyderabad-jobs",
      "/pune-jobs",
      "/chennai-jobs",
      "/delhi-jobs",
      "/mumbai-jobs",
    ].includes(pathname)
  ) {
    query.set("kind", "catalog");
    if (landing?.skill) query.set("skills", landing.skill);
    if (landing?.earlyCareer) query.set("earlyCareer", landing.earlyCareer);
  } else return null;
  try {
    const base = (
      process.env.API_URL || "http://localhost:8000/api/v1"
    ).replace(/\/+$/, "");
    const response = await fetch(`${base}/discovery/status?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (response.status === 404) {
      await response.body?.cancel();
      return query.get("kind") === "catalog" ? unavailable() : missing(req);
    }
    if (!response.ok) {
      await response.body?.cancel();
      return unavailable();
    }
    const body = await response.json();
    if (body?.success !== true || !body.data || typeof body.data !== "object")
      return unavailable();
    if (query.get("kind") === "company" && body.data.slug !== query.get("slug"))
      return unavailable();
    if (
      query.get("kind") === "directory" &&
      (!Number.isInteger(body.data.totalPages) || body.data.totalPages < 0)
    )
      return unavailable();
    if (
      query.get("kind") === "catalog" &&
      (typeof body.data.catalogStatus !== "string" ||
        typeof body.data.catalogHasVerifiedJobs !== "boolean")
    )
      return unavailable();
    if (landing?.skill || landing?.earlyCareer) {
      const inventory = body.data.editorialInventory;
      if (
        !inventory ||
        !Number.isInteger(inventory.activeRoles) ||
        inventory.activeRoles < 0 ||
        !Number.isInteger(inventory.employers) ||
        inventory.employers < 0
      )
        return unavailable();
    }
    if (job) {
      const data = body.data;
      if (data._id !== query.get("id") || !data.title || !data.companyId?.name)
        return unavailable();
      const canonical = jobUrl(data);
      if (pathname !== canonical) {
        const target = req.nextUrl.clone();
        target.pathname = canonical;
        return NextResponse.redirect(target, 308);
      }
    }
    return null;
  } catch {
    return unavailable();
  }
}
function missing(req: NextRequest) {
  const target = req.nextUrl.clone();
  target.pathname = "/__reerhub_not_found";
  target.search = "";
  const response = NextResponse.rewrite(target, { status: 404 });
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}
