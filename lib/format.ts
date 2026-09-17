import type { Job } from "./reerhub";

/** "2d ago", "3w ago", "Just now" — friendly recency for listings. */
export function timeAgo(iso?: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 3600) return "Just now";
  const hours = Math.floor(seconds / 3600);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "Bengaluru, Karnataka +2" from the locations array. */
export function locationLabel(job: Pick<Job, "locations">): string {
  const first = job.locations?.[0];
  const base = [first?.city, first?.state].filter(Boolean).join(", ");
  const extra =
    job.locations && job.locations.length > 1
      ? ` +${job.locations.length - 1}`
      : "";
  return `${base || "India"}${extra}`;
}

/**
 * Company logo tile (design system §19).
 * No stored logos yet, so initial-letter tiles: soft blue-to-indigo gradient
 * with white letter — identical everywhere for consistency.
 */
export function companyTile(): string {
  return "bg-gradient-to-br from-blue-500 to-indigo-600 text-white";
}
