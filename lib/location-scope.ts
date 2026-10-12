export type LocationScope = "india" | "international" | "all";
export const locationScopeFromParams = (params: {
  get(name: string): string | null;
}): LocationScope => {
  const scope = params.get("locationScope");
  if (scope === "india" || scope === "international" || scope === "all")
    return scope;
  return params.get("indiaOnly") === "false" ? "all" : "india";
};
export const locationScopeLabel = (scope: LocationScope) =>
  ({ india: "India", international: "International", all: "All locations" })[
    scope
  ];
