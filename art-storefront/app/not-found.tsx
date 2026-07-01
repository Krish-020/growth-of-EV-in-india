import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">404</p>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">
        This piece isn&apos;t here
      </h1>
      <p className="mt-3 text-ink-soft">
        The page you&apos;re looking for may have sold, moved, or never
        existed.
      </p>
      <Link
        href="/catalog"
        className="focus-ring mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
      >
        Browse the catalog
      </Link>
    </div>
  );
}
