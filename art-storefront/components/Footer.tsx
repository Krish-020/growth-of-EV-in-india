import Link from "next/link";
import Newsletter from "@/components/Newsletter";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg">{siteConfig.name}</p>
            <p className="mt-2 max-w-xs text-sm text-paper/70">
              {siteConfig.description}
            </p>
            <p className="mt-4 text-sm text-paper/70">{siteConfig.location}</p>
          </div>

          <nav aria-label="Footer" className="flex flex-col gap-2 text-sm">
            <span className="mb-1 text-xs uppercase tracking-wider text-paper/50">
              Explore
            </span>
            <Link href="/catalog" className="focus-ring text-paper/80 hover:text-paper">
              Full catalog
            </Link>
            <Link
              href="/catalog?category=painting"
              className="focus-ring text-paper/80 hover:text-paper"
            >
              Paintings
            </Link>
            <Link
              href="/catalog?category=sculpture"
              className="focus-ring text-paper/80 hover:text-paper"
            >
              Sculpture
            </Link>
            <Link
              href="/catalog?category=print"
              className="focus-ring text-paper/80 hover:text-paper"
            >
              Limited-edition prints
            </Link>
            <Link href="/commission" className="focus-ring text-paper/80 hover:text-paper">
              Request a commission
            </Link>
            <Link href="/about" className="focus-ring text-paper/80 hover:text-paper">
              About the studio
            </Link>
          </nav>

          <div>
            <span className="mb-2 block text-xs uppercase tracking-wider text-paper/50">
              Stay in the loop
            </span>
            <p className="mb-3 text-sm text-paper/70">
              New pieces, print releases and studio notes — a few times a year, never
              more.
            </p>
            <Newsletter variant="dark" />
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-paper/15 pt-6 text-xs text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. {siteConfig.shipsTo}.
          </p>
          <p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="focus-ring hover:text-paper"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
