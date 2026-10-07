/**
 * Admin routes are private in production but deliberately available from the
 * normal local and staging hosts so operators can test the same deployment.
 * Keep this hostname-only: Vercel preview builds run with NODE_ENV=production.
 */
export const isAdminSurfaceHost = (rawHost: string) => {
  const host = rawHost.toLowerCase().split(":")[0];
  return (
    host === "admin.reerhub.com" ||
    host === "admin-staging.reerhub.com" ||
    host === "staging.reerhub.com" ||
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "admin.localhost"
  );
};
