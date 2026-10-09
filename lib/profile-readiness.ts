import type { AuthUser } from "@/lib/auth";

// Guidance only: the recommendation API remains authoritative.
export function profileSignals(profile: AuthUser["profile"]) {
  return [
    { label: "Tech track", complete: Boolean(profile.techTrack) },
    {
      label: "Role preferences",
      complete:
        Boolean(profile.techTrack) &&
        (profile.rolePreference === "any" ||
          (profile.rolePreference === "selected" &&
            Boolean(profile.techRoles?.length))),
    },
    { label: "3+ skills", complete: new Set(profile.skills || []).size >= 3 },
    {
      label: "Experience",
      complete:
        Number.isFinite(profile.experienceYears) &&
        Number(profile.experienceYears) >= 0,
    },
    {
      label: "Location preferences",
      complete:
        profile.locationPreference === "all-india" ||
        (profile.locationPreference === "selected" &&
          Boolean(profile.targetLocations?.length)),
    },
  ];
}
