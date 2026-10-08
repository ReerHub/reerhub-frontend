import type { AuthUser } from "@/lib/auth";

// Guidance only: the recommendation API remains the source of truth for readiness.
export function profileSignals(profile: AuthUser["profile"]) {
  return [
    { label: "Tech track", complete: Boolean(profile.techTrack) },
    {
      label: "Target role",
      complete: Boolean(profile.currentRole || profile.techRoles?.length),
    },
    { label: "3+ skills", complete: (profile.skills?.length || 0) >= 3 },
    {
      label: "Experience",
      complete:
        profile.experienceYears !== undefined &&
        profile.experienceYears !== null &&
        Number.isFinite(profile.experienceYears) &&
        profile.experienceYears >= 0,
    },
    {
      label: "Location or work mode",
      complete: Boolean(
        profile.city ||
        (profile.remoteType && profile.remoteType !== "unknown"),
      ),
    },
  ];
}
