import Link from "next/link";
import type { Metadata } from "next";
import { getAllOrders } from "@/lib/db/orders";
import { formatPrice, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>

      {orders.length === 0 ? (
        <p className="mt-6 text-ink-soft">No orders yet.</p>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
                  <td className="px-4 py-3">{order.address.fullName}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-ink-soft">{order.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="focus-ring text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
