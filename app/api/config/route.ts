export async function GET() {
  // Public identifiers only (Google OAuth client id, Turnstile site key).
  // Served at runtime so client JS never needs NEXT_PUBLIC_* at build time.
  return Response.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || "",
  });
}
