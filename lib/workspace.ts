import { JOB_LANDINGS } from "./seo-landings";

export function workspaceLinks(pro: boolean) {
  return [
    { href: "/dashboard", label: "Overview", icon: "grid" as const },
    { href: "/dashboard/jobs", label: "Jobs", icon: "briefcase" as const },
    {
      href: "/dashboard/companies",
      label: "Companies",
      icon: "search" as const,
    },
    {
      href: "/dashboard/matches",
      label: pro ? "Matches" : "Matches · Pro",
      icon: "spark" as const,
    },
    {
      href: "/dashboard/saved",
      label: "Saved roles",
      icon: "bookmark" as const,
    },
    {
      href: "/dashboard/profile",
      label: "Profile & preferences",
      icon: "user" as const,
    },
    {
      href: "/dashboard/billing",
      label: "Membership",
      icon: "shield" as const,
    },
  ];
}

/** Internal destinations only. Tokens/auth verification URLs must keep their own flow. */
export function memberHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://reerhub.local");
  const path = url.pathname;
  if (path.startsWith("/dashboard/")) return href;
  if (path === "/dashboard") {
    const view = url.searchParams.get("view");
    const views: Record<string, string> = {
      discover: "jobs",
      saved: "saved",
      matches: "matches",
    };
    const target = views[view || ""];
    if (target) url.pathname = `/dashboard/${target}`;
    url.searchParams.delete("view");
  } else if (path === "/") url.pathname = "/dashboard";
  else if (/^\/(jobs|companies)(\/|$)/.test(path))
    url.pathname = `/dashboard${path}`;
  else if (
    path === "/profile" ||
    path === "/billing" ||
    path === "/billing/success"
  )
    url.pathname = `/dashboard${path}`;
  else if (
    [
      "about",
      "privacy",
      "terms",
      "matching-methodology",
      "contact",
      "faq",
    ].includes(path.slice(1))
  )
    url.pathname =
      path === "/contact" ? "/dashboard/help" : `/dashboard${path}`;
  else {
    const key = path.slice(1);
    const landing = JOB_LANDINGS[key];
    const cities: Record<string, string> = {
      "bengaluru-jobs": "Bengaluru",
      "hyderabad-jobs": "Hyderabad",
      "pune-jobs": "Pune",
      "chennai-jobs": "Chennai",
      "delhi-jobs": "Delhi",
      "mumbai-jobs": "Mumbai",
    };
    if (
      landing ||
      cities[key] ||
      ["engineering-jobs", "ai-jobs", "remote-jobs"].includes(key)
    ) {
      url.pathname = "/dashboard/jobs";
      const defaults: Record<string, string | undefined> = {
        ...(cities[key] ? { city: cities[key] } : {}),
        ...(key === "engineering-jobs" ? { techTrack: "software" } : {}),
        ...(key === "ai-jobs" ? { techTrack: "ai-ml" } : {}),
        ...(key === "remote-jobs" ? { remoteType: "remote" } : {}),
        ...(landing
          ? {
              techTrack: landing.track,
              techRole: landing.role,
              ...(landing.earlyCareer
                ? { earlyCareer: landing.earlyCareer }
                : {}),
            }
          : {}),
      };
      for (const [key, value] of Object.entries(defaults))
        if (value && !url.searchParams.has(key))
          url.searchParams.set(key, value);
    } else return href;
  }
  return `${url.pathname}${url.search}${url.hash}`;
}
export const WORKSPACE_NAVIGATION_EVENT = "reerhub-workspace-navigation";
/** Lets the existing profile protection intercept programmatic searches/actions too. */
export function requestWorkspaceNavigation(href: string, proceed: () => void) {
  const event = new CustomEvent(WORKSPACE_NAVIGATION_EVENT, {
    cancelable: true,
    detail: { href, proceed },
  });
  if (window.dispatchEvent(event)) proceed();
}
