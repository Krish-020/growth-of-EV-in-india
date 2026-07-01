"use client";

import Link from "next/link";
import { useState } from "react";
import type { Artwork } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import NotifyMeForm from "@/components/NotifyMeForm";
import ShippingQuoteForm from "@/components/ShippingQuoteForm";

export default function BuyBox({ artwork }: { artwork: Artwork }) {
  const { addItem, lines } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const alreadyInCart = lines.some((line) => line.slug === artwork.slug);
  const maxQuantity = artwork.edition ? artwork.edition.availableCount : 1;

  if (artwork.status === "sold") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-soft">
          {artwork.edition
            ? "This edition is fully sold."
            : "This original has sold and is no longer available."}
        </p>
        <NotifyMeForm title={artwork.title} />
      </div>
    );
  }

  if (artwork.status === "commission") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink-soft">
          This piece is offered as a commission concept rather than ready
          stock — scale, palette and finish can be adapted to your space.
        </p>
        <Link
          href={`/commission?piece=${artwork.slug}`}
          className="focus-ring inline-flex w-fit items-center rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-clay-dark"
        >
          Start a commission request
        </Link>
      </div>
    );
  }

  if (artwork.requiresShippingQuote) {
    return <ShippingQuoteForm title={artwork.title} />;
  }

  function handleAdd() {
    addItem(artwork.slug, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  }

  return (
    <div className="flex flex-col gap-3">
      {artwork.edition && (
        <div className="flex items-center gap-3">
          <label htmlFor="quantity" className="text-sm text-ink-soft">
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="focus-ring rounded-md border border-line bg-paper px-3 py-1.5 text-sm"
          >
            {Array.from({ length: Math.min(maxQuantity, 10) }, (_, i) => i + 1).map(
              (n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              )
            )}
          </select>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="focus-ring w-full rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-clay-dark sm:w-auto sm:px-10"
      >
        Add to cart
      </button>

      {(justAdded || alreadyInCart) && (
        <p className="text-sm text-sage">
          {justAdded ? "Added to cart." : "Already in your cart."}{" "}
          <Link
            href="/cart"
            className="font-medium underline decoration-sage/50 underline-offset-4 hover:decoration-sage"
          >
            View cart →
          </Link>
        </p>
      )}

      <p className="text-xs text-ink-soft">
        {artwork.isOriginal
          ? "One of one — this listing closes as soon as it's purchased."
          : `Hand-numbered edition of ${artwork.edition?.size}. ${artwork.edition?.availableCount} remaining.`}
      </p>
    </div>
  );
}
