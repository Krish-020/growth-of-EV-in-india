"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { CartLine } from "@/lib/types";
import { isPurchasable } from "@/lib/artwork-rules";
import { useCatalog } from "@/lib/catalog-context";

const STORAGE_KEY = "art-storefront-cart-v1";

// A tiny external store backed by localStorage, read through
// useSyncExternalStore so the cart hydrates without the "setState inside an
// effect" pattern (and the SSR/client snapshots never mismatch on paint).
const EMPTY_LINES: CartLine[] = [];
let cartLines: CartLine[] = EMPTY_LINES;
let initialized = false;
const listeners = new Set<() => void>();

function ensureInitialized() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) cartLines = JSON.parse(stored);
  } catch {
    // ignore malformed/unavailable storage
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartLines));
}

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartLine[] {
  ensureInitialized();
  return cartLines;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY_LINES;
}

function setLines(next: CartLine[]) {
  cartLines = next;
  persist();
  notify();
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (slug: string, quantity?: number) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  isHydrated: boolean;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isHydrated = useHasMounted();
  const { getArtworkBySlug } = useCatalog();

  const addItem = useCallback(
    (slug: string, quantity = 1) => {
      const artwork = getArtworkBySlug(slug);
      if (!artwork || !isPurchasable(artwork)) return;
      const maxQuantity = artwork.edition ? artwork.edition.availableCount : 1;

      const existing = cartLines.find((line) => line.slug === slug);
      if (existing) {
        // Originals are one-of-one: re-adding just keeps it at qty 1.
        if (!artwork.edition) return;
        const nextQty = Math.min(existing.quantity + quantity, maxQuantity);
        setLines(
          cartLines.map((line) =>
            line.slug === slug ? { ...line, quantity: nextQty } : line
          )
        );
        return;
      }
      setLines([...cartLines, { slug, quantity: Math.min(quantity, maxQuantity) }]);
    },
    [getArtworkBySlug]
  );

  const removeItem = useCallback((slug: string) => {
    setLines(cartLines.filter((line) => line.slug !== slug));
  }, []);

  const setQuantity = useCallback(
    (slug: string, quantity: number) => {
      const artwork = getArtworkBySlug(slug);
      const maxQuantity = artwork?.edition ? artwork.edition.availableCount : 1;
      setLines(
        cartLines.map((line) =>
          line.slug === slug
            ? { ...line, quantity: Math.max(1, Math.min(quantity, maxQuantity)) }
            : line
        )
      );
    },
    [getArtworkBySlug]
  );

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity, 0),
    [lines]
  );

  const subtotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const artwork = getArtworkBySlug(line.slug);
        return artwork ? sum + artwork.price * line.quantity : sum;
      }, 0),
    [lines, getArtworkBySlug]
  );

  const value: CartContextValue = {
    lines,
    itemCount,
    subtotal,
    addItem,
    removeItem,
    setQuantity,
    clearCart,
    isHydrated,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
