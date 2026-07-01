import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description: `The studio story behind ${siteConfig.name} — process, materials and how pieces are made.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">
        About the studio
      </p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">
        {siteConfig.artistName}
      </h1>
      <p className="mt-2 text-ink-soft">{siteConfig.location}</p>

      <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-paper-dim">
        <Image
          src="/images/site/studio-wall.svg"
          alt="Studio wall with works in progress"
          fill
          unoptimized
          className="object-cover"
        />
      </div>

      <div className="prose-none mt-10 flex flex-col gap-5 text-ink-soft">
        <p>
          I trained first as a painter and came to sculpture almost by
          accident — a ceramics elective that turned into a second, parallel
          practice I never gave up. Most days I move between the two: canvas
          in the morning while the light is still cool and even, clay or
          metal in the afternoon when I want to work with my hands instead of
          my eyes.
        </p>
        <p>
          Everything in this shop is made in a small studio, one piece at a
          time. Originals are exactly that — one of one. When I like a
          composition enough to want it to reach more walls than the original
          ever could, I release a small, hand-numbered print edition. Nothing
          is manufactured or reproduced beyond what&apos;s listed.
        </p>
        <p>
          I take on a limited number of commissions each year. If you have a
          space in mind and want something built specifically for it, the{" "}
          <Link
            href="/commission"
            className="focus-ring font-medium text-clay underline decoration-clay/40 underline-offset-4 hover:decoration-clay"
          >
            commission request
          </Link>{" "}
          page is the place to start — it&apos;s a conversation first, so there&apos;s
          no obligation in reaching out.
        </p>
        <p>
          Every original ships with a signed certificate of authenticity.
          Fragile and oversized sculpture is crated and shipped by a
          specialist courier, quoted individually rather than flat-rated —
          you&apos;ll always see the real cost before you commit.
        </p>
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-8">
        <Link
          href="/catalog"
          className="focus-ring rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          View the catalog
        </Link>
        <a
          href={siteConfig.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring rounded-full border border-line px-6 py-3 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
        >
          Follow the studio
        </a>
      </div>
    </div>
  );
}
