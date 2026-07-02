import Link from "next/link";
import type { Metadata } from "next";
import { getAllArtworks } from "@/lib/db/artworks";
import { getAllOrders } from "@/lib/db/orders";
import {
  getAllCommissions,
  getAllShippingQuoteRequests,
  getAllNewsletterSubscribers,
} from "@/lib/db/inquiries";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export default async function AdminOverviewPage() {
  const [artworks, orders, commissions, quotes, subscribers] = await Promise.all([
    getAllArtworks(),
    getAllOrders(),
    getAllCommissions(),
    getAllShippingQuoteRequests(),
    getAllNewsletterSubscribers(),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const newCommissions = commissions.filter((c) => c.status === "new").length;
  const availablePieces = artworks.filter((a) => a.status === "available").length;

  const stats = [
    { label: "Pieces in catalog", value: artworks.length, href: "/admin/pieces" },
    { label: "Available now", value: availablePieces, href: "/admin/pieces" },
    { label: "Orders placed", value: orders.length, href: "/admin/orders" },
    { label: "Revenue (mock)", value: formatPrice(revenue), href: "/admin/orders" },
    {
      label: "New commission inquiries",
      value: newCommissions,
      href: "/admin/commissions",
    },
    { label: "Shipping quote requests", value: quotes.length, href: "/admin/commissions" },
    { label: "Newsletter subscribers", value: subscribers.length, href: "#" },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl">Overview</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="focus-ring rounded-lg border border-line bg-paper p-5 transition-colors hover:border-clay"
          >
            <p className="text-2xl font-display">{stat.value}</p>
            <p className="mt-1 text-sm text-ink-soft">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/admin/pieces/new"
          className="focus-ring rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          Add a piece
        </Link>
        <Link
          href="/admin/orders"
          className="focus-ring rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
        >
          View orders
        </Link>
        <Link
          href="/admin/commissions"
          className="focus-ring rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
        >
          Review commission inquiries
        </Link>
      </div>
    </div>
  );
}
