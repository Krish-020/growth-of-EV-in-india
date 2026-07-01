"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { siteConfig } from "@/lib/site-config";

const NAV_LINKS = [
  { href: "/catalog", label: "Catalog" },
  { href: "/commission", label: "Commissions" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { itemCount, isHydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="focus-ring font-display text-xl tracking-tight sm:text-2xl"
          onClick={() => setOpen(false)}
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`focus-ring text-sm tracking-wide transition-colors hover:text-clay ${
                pathname?.startsWith(link.href)
                  ? "text-clay"
                  : "text-ink-soft"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="focus-ring relative flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft transition-colors hover:border-clay hover:text-clay"
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
          >
            Cart
            {isHydrated && itemCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-xs font-medium text-paper">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line sm:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-line px-5 py-3 sm:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="focus-ring rounded-md px-2 py-2.5 text-base text-ink-soft hover:bg-paper-dim hover:text-clay"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
