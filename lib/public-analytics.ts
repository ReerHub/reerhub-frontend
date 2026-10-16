import { BLOG_CATALOG } from "./blog-catalog";
/** Only existing public website screens may host a third-party tag. */
const publicPaths = new Set([
  "/",
  "/jobs",
  "/companies",
  "/engineering-jobs",
  "/ai-jobs",
  "/bengaluru-jobs",
  "/hyderabad-jobs",
  "/pune-jobs",
  "/chennai-jobs",
  "/delhi-jobs",
  "/mumbai-jobs",
  "/remote-jobs",
  "/react-jobs",
  "/nodejs-jobs",
  "/python-jobs",
  "/java-jobs",
  "/typescript-jobs",
  "/backend-jobs",
  "/frontend-jobs",
  "/full-stack-jobs",
  "/data-engineering-jobs",
  "/devops-jobs",
  "/qa-jobs",
  "/fresher-jobs",
  "/internship-jobs",
  "/billing",
  "/about",
  "/blog",
  ...BLOG_CATALOG.map((post) => `/blog/${post.slug}`),
  "/contact",
  "/faq",
  "/matching-methodology",
  "/how-it-works",
  "/privacy",
  "/terms",
]);
export function isPublicAnalyticsPath(pathname: string): boolean {
  return (
    publicPaths.has(pathname) ||
    /^\/jobs\/[a-z0-9-]+-[a-f0-9]{24}$/.test(pathname) ||
    /^\/companies\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pathname)
  );
}
/** Reject credentials even if an unexpected link places them on a public route. */
export function isPublicAnalyticsUrl(url: URL): boolean {
  if (!isPublicAnalyticsPath(url.pathname)) return false;
  if (
    (url.pathname === "/jobs" || url.pathname.endsWith("-jobs")) &&
    url.searchParams.size
  )
    return false;
  if (
    [...url.searchParams.keys()].some((key) =>
      [
        "q",
        "city",
        "skills",
        "techRole",
        "techTrack",
        "companyId",
        "remoteType",
        "seniority",
        "earlyCareer",
        "employmentType",
        "sort",
        "hiring",
      ].includes(key),
    )
  )
    return false;
  return ![...url.searchParams.keys()].some((key) =>
    /token|email|password|secret|code|session|authorization/i.test(key),
  );
}
