"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ArtCategory, AvailabilityStatus, SizeBucket } from "@/lib/types";

const CATEGORIES: { value: ArtCategory | ""; label: string }[] = [
  { value: "", label: "All work" },
  { value: "painting", label: "Paintings" },
  { value: "sculpture", label: "Sculpture" },
  { value: "print", label: "Prints" },
];

const SIZES: { value: SizeBucket | ""; label: string }[] = [
  { value: "", label: "Any size" },
  { value: "small", label: "Small (under 30cm)" },
  { value: "medium", label: "Medium (30–90cm)" },
  { value: "large", label: "Large (90cm+)" },
];

const AVAILABILITY: { value: AvailabilityStatus | ""; label: string }[] = [
  { value: "", label: "Any availability" },
  { value: "available", label: "Available" },
  { value: "sold", label: "Sold" },
  { value: "commission", label: "Commission only" },
];

const PRICE_PRESETS: { value: string; label: string }[] = [
  { value: "", label: "Any price" },
  { value: "0-25000", label: "Under ₹25,000" },
  { value: "25000-75000", label: "₹25,000 – ₹75,000" },
  { value: "75000-150000", label: "₹75,000 – ₹1,50,000" },
  { value: "150000-", label: "Above ₹1,50,000" },
];

export default function FilterBar({ mediums }: { mediums: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const category = searchParams.get("category") ?? "";
  const medium = searchParams.get("medium") ?? "";
  const size = searchParams.get("size") ?? "";
  const availability = searchParams.get("availability") ?? "";
  const price = searchParams.get("price") ?? "";

  const hasActiveFilters = category || medium || size || availability || price;

  return (
    <div className="border-b border-line pb-6">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value || "all"}
            type="button"
            onClick={() => updateParam("category", c.value)}
            className={`focus-ring rounded-full border px-4 py-2 text-sm transition-colors ${
              category === c.value
                ? "border-ink bg-ink text-paper"
                : "border-line text-ink-soft hover:border-clay hover:text-clay"
            }`}
            aria-pressed={category === c.value}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Medium
          <select
            value={medium}
            onChange={(e) => updateParam("medium", e.target.value)}
            className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
          >
            <option value="">Any medium</option>
            {mediums.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Size
          <select
            value={size}
            onChange={(e) => updateParam("size", e.target.value)}
            className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
          >
            {SIZES.map((s) => (
              <option key={s.value || "any"} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Price
          <select
            value={price}
            onChange={(e) => updateParam("price", e.target.value)}
            className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
          >
            {PRICE_PRESETS.map((p) => (
              <option key={p.value || "any"} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-ink-soft">
          Availability
          <select
            value={availability}
            onChange={(e) => updateParam("availability", e.target.value)}
            className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
          >
            {AVAILABILITY.map((a) => (
              <option key={a.value || "any"} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => router.push(pathname)}
            className="focus-ring mt-4 text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-clay"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
