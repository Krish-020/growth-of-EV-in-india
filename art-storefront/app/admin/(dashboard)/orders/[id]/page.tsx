import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderById } from "@/lib/db/orders";
import { formatPrice, formatDate } from "@/lib/format";
import { updateOrderStatusAction } from "@/app/admin/(dashboard)/orders/actions";

export const metadata: Metadata = {
  title: "Order detail",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = ["paid", "fulfilled", "cancelled"];

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink-soft">{formatDate(order.createdAt)}</p>
        </div>
        <form action={updateOrderStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={order.id} />
          <select
            name="status"
            defaultValue={order.status}
            className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="focus-ring rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-clay hover:text-clay"
          >
            Update
          </button>
        </form>
      </div>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {order.lines.map((line) => (
          <li key={line.id} className="flex gap-4 py-4">
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
          <span>Total</span>
          <span>{formatPrice(order.total)}</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-md border border-line bg-paper-dim/60 p-4 text-sm">
          <p className="font-medium">Contact</p>
          <p className="mt-1 text-ink-soft">
            {order.address.fullName}
            <br />
            {order.address.email}
            <br />
            {order.address.phone}
          </p>
        </div>
        <div className="rounded-md border border-line bg-paper-dim/60 p-4 text-sm">
          <p className="font-medium">Shipping to</p>
          <p className="mt-1 text-ink-soft">
            {order.address.addressLine1}
            {order.address.addressLine2 ? `, ${order.address.addressLine2}` : ""}
            <br />
            {order.address.city}, {order.address.state} {order.address.postalCode}
            <br />
            {order.address.country}
          </p>
        </div>
      </div>

      {order.address.gstin && (
        <p className="mt-4 text-sm text-ink-soft">GSTIN: {order.address.gstin}</p>
      )}
      <p className="mt-2 text-sm text-ink-soft">Payment method: {order.paymentMethod}</p>
    </div>
  );
}
