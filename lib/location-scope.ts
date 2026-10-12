// Legacy query parameters normalize to the India-only product.
export type LocationScope = "india";
export const locationScopeFromParams = (params: {
  get(name: string): string | null;
}): LocationScope => {
  void params;
  return "india";
};
export const locationScopeLabel = (scope: LocationScope) => {
  void scope;
  return "India";
};
