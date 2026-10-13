export const ANALYTICS_EVENTS = [
  "discovery",
  "login",
  "save_role",
  "profile_ready",
  "view_pricing",
  "begin_checkout",
  "trial_activation",
  "first_verified_payment",
] as const;
export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];
export const PAGE_FAMILIES = [
  "home",
  "discovery",
  "job-detail",
  "companies",
  "pricing",
  "account",
  "content",
] as const;
export type PageFamily = (typeof PAGE_FAMILIES)[number];
export function pageFamily(pathname: string): PageFamily {
  if (pathname === "/dashboard/billing") return "pricing";
  if (/^\/dashboard\/jobs\/[^/]+$/.test(pathname)) return "job-detail";
  if (pathname === "/dashboard/jobs") return "discovery";
  if (/^\/dashboard\/companies(?:\/|$)/.test(pathname)) return "companies";
  if (pathname === "/") return "home";
  if (pathname === "/billing") return "pricing";
  if (/^\/jobs\/[^/]+$/.test(pathname)) return "job-detail";
  if (/^\/companies(?:\/|$)/.test(pathname)) return "companies";
  if (
    /^\/(?:dashboard|profile|billing\/success|login|verify-magic|verify-email)(?:\/|$)/.test(
      pathname,
    )
  )
    return "account";
  if (/^\/(?:jobs|.*-jobs)$/.test(pathname)) return "discovery";
  return "content";
}
export function safeAnalyticsEvent(
  name: string,
  input: Record<string, unknown> = {},
) {
  if (!ANALYTICS_EVENTS.includes(name as AnalyticsEvent)) return null;
  return {
    name,
    params: {
      ...(PAGE_FAMILIES.includes(input.page_family as PageFamily)
        ? { page_family: input.page_family }
        : {}),
      ...(["pro-weekly", "pro-monthly", "pro-quarterly"].includes(
        input.plan as string,
      )
        ? { plan: input.plan }
        : {}),
      ...(["qualified", "stretch", "needs-review"].includes(
        input.group as string,
      )
        ? { group: input.group }
        : {}),
    },
  };
}
