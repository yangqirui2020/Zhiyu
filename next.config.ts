import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: { "/api/*": ["./data/snapshots/**/*.json"] },
};

export default nextConfig;
