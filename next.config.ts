import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir:
    process.env.REERHUB_UI_FIXTURES === "1"
      ? `.next-fixtures/${process.env.FIXTURE_PORT || "3001"}`
      : ".next",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Password auth is gone (magic link only): dead auth routes funnel to
  // /login (query strings like ?next= preserved). Track homes moved to
  // /engineering-jobs + /ai-jobs (308 permanent).
  async rewrites() {
    // Client never sees the backend URL (no NEXT_PUBLIC_*).
    // Browser calls same-origin /api/v1/*, Next proxies to the backend
    // using server-only API_URL.
    const backend = (
      process.env.API_URL || "http://localhost:8000/api/v1"
    ).replace(/\/+$/, "");
    return [
      // Public-browser calls continue to use the normal backend proxy. The
      // admin hostname is intercepted in proxy.ts and served by admin-api,
      // which injects the backend-only admin origin marker.
      { source: "/api/v1/:path*", destination: `${backend}/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/signup", destination: "/login", permanent: false },
      {
        source: "/forgot-password",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/reset-password",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/engineering",
        destination: "/engineering-jobs",
        permanent: true,
      },
      { source: "/ai", destination: "/ai-jobs", permanent: true },
    ];
  },
};

export default nextConfig;
