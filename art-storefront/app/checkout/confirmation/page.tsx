"use client";

import Image from "next/image";
import Link from "next/link";
import { useMockOrder } from "@/lib/mock-order";
import { formatPrice } from "@/lib/format";

export default function ConfirmationPage() {
  const order = useMockOrder();

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-3xl">No recent order found</h1>
        <p className="mt-3 text-ink-soft">
          If you just completed checkout, this page may have been opened in a
          new tab.
        </p>
        <Link
          href="/catalog"
          className="focus-ring mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-sage">Order confirmed</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">
        Thank you, {order.address.fullName.split(" ")[0] || "collector"}.
      </h1>
      <p className="mt-3 text-ink-soft">
        {`Order ${order.id} is confirmed. A GST-compliant invoice and receipt have been emailed to ${order.address.email}.`}
      </p>
      <p className="mt-2 text-xs text-ink-soft">
        (Demo checkout — no email was actually sent and no payment was taken.)
      </p>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.lines.map((line) => (
          <li key={line.slug} className="flex gap-4 py-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-paper-dim">
              <Image
                src={line.image}
                alt={line.title}
                fill
                unoptimized
                sizes="64px"
                className="object-cover"
              />
            </div>
            <div className="flex-1 text-sm">
              <p className="font-medium">{line.title}</p>
              <p className="text-ink-soft">
                {line.medium} · Qty {line.quantity}
              </p>
            </div>
            <p className="text-sm">{formatPrice(line.price * line.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-soft">Subtotal</span>
          <span>{formatPrice(order.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-soft">Shipping</span>
          <span>{formatPrice(order.shipping)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-ink-soft">GST</span>
          <span>{formatPrice(order.gst)}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-medium">
          <span>Total paid</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 rounded-md border border-line bg-paper-dim/60 p-4 text-sm">
        <p className="font-medium">Shipping to</p>
        <p className="mt-1 text-ink-soft">
          {order.address.fullName}
          <br />
          {order.address.addressLine1}
          {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
          <br />
          {order.address.city}, {order.address.state} {order.address.postalCode}
          <br />
          {order.address.country}
        </p>
      </div>

      <Link
        href="/catalog"
        className="focus-ring mt-10 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
      >
        Continue browsing
      </Link>
    </div>
  );
}
