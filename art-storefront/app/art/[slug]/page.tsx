import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllArtworks,
  getArtworkBySlug,
  getOriginalFor,
  getPrintsOf,
  getRelatedArtworks,
} from "@/lib/mockData";
import { formatDimensions, formatPrice, formatWeight } from "@/lib/format";
import ProductGallery from "@/components/ProductGallery";
import BuyBox from "@/components/BuyBox";
import StatusBadge from "@/components/StatusBadge";
import ArtCard from "@/components/ArtCard";

export function generateStaticParams() {
  return getAllArtworks().map((artwork) => ({ slug: artwork.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const artwork = getArtworkBySlug(slug);
  if (!artwork) return {};

  const description = `${artwork.medium}, ${artwork.year}. ${artwork.story.slice(0, 140)}...`;

  return {
    title: artwork.title,
    description,
    openGraph: {
      title: artwork.title,
      description,
      type: "website",
      images: [artwork.images[0]?.src ?? "/images/site/hero.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title: artwork.title,
      description,
      images: [artwork.images[0]?.src ?? "/images/site/hero.svg"],
    },
  };
}

const CATEGORY_LABEL: Record<string, string> = {
  painting: "Painting",
  sculpture: "Sculpture",
  print: "Limited-edition print",
};

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artwork = getArtworkBySlug(slug);
  if (!artwork) notFound();

  const originalPiece = getOriginalFor(artwork);
  const prints = getPrintsOf(artwork.slug);
  const related = getRelatedArtworks(artwork, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    artform: CATEGORY_LABEL[artwork.category],
    artMedium: artwork.medium,
    dateCreated: String(artwork.year),
    image: artwork.images.map((img) => img.src),
    description: artwork.story,
    offers: {
      "@type": "Offer",
      price: artwork.price,
      priceCurrency: artwork.currency,
      availability:
        artwork.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/SoldOut",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ink-soft">
        <Link href="/catalog" className="focus-ring hover:text-clay">
          Catalog
        </Link>{" "}
        /{" "}
        <Link
          href={`/catalog?category=${artwork.category}`}
          className="focus-ring hover:text-clay"
        >
          {CATEGORY_LABEL[artwork.category]}
        </Link>{" "}
        / <span className="text-ink">{artwork.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <ProductGallery
            images={artwork.images}
            title={artwork.title}
            category={artwork.category}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <StatusBadge artwork={artwork} />
            <span className="text-xs uppercase tracking-wider text-ink-soft">
              {CATEGORY_LABEL[artwork.category]}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl">{artwork.title}</h1>
          <p className="mt-1 text-ink-soft">
            {artwork.medium}, {artwork.year}
          </p>

          <p className="mt-4 font-display text-2xl">
            {formatPrice(artwork.price)}
            {artwork.priceNote && (
              <span className="ml-2 text-sm font-sans text-ink-soft">
                {artwork.priceNote}
              </span>
            )}
          </p>

          <div className="mt-6">
            <BuyBox artwork={artwork} />
          </div>

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="font-display text-lg">The story</h2>
            <p className="mt-2 text-ink-soft">{artwork.story}</p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-6 text-sm">
            <dt className="text-ink-soft">Dimensions</dt>
            <dd>{formatDimensions(artwork)}</dd>
            <dt className="text-ink-soft">Weight</dt>
            <dd>{formatWeight(artwork.weightKg)}</dd>
            <dt className="text-ink-soft">Medium</dt>
            <dd>{artwork.medium}</dd>
            <dt className="text-ink-soft">Year</dt>
            <dd>{artwork.year}</dd>
            {artwork.edition && (
              <>
                <dt className="text-ink-soft">Edition</dt>
                <dd>
                  {`${artwork.edition.size} total, ${artwork.edition.availableCount} remaining`}
                </dd>
              </>
            )}
            <dt className="text-ink-soft">Shipping</dt>
            <dd>
              {artwork.requiresShippingQuote
                ? "By quote (specialist freight)"
                : "Flat-rate, insured"}
            </dd>
          </dl>

          <p className="mt-6 border-t border-line pt-6 text-xs text-ink-soft">
            {artwork.isOriginal
              ? "Ships with a signed certificate of authenticity and a studio provenance note."
              : "Hand-numbered and signed by the artist; edition details are recorded in the studio ledger."}
          </p>

          {originalPiece && (
            <p className="mt-3 text-sm">
              A print of{" "}
              <Link
                href={`/art/${originalPiece.slug}`}
                className="focus-ring font-medium text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
              >
                {originalPiece.title}
              </Link>
              .
            </p>
          )}

          {prints.length > 0 && (
            <div className="mt-3 text-sm">
              <p className="text-ink-soft">Also available as a print:</p>
              <ul className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                {prints.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/art/${p.slug}`}
                      className="focus-ring font-medium text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20 border-t border-line pt-14">
          <h2 className="font-display text-2xl sm:text-3xl">You may also like</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {related.map((a) => (
              <ArtCard key={a.slug} artwork={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
