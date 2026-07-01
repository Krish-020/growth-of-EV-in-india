import type { Artwork, SizeBucket } from "@/lib/types";

export type ShippingZone = "domestic" | "international";

const FLAT_RATES: Record<ShippingZone, Record<SizeBucket, number>> = {
  domestic: { small: 250, medium: 650, large: 1600 },
  international: { small: 2200, medium: 5400, large: 13500 },
};

export interface ShippingQuoteResult {
  requiresQuote: boolean;
  cost: number;
}

/**
 * Mock shipping calculator. Fragile / oversized pieces (requiresShippingQuote)
 * never get a flat rate — the buyer must request a custom freight quote instead.
 */
export function getShippingForArtwork(
  artwork: Artwork,
  zone: ShippingZone
): ShippingQuoteResult {
  if (artwork.requiresShippingQuote) {
    return { requiresQuote: true, cost: 0 };
  }
  return { requiresQuote: false, cost: FLAT_RATES[zone][artwork.sizeBucket] };
}

export function zoneLabel(zone: ShippingZone): string {
  return zone === "domestic" ? "Within India" : "International";
}
