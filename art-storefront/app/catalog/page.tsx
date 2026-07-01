import { Suspense } from "react";
import type { Metadata } from "next";
import ArtCard from "@/components/ArtCard";
import FilterBar from "@/components/FilterBar";
import { filterArtworks, getFilterOptions } from "@/lib/mockData";
import type { ArtCategory, AvailabilityStatus, SizeBucket } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catalog",
  description:
    "Browse original paintings, sculpture and limited-edition prints — filter by category, medium, size, price and availability.",
};

const VALID_CATEGORIES: ArtCategory[] = ["painting", "sculpture", "print"];
const VALID_SIZES: SizeBucket[] = ["small", "medium", "large"];
const VALID_AVAILABILITY: AvailabilityStatus[] = [
  "available",
  "sold",
  "commission",
];

function parsePriceRange(value: string | undefined) {
  if (!value) return {};
  const [minStr, maxStr] = value.split("-");
  const minPrice = minStr ? Number(minStr) : undefined;
  const maxPrice = maxStr ? Number(maxStr) : undefined;
  return {
    minPrice: Number.isFinite(minPrice) && minPrice ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) && maxPrice ? maxPrice : undefined,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = typeof params.category === "string" ? params.category : "";
  const medium = typeof params.medium === "string" ? params.medium : "";
  const size = typeof params.size === "string" ? params.size : "";
  const availability =
    typeof params.availability === "string" ? params.availability : "";
  const price = typeof params.price === "string" ? params.price : "";

  const { minPrice, maxPrice } = parsePriceRange(price);

  const results = filterArtworks({
    category: VALID_CATEGORIES.includes(category as ArtCategory)
      ? (category as ArtCategory)
      : undefined,
    medium: medium || undefined,
    size: VALID_SIZES.includes(size as SizeBucket)
      ? (size as SizeBucket)
      : undefined,
    availability: VALID_AVAILABILITY.includes(availability as AvailabilityStatus)
      ? (availability as AvailabilityStatus)
      : undefined,
    minPrice,
    maxPrice,
  });

  const { mediums } = getFilterOptions();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs uppercase tracking-[0.2em] text-clay">Catalog</p>
        <h1 className="mt-2 font-display text-4xl sm:text-5xl">The full collection</h1>
        <p className="mt-3 text-ink-soft">
          Every piece here is either an available original, a limited-edition
          print, or already found its home. Sold work stays listed as part of
          the record.
        </p>
      </div>

      <Suspense fallback={null}>
        <FilterBar mediums={mediums} />
      </Suspense>

      <p className="mb-6 mt-6 text-sm text-ink-soft">
        {results.length} piece{results.length === 1 ? "" : "s"}
      </p>

      {results.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line py-20 text-center">
          <p className="text-ink-soft">
            Nothing matches those filters right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {results.map((artwork) => (
            <ArtCard key={artwork.slug} artwork={artwork} />
          ))}
        </div>
      )}
    </div>
  );
}
