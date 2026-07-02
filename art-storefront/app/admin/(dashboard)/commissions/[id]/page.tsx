import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCommissionById, getCommissionAttachment } from "@/lib/db/inquiries";
import { formatDate } from "@/lib/format";
import { updateCommissionStatusAction } from "@/app/admin/(dashboard)/commissions/actions";

export const metadata: Metadata = {
  title: "Commission detail",
  robots: { index: false, follow: false },
};

const STATUS_OPTIONS = ["new", "responded", "closed"];

export default async function AdminCommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const commission = await getCommissionById(id);
  if (!commission) notFound();

  const attachments = await Promise.all(
    commission.attachments.map(async (a) => ({
      ...a,
      data: await getCommissionAttachment(a.id),
    }))
  );

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{commission.referenceId}</h1>
          <p className="mt-1 text-sm text-ink-soft">{formatDate(commission.createdAt)}</p>
        </div>
        <form action={updateCommissionStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={commission.id} />
          <select
            name="status"
            defaultValue={commission.status}
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

      <div className="mt-6 rounded-md border border-line bg-paper-dim/60 p-4 text-sm">
        <p className="font-medium">
          {commission.fullName} — {commission.email}
        </p>
        {commission.phone && <p className="text-ink-soft">{commission.phone}</p>}
        <p className="mt-2 text-ink-soft">
          {commission.workType} · {commission.budgetRange}
          {commission.approxSize ? ` · ~${commission.approxSize}` : ""}
        </p>
        {commission.pieceSlug && (
          <p className="mt-1 text-ink-soft">Referenced piece: {commission.pieceSlug}</p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium">Brief</p>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink-soft">{commission.brief}</p>
      </div>

      {attachments.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-medium">Reference images</p>
          <div className="mt-2 flex flex-wrap gap-3">
            {attachments.map((a) =>
              a.data ? (
                // eslint-disable-next-line @next/next/no-img-element -- base64 data URI, next/image can't optimize this
                <img
                  key={a.id}
                  src={`data:${a.data.mimeType};base64,${a.data.dataBase64}`}
                  alt={a.filename}
                  className="h-24 w-24 rounded-md border border-line object-cover"
                />
              ) : null
            )}
          </div>
        </div>
      )}
    </div>
  );
}
