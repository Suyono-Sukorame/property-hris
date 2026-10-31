import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Rewrite all module paths to root so the SPA handles routing client-side.
  // This allows direct URL access (bookmark, refresh, share link) to work correctly.
  async rewrites() {
    return [
      { source: '/dashboard',  destination: '/' },
      { source: '/employees',  destination: '/' },
      { source: '/attendance', destination: '/' },
      { source: '/payroll',    destination: '/' },
      { source: '/approvals',  destination: '/' },
      { source: '/reports',    destination: '/' },
      { source: '/settings',   destination: '/' },
    ];
  },
};

export default nextConfig;
