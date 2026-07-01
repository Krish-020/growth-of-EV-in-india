import rawArtworks from "@/data/artworks.json";
import type { Artwork, ArtCategory, SizeBucket, AvailabilityStatus } from "@/lib/types";

export const artworks: Artwork[] = rawArtworks as Artwork[];

export function getAllArtworks(): Artwork[] {
  return artworks;
}

export function getArtworkBySlug(slug: string): Artwork | undefined {
  return artworks.find((a) => a.slug === slug);
}

export function getFeaturedArtworks(limit = 4): Artwork[] {
  return artworks.filter((a) => a.featured).slice(0, limit);
}

export function getPrintsOf(slug: string): Artwork[] {
  return artworks.filter((a) => a.printOf === slug);
}

export function getOriginalFor(artwork: Artwork): Artwork | undefined {
  if (!artwork.printOf) return undefined;
  return getArtworkBySlug(artwork.printOf);
}

/** Whether a piece can currently be added to a cart / purchased. */
export function isPurchasable(artwork: Artwork): boolean {
  if (artwork.status !== "available") return false;
  if (artwork.edition) return artwork.edition.availableCount > 0;
  return true;
}

export function availabilityLabel(artwork: Artwork): string {
  if (artwork.status === "sold") {
    return artwork.edition ? "Edition sold out" : "Sold";
  }
  if (artwork.status === "commission") return "Commission only";
  if (artwork.edition) {
    const { availableCount, size } = artwork.edition;
    return `${availableCount} of ${size} available`;
  }
  return "Available";
}

export function getRelatedArtworks(artwork: Artwork, limit = 4): Artwork[] {
  return artworks
    .filter(
      (a) =>
        a.slug !== artwork.slug &&
        a.printOf !== artwork.slug &&
        a.slug !== artwork.printOf &&
        (a.category === artwork.category ||
          a.tags.some((t) => artwork.tags.includes(t)))
    )
    .slice(0, limit);
}

export interface CatalogFilters {
  category?: ArtCategory;
  medium?: string;
  size?: SizeBucket;
  minPrice?: number;
  maxPrice?: number;
  availability?: AvailabilityStatus;
}

export function filterArtworks(filters: CatalogFilters): Artwork[] {
  return artworks.filter((a) => {
    if (filters.category && a.category !== filters.category) return false;
    if (filters.medium && a.medium !== filters.medium) return false;
    if (filters.size && a.sizeBucket !== filters.size) return false;
    if (filters.availability && a.status !== filters.availability) return false;
    if (filters.minPrice !== undefined && a.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && a.price > filters.maxPrice) return false;
    return true;
  });
}

export function getFilterOptions() {
  const mediums = Array.from(new Set(artworks.map((a) => a.medium))).sort();
  const prices = artworks.map((a) => a.price);
  return {
    mediums,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}
