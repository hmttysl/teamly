import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vercel build sırasında TypeScript hatalarını ignore et
    ignoreBuildErrors: true,
  },
  eslint: {
    // Vercel build sırasında ESLint hatalarını ignore et
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
