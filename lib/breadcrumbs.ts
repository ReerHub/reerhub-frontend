import { JOB_LANDINGS } from "./seo-landings";

export type BreadcrumbItem = { name: string; path: string };

const pages: Record<string, string> = {
  "/jobs": "Jobs",
  "/companies": "Companies",
  "/engineering-jobs": "Engineering jobs",
  "/ai-jobs": "AI jobs",
  "/remote-jobs": "Remote jobs",
  "/faq": "FAQ",
  "/about": "About",
  "/contact": "Contact",
  "/matching-methodology": "How matching works",
  "/privacy": "Privacy policy",
  "/terms": "Terms of use",
  "/billing": "Pro plans",
};
const workspacePages: Record<string, string> = {
  ...pages,
  "/matches": "Matches",
  "/saved": "Saved roles",
  "/profile": "Profile & preferences",
  "/billing": "Membership",
  "/help": "Help & support",
};

// Dynamic detail pages supply their real identity; never infer it from a slug.
export function pageBreadcrumbs(pathname: string): BreadcrumbItem[] | null {
  const member = pathname.startsWith("/dashboard/");
  const path = member ? pathname.slice("/dashboard".length) : pathname;
  const city = /^\/(bengaluru|hyderabad|pune|chennai|delhi|mumbai)-jobs$/.exec(
    path,
  );
  const name =
    (member ? workspacePages : pages)[path] ||
    (!member && JOB_LANDINGS[path.slice(1)]?.title) ||
    (!member && city && `${city[1][0].toUpperCase()}${city[1].slice(1)} jobs`);
  if (!name) return null;
  return [
    { name: member ? "Overview" : "Home", path: member ? "/dashboard" : "/" },
    { name, path: pathname },
  ];
}
