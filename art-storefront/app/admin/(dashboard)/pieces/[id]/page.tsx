import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArtworkById, getArtworkImagesWithIds } from "@/lib/db/artworks";
import ArtworkForm from "@/components/admin/ArtworkForm";
import { deleteImageAction, toggleSoldAction } from "@/app/admin/(dashboard)/pieces/actions";

export const metadata: Metadata = {
  title: "Edit piece",
  robots: { index: false, follow: false },
};

export default async function EditArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = await getArtworkById(id);
  if (!artwork) notFound();

  const images = await getArtworkImagesWithIds(id);
  const nextStatus = artwork.status === "sold" ? "available" : "sold";

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl">{artwork.title}</h1>
        <div className="flex gap-2">
          <Link
            href={`/art/${artwork.slug}`}
            target="_blank"
            className="focus-ring rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-clay hover:text-clay"
          >
            View on site
          </Link>
          <form action={toggleSoldAction}>
            <input type="hidden" name="id" value={artwork.id} />
            <input type="hidden" name="nextStatus" value={nextStatus} />
            <button
              type="submit"
              className="focus-ring rounded-full border border-line px-4 py-2 text-sm text-ink-soft hover:border-clay hover:text-clay"
            >
              Mark as {nextStatus}
            </button>
          </form>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-4">
          {images.map((img) => (
            <div key={img.id} className="flex flex-col items-center gap-1">
              <div className="relative h-24 w-24 overflow-hidden rounded-md border border-line bg-paper-dim">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  unoptimized
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <span className="text-[10px] text-ink-soft">{img.view}</span>
              <form action={deleteImageAction}>
                <input type="hidden" name="imageId" value={img.id} />
                <input type="hidden" name="artworkId" value={artwork.id} />
                <button
                  type="submit"
                  className="focus-ring text-xs text-ink-soft underline decoration-line underline-offset-4 hover:text-clay"
                >
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <ArtworkForm artwork={artwork} />
      </div>
    </div>
  );
}
