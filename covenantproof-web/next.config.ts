import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/proxy/:path*",
        destination: "http://52.90.159.170:8000/:path*",
      },
    ];
  },
};

export default nextConfig;
