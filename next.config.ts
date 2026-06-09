import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Cloudflare Pages
  output: "export",
  trailingSlash: true,
  images: {
    // All post images are external URLs (img.aqifei.top); disable Next image optimization
    unoptimized: true,
  },
};

export default nextConfig;
