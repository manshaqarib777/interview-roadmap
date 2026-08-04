import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Every page in this site is content — nothing is per-request.
  // Swap to `output: 'export'` for a pure static bundle (no server at all).
  reactStrictMode: true,
  experimental: {
    // Markdown parsing + Shiki run at build time only; keep them off the client graph.
    optimizePackageImports: ['shiki'],
  },
};

export default nextConfig;
