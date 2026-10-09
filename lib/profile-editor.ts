import type { AuthUser, ProfileUpdate } from "./auth";

export type CatalogOption = { value: string; label: string; aliases: string[] };
export type ProfileOptions = {
  version: number;
  tracks: {
    value: string;
    label: string;
    description: string;
    roles: CatalogOption[];
    suggestedSkills: string[];
  }[];
  skills: CatalogOption[];
  cities: CatalogOption[];
};
export type ProfileDraft = {
  name: string;
  techTrack: string;
  rolePreference: "any" | "selected";
  techRoles: string[];
  skills: string[];
  experienceYears: string;
  locationPreference: "all-india" | "selected";
  targetLocations: string[];
  remoteType: string;
};
export function draftFromUser(user: AuthUser): ProfileDraft {
  return {
    name: user.name || "",
    techTrack: user.profile.techTrack || "",
    rolePreference: user.profile.rolePreference || "any",
    techRoles: [...(user.profile.techRoles || [])],
    skills: [...(user.profile.skills || [])],
    experienceYears: user.profile.experienceYears?.toString() ?? "",
    locationPreference: user.profile.locationPreference || "all-india",
    targetLocations: [...(user.profile.targetLocations || [])],
    remoteType: user.profile.remoteType || "unknown",
  };
}
const key = (value: string) => value.toLowerCase().replace(/[^a-z0-9+#]/g, "");
export function searchOptions(options: CatalogOption[], query: string) {
  const term = key(query.trim());
  return options.filter((option) =>
    [option.label, ...option.aliases].some((alias) =>
      key(alias).includes(term),
    ),
  );
}
export function selectOption(
  existing: string[],
  value: string,
  options: CatalogOption[],
  limit: number,
) {
  const canonical = options.find((option) =>
    [option.value, ...option.aliases].some(
      (alias) => key(alias) === key(value),
    ),
  )?.value;
  if (!canonical)
    return { values: existing, error: "Choose an option from the list." };
  if (existing.includes(canonical)) return { values: existing, error: "" };
  if (existing.length >= limit)
    return {
      values: existing,
      error: `Select up to ${limit}. Remove one to add another.`,
    };
  return { values: [...existing, canonical], error: "" };
}
export function profilePayload(draft: ProfileDraft): ProfileUpdate {
  return {
    name: draft.name.trim(),
    techTrack: draft.techTrack || null,
    rolePreference: draft.rolePreference,
    techRoles:
      draft.rolePreference === "any" ? [] : [...draft.techRoles].sort(),
    skills: [...draft.skills].sort(),
    experienceYears:
      draft.experienceYears.trim() === ""
        ? null
        : Number(draft.experienceYears),
    locationPreference: draft.locationPreference,
    targetLocations:
      draft.locationPreference === "all-india"
        ? []
        : [...draft.targetLocations].sort(),
    remoteType: draft.remoteType,
  };
}
export function profileErrors(draft: ProfileDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!draft.name.trim()) errors.name = "Enter your name.";
  else if (draft.name.trim().length > 120)
    errors.name = "Keep your name under 120 characters.";
  const years = Number(draft.experienceYears);
  if (
    draft.experienceYears.trim() &&
    (!Number.isFinite(years) || years < 0 || years > 60)
  )
    errors.experienceYears = "Enter experience between 0 and 60 years.";
  if (draft.techRoles.length > 3) errors.techRoles = "Select up to 3 roles.";
  if (draft.targetLocations.length > 3)
    errors.targetLocations = "Select up to 3 cities.";
  if (draft.skills.length > 10) errors.skills = "Select up to 10 skills.";
  return errors;
}
