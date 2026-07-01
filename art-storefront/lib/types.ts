export type ArtCategory = "painting" | "sculpture" | "print";

export type SizeBucket = "small" | "medium" | "large";

export type AvailabilityStatus = "available" | "sold" | "commission";

export type ImageView = "front" | "side" | "back" | "detail" | "in-situ";

export interface ArtworkImage {
  src: string;
  view: ImageView;
  alt: string;
}

export interface EditionInfo {
  size: number;
  availableCount: number;
}

export interface Dimensions {
  height: number;
  width: number;
  depth?: number;
  unit: "cm";
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  category: ArtCategory;
  medium: string;
  year: number;
  dimensions: Dimensions;
  weightKg: number;
  isOriginal: boolean;
  price: number;
  priceNote?: string;
  currency: "INR";
  status: AvailabilityStatus;
  requiresShippingQuote: boolean;
  featured: boolean;
  sizeBucket: SizeBucket;
  story: string;
  tags: string[];
  createdAt: string;
  images: ArtworkImage[];
  /** For prints: the slug of the original piece this edition reproduces. */
  printOf?: string;
  /** For prints: edition size and remaining availability. */
  edition?: EditionInfo;
}

export interface CartLine {
  slug: string;
  quantity: number;
}
