import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phase 1 catalog images are locally-generated SVG placeholders, rendered
  // with next/image's `unoptimized` prop (see components/ArtCard.tsx and the
  // product gallery) since raster optimization doesn't apply to vectors.
  // Real product photography (Phase 2) should be JPEG/WebP and can drop
  // `unoptimized` to get full responsive/CDN image optimization.
};

export default nextConfig;
