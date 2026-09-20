import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  // Password auth is gone (magic link only). Dead routes funnel to /login;
  // query strings (e.g. ?next=) are preserved by default.
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
    ];
  },
};

export default nextConfig;
