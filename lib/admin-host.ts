/**
 * Admin routes are private in production but deliberately available from the
 * normal local and staging hosts so operators can test the same deployment.
 * Keep this hostname-only: Vercel preview builds run with NODE_ENV=production.
 */
export const isDedicatedAdminHost = (rawHost: string) => {
  const host = rawHost.toLowerCase().split(":")[0];
  return (
    host === "admin.reerhub.com" ||
    host === "admin-staging.reerhub.com" ||
    host === "admin.localhost"
  );
};

export const isSharedAdminTestHost = (rawHost: string) => {
  const host = rawHost.toLowerCase().split(":")[0];
  return (
    host === "staging.reerhub.com" ||
    host === "localhost" ||
    host === "127.0.0.1"
  );
};
