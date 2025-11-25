import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Explicitly set the Turbopack root to this app to avoid
    // incorrect workspace root inference when multiple lockfiles exist.
    root: __dirname,
  },
};

export default nextConfig;
