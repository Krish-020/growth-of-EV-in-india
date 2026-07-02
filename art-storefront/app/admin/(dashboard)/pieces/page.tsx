import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getAllArtworks } from "@/lib/db/artworks";
import { formatPrice } from "@/lib/format";
import { availabilityLabel } from "@/lib/artwork-rules";

export const metadata: Metadata = {
  title: "Pieces",
  robots: { index: false, follow: false },
};

export default async function AdminPiecesPage() {
  const artworks = await getAllArtworks();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Pieces</h1>
        <Link
          href="/admin/pieces/new"
          className="focus-ring rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          Add a piece
        </Link>
      </div>

      <div className="mt-8 overflow-x-auto rounded-lg border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wider text-ink-soft">
            <tr>
              <th className="px-4 py-3">Piece</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {artworks.map((artwork) => (
              <tr key={artwork.id}>
                <td className="flex items-center gap-3 px-4 py-3">
                  {artwork.images[0] && (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-paper-dim">
                      <Image
                        src={artwork.images[0].src}
                        alt=""
                        fill
                        unoptimized
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <span className="font-medium">{artwork.title}</span>
                </td>
                <td className="px-4 py-3 text-ink-soft">{artwork.category}</td>
                <td className="px-4 py-3">{formatPrice(artwork.price)}</td>
                <td className="px-4 py-3 text-ink-soft">{availabilityLabel(artwork)}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/pieces/${artwork.id}`}
                    className="focus-ring text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
