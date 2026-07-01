import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";

export default function ArtCard({ artwork }: { artwork: Artwork }) {
  const cover = artwork.images[0];

  return (
    <Link
      href={`/art/${artwork.slug}`}
      className="focus-ring group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-paper-dim">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 40vw, 90vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          unoptimized
        />
        <div className="absolute left-3 top-3">
          <StatusBadge artwork={artwork} />
        </div>
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg leading-tight">{artwork.title}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{artwork.medium}</p>
        </div>
        <p className="shrink-0 whitespace-nowrap text-sm font-medium">
          {formatPrice(artwork.price)}
        </p>
      </div>
    </Link>
  );
}
