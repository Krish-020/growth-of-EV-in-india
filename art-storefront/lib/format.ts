import type { Artwork } from "@/lib/types";

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatPrice(amount: number): string {
  return inrFormatter.format(amount);
}

export function formatDimensions(artwork: Artwork): string {
  const { height, width, depth, unit } = artwork.dimensions;
  const parts = [height, width, depth].filter(
    (n): n is number => typeof n === "number"
  );
  return `${parts.join(" x ")} ${unit} (H x W${depth ? " x D" : ""})`;
}

export function formatWeight(kg: number): string {
  return `${kg} kg`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
