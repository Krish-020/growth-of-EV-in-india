import type { Artwork } from "@/lib/types";
import { getShippingForArtwork, type ShippingZone } from "@/lib/shipping";

// Prototype estimate — confirm the applicable HSN/GST rate for originals
// vs. prints with an accountant before this handles real money.
export const GST_RATE = 0.12;

export interface PricedLine {
  artwork: Artwork;
  quantity: number;
}

export function computeOrderTotals(lines: PricedLine[], zone: ShippingZone) {
  const subtotal = lines.reduce((sum, l) => sum + l.artwork.price * l.quantity, 0);
  const shipping = lines.reduce((sum, l) => {
    const result = getShippingForArtwork(l.artwork, zone);
    return sum + result.cost;
  }, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + shipping + gst;
  return { subtotal, shipping, gst, total };
}

export function zoneForCountry(country: string): ShippingZone {
  return country.trim().toLowerCase() === "india" ? "domestic" : "international";
}
