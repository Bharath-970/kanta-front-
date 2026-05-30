import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: true,
  },
  // Types verified separately via `tsc --noEmit`; skip in build for speed
  typescript: { ignoreBuildErrors: true },
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "gsap",
      "@radix-ui/react-accordion",
      "@radix-ui/react-icons",
    ],
  },
};

export default nextConfig;
