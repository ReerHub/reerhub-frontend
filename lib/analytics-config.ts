/** Public container identifier supplied by the owner. Local/test runs are opt-in. */
export const DEFAULT_GTM_CONTAINER = "GTM-KQD9XXJL";
export function analyticsConfig(env = process.env) {
  const rawGtm =
    env.GTM_CONTAINER_ID ??
    (env.NODE_ENV === "production" ? DEFAULT_GTM_CONTAINER : "");
  const gtmContainerId = /^GTM-[A-Z0-9]{6,15}$/.test(rawGtm) ? rawGtm : "";
  const ga4MeasurementId = /^G-[A-Z0-9]{6,15}$/.test(
    env.GA4_MEASUREMENT_ID || "",
  )
    ? env.GA4_MEASUREMENT_ID || ""
    : "";
  return {
    gtmContainerId,
    ga4MeasurementId,
    available: Boolean(gtmContainerId || ga4MeasurementId),
  };
}
