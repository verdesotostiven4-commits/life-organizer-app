import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16.3 Instant Navigations: prefetch a reusable route shell and
  // stream user-specific data after the navigation starts.
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
