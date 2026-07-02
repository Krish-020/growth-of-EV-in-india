"use client";

import { useState, type FormEvent } from "react";

export default function ShippingQuoteForm({ title, slug }: { title: string; slug: string }) {
  const [submitted, setSubmitted] = useState(false);
  const [destination, setDestination] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/shipping-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artworkSlug: slug, email, destination }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Couldn't send that request — please try again.");
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-line bg-paper-dim px-4 py-4 text-sm">
        <p className="font-medium">Quote request received.</p>
        <p className="mt-1 text-ink-soft">
          We&apos;ll email a crating and delivery quote for &ldquo;{title}&rdquo; to{" "}
          {destination || "your delivery address"} within 2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-md border border-line bg-paper-dim p-4">
      <div>
        <p className="text-sm font-medium">Request a shipping quote</p>
        <p className="mt-1 text-xs text-ink-soft">
          This piece is too large or fragile for flat-rate shipping. Tell us
          where it&apos;s going and we&apos;ll arrange specialist crating and
          freight.
        </p>
      </div>
      <label className="flex flex-col gap-1 text-xs text-ink-soft">
        Delivery city &amp; country
        <input
          type="text"
          required
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="e.g. Mumbai, India"
          className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-ink-soft">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="focus-ring rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none"
        />
      </label>
      {error && <p className="text-xs text-clay">{error}</p>}
      <button
        type="submit"
        className="focus-ring mt-1 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-clay-dark"
      >
        Request quote
      </button>
    </form>
  );
}
