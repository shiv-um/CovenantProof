import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Existing rewrite for AWS FastAPI backend proxy
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://52.90.159.170:8000/:path*",
      },
      // PostHog First-Party Reverse Proxy (Bypasses Ad-Blockers)
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  // Ensure large session recording payloads are not blocked
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
