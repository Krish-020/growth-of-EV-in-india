"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { getArtworkBySlug, isPurchasable } from "@/lib/mockData";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotal, removeItem, setQuantity, isHydrated } = useCart();

  if (!isHydrated) {
    return <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8" aria-hidden />;
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-ink-soft">
          Browse the catalog and find something that stays with you.
        </p>
        <Link
          href="/catalog"
          className="focus-ring mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          View the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="font-display text-3xl sm:text-4xl">Your cart</h1>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {lines.map((line) => {
          const artwork = getArtworkBySlug(line.slug);
          if (!artwork) return null;
          const cover = artwork.images[0];
          const purchasable = isPurchasable(artwork);
          const maxQuantity = artwork.edition ? artwork.edition.availableCount : 1;

          return (
            <li key={line.slug} className="flex gap-4 py-6">
              <Link
                href={`/art/${artwork.slug}`}
                className="focus-ring relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-paper-dim sm:h-32 sm:w-32"
              >
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  fill
                  unoptimized
                  sizes="128px"
                  className="object-cover"
                />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link
                      href={`/art/${artwork.slug}`}
                      className="focus-ring font-display text-lg hover:text-clay"
                    >
                      {artwork.title}
                    </Link>
                    <p className="text-sm text-ink-soft">{artwork.medium}</p>
                    {!purchasable && (
                      <p className="mt-1 text-sm text-clay">
                        No longer available — please remove this item.
                      </p>
                    )}
                  </div>
                  <p className="whitespace-nowrap text-sm font-medium">
                    {formatPrice(artwork.price * line.quantity)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {artwork.edition ? (
                    <label className="flex items-center gap-2 text-sm text-ink-soft">
                      Qty
                      <select
                        value={line.quantity}
                        onChange={(e) =>
                          setQuantity(line.slug, Number(e.target.value))
                        }
                        className="focus-ring rounded-md border border-line bg-paper px-2 py-1 text-sm"
                      >
                        {Array.from(
                          { length: Math.max(maxQuantity, line.quantity) },
                          (_, i) => i + 1
                        ).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <span className="text-sm text-ink-soft">
                      One of one — qty 1
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(line.slug)}
                    className="focus-ring text-sm text-ink-soft underline decoration-line underline-offset-4 hover:text-clay"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <div className="flex w-full max-w-xs justify-between text-base sm:text-lg">
          <span className="text-ink-soft">Subtotal</span>
          <span className="font-medium">{formatPrice(subtotal)}</span>
        </div>
        <p className="max-w-xs text-right text-xs text-ink-soft">
          Shipping and any applicable taxes are calculated at checkout.
        </p>
        <Link
          href="/checkout"
          className="focus-ring w-full max-w-xs rounded-full bg-ink px-6 py-3.5 text-center text-sm font-medium text-paper transition-colors hover:bg-clay-dark"
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
