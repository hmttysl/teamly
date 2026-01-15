import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Vercel build sırasında TypeScript hatalarını ignore et
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
