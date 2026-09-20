import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Password auth is gone (magic link only): dead auth routes funnel to
  // /login (query strings like ?next= preserved). Track homes moved to
  // /engineering-jobs + /ai-jobs (308 permanent).
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
