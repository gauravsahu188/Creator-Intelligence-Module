import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['got-scraping', 'header-generator', 'got', 'quick-lru']
};

export default nextConfig;
