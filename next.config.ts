import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the Turbopack root to this app to avoid
    // incorrect workspace root inference when multiple lockfiles exist.
    root: __dirname,
  },

  // Image optimization - use WebP format for smaller file sizes
  images: {
    formats: ["image/webp"],
  },

  // Enable gzip compression for faster transfers
  compress: true,

  // React strict mode for better debugging
  reactStrictMode: true,

  // Hide X-Powered-By header for security
  poweredByHeader: false,
};

export default nextConfig;
