import Link from "next/link";
import type { Metadata } from "next";
import { getAllCommissions, getAllShippingQuoteRequests } from "@/lib/db/inquiries";
import { formatDate } from "@/lib/format";
import { updateShippingQuoteStatusAction } from "@/app/admin/(dashboard)/commissions/actions";

export const metadata: Metadata = {
  title: "Commissions",
  robots: { index: false, follow: false },
};

const QUOTE_STATUS_OPTIONS = ["new", "quoted", "closed"];

export default async function AdminCommissionsPage() {
  const [commissions, quotes] = await Promise.all([
    getAllCommissions(),
    getAllShippingQuoteRequests(),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl">Commission inquiries</h1>

      {commissions.length === 0 ? (
        <p className="mt-6 text-ink-soft">No commission requests yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">From</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {commissions.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium">{c.referenceId}</td>
                  <td className="px-4 py-3">{c.fullName}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.workType}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.budgetRange}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.status}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/commissions/${c.id}`}
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

      <h2 className="mt-12 font-display text-2xl">Shipping quote requests</h2>
      {quotes.length === 0 ? (
        <p className="mt-4 text-ink-soft">No shipping quote requests yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-line bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
              <tr>
                <th className="px-4 py-3">Piece</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {quotes.map((q) => (
                <tr key={q.id}>
                  <td className="px-4 py-3 font-medium">{q.artworkSlug}</td>
                  <td className="px-4 py-3">{q.email}</td>
                  <td className="px-4 py-3 text-ink-soft">{q.destination}</td>
                  <td className="px-4 py-3 text-ink-soft">{formatDate(q.createdAt)}</td>
                  <td className="px-4 py-3">
                    <form action={updateShippingQuoteStatusAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={q.id} />
                      <select
                        name="status"
                        defaultValue={q.status}
                        className="focus-ring rounded-md border border-line bg-paper px-2 py-1 text-xs"
                      >
                        {QUOTE_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="focus-ring text-xs text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
                      >
                        Update
                      </button>
                    </form>
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
