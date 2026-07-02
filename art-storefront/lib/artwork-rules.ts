import type { Artwork } from "@/lib/types";

// Pure, framework/DB-agnostic rules shared by server pages and client
// components (cart, badges). No data fetching here on purpose.

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
