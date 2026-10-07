import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // /api/v1 is proxied by app/api/v1/[...path] so it can add the server-only
  // admin-origin marker required by the backend.
};

export default nextConfig;
