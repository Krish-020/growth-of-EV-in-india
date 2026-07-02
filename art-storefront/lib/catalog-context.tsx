"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Artwork } from "@/lib/types";

interface CatalogContextValue {
  artworks: Artwork[];
  isLoaded: boolean;
  getArtworkBySlug: (slug: string) => Artwork | undefined;
}

const CatalogContext = createContext<CatalogContextValue | undefined>(undefined);

/**
 * Client components (cart, checkout, commission form prefill) can't hit the
 * database directly, so this fetches the catalog once from /api/artworks and
 * makes slug lookups available via context. Server components (catalog,
 * product pages) skip this entirely and query the database directly.
 */
export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/artworks")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Artwork[]) => {
        if (!cancelled) setArtworks(data);
      })
      .catch(() => {
        // leave artworks empty; consuming components already handle
        // "not found" gracefully
      })
      .finally(() => {
        if (!cancelled) setIsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      artworks,
      isLoaded,
      getArtworkBySlug: (slug: string) => artworks.find((a) => a.slug === slug),
    }),
    [artworks, isLoaded]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within a CatalogProvider");
  return ctx;
}
