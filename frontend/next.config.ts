import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // @ts-ignore - ESLint ignoreDuringBuilds is valid for Vercel builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
