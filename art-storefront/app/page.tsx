import Image from "next/image";
import Link from "next/link";
import ArtCard from "@/components/ArtCard";
import { getFeaturedArtworks } from "@/lib/db/artworks";
import { siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const featured = await getFeaturedArtworks(4);

  return (
    <>
      {/* Hero */}
      <section className="relative flex h-[78vh] min-h-[520px] items-end overflow-hidden bg-paper-dim">
        <Image
          src="/images/site/hero.svg"
          alt="Featured artwork from the studio"
          fill
          priority
          unoptimized
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 sm:px-8 sm:pb-20">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-paper/80">
            {siteConfig.location}
          </p>
          <h1 className="max-w-2xl font-display text-4xl leading-[1.05] text-paper sm:text-6xl">
            Original paintings and sculpture, made by hand and sold direct.
          </h1>
          <p className="mt-4 max-w-lg text-base text-paper/85 sm:text-lg">
            {siteConfig.tagline}. Every piece is one of one, or part of a small
            numbered edition.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="focus-ring rounded-full bg-paper px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-paper/90"
            >
              View the catalog
            </Link>
            <Link
              href="/about"
              className="focus-ring rounded-full border border-paper/60 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-paper/10"
            >
              The studio story
            </Link>
          </div>
        </div>
      </section>

      {/* Artist teaser */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-28 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-center">
        <div className="relative aspect-[4/5] overflow-hidden bg-paper-dim md:order-2">
          <Image
            src="/images/site/artist-portrait.svg"
            alt={`${siteConfig.artistName} in the studio`}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
        <div className="md:order-1">
          <p className="text-xs uppercase tracking-[0.2em] text-clay">
            About the artist
          </p>
          <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            Every piece starts on the studio floor, not a screen.
          </h2>
          <p className="mt-4 max-w-md text-ink-soft">
            {`${siteConfig.artistName} works between painting and sculpture, usually a few pieces at once, letting the slow ones sit until they're ready. This is the online extension of that studio — the same one-of-one pieces and small print runs, sold directly, without a gallery markup in between.`}
          </p>
          <Link
            href="/about"
            className="focus-ring mt-6 inline-block text-sm font-medium text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
          >
            Read the full story →
          </Link>
        </div>
      </section>

      {/* Featured work */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay">
              Recently in the studio
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl">
              Featured work
            </h2>
          </div>
          <Link
            href="/catalog"
            className="focus-ring hidden shrink-0 text-sm font-medium text-ink-soft underline decoration-line underline-offset-4 hover:text-clay sm:block"
          >
            View full catalog
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {featured.map((artwork) => (
            <ArtCard key={artwork.slug} artwork={artwork} />
          ))}
        </div>
        <Link
          href="/catalog"
          className="focus-ring mt-8 block text-sm font-medium text-ink-soft underline decoration-line underline-offset-4 hover:text-clay sm:hidden"
        >
          View full catalog →
        </Link>
      </section>

      {/* Category tiles */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/catalog?category=painting",
              title: "Paintings",
              copy: "Acrylic, oil and mixed media on canvas, linen and panel.",
            },
            {
              href: "/catalog?category=sculpture",
              title: "Sculpture",
              copy: "Ceramic, welded steel & bronze — one-of-one forms.",
            },
            {
              href: "/catalog?category=print",
              title: "Limited-edition prints",
              copy: "Hand-numbered archival editions, a more accessible way in.",
            },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="focus-ring group flex flex-col justify-between rounded-lg border border-line bg-paper-dim/60 p-6 transition-colors hover:border-clay"
            >
              <div>
                <h3 className="font-display text-2xl">{tile.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">{tile.copy}</p>
              </div>
              <span className="mt-6 text-sm font-medium text-clay">
                Browse{" "}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Commission CTA */}
      <section className="border-y border-line bg-paper-dim/60">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-16 sm:px-8 sm:py-20 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-clay">
              Made to order
            </p>
            <h2 className="mt-2 max-w-md font-display text-3xl sm:text-4xl">
              Commissioning a piece for your space?
            </h2>
            <p className="mt-3 max-w-md text-ink-soft">
              Share a brief, a budget and any references — commissions are a
              conversation first, not an instant checkout.
            </p>
          </div>
          <Link
            href="/commission"
            className="focus-ring shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-clay-dark"
          >
            Start a commission request
          </Link>
        </div>
      </section>
    </>
  );
}
