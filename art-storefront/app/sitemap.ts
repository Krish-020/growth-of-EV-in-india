import type { MetadataRoute } from "next";
import { getAllArtworks } from "@/lib/db/artworks";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/catalog", "/about", "/commission", "/cart"].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
    })
  );

  const artworks = await getAllArtworks();
  const artworkRoutes = artworks.map((artwork) => ({
    url: `${siteUrl}/art/${artwork.slug}`,
    lastModified: artwork.createdAt,
  }));

  return [...staticRoutes, ...artworkRoutes];
}
