import type { MetadataRoute } from "next";
import { getAllArtworks } from "@/lib/mockData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/catalog", "/about", "/commission", "/cart"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
    })
  );

  const artworkRoutes = getAllArtworks().map((artwork) => ({
    url: `${siteUrl}/art/${artwork.slug}`,
    lastModified: artwork.createdAt,
  }));

  return [...staticRoutes, ...artworkRoutes];
}
