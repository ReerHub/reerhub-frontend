// Slice moved domains; Google's legacy favicon lookup can return a generic globe.
// Replace only that known legacy URL, preserving administrator-provided logos.
export function companyLogoUrl(
  name: string,
  logoUrl?: string,
): string | undefined {
  if (name.trim().toLowerCase() !== "slice") return logoUrl;
  if (!logoUrl) return "https://slice.bank.in/favicon-96x96.png";
  try {
    const url = new URL(logoUrl);
    const googleFavicon =
      (url.hostname === "www.google.com" && url.pathname === "/s2/favicons") ||
      (url.hostname === "t2.gstatic.com" && url.pathname === "/faviconV2");
    const legacyDomain =
      url.searchParams.get("domain") === "sliceit.com" ||
      /^https?:\/\/(www\.)?sliceit\.com\/?$/.test(
        url.searchParams.get("url") || "",
      );
    if (googleFavicon && legacyDomain)
      return "https://slice.bank.in/favicon-96x96.png";
  } catch {
    /* Preserve custom/local paths and let the component handle failures. */
  }
  return logoUrl;
}
