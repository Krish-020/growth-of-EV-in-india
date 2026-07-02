"use client";

import { useState, type FormEvent } from "react";

export default function NotifyMeForm({ title, slug }: { title: string; slug: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, artworkSlug: slug }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
    } catch {
      setError("Couldn't save that — please try again.");
    }
  }

  if (submitted) {
    return (
      <p className="rounded-md border border-line bg-paper-dim px-4 py-3 text-sm text-ink-soft">
        You&apos;ll hear from us if a similar piece to &ldquo;{title}&rdquo; becomes
        available.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="notify-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="focus-ring w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm outline-none"
        />
        <button
          type="submit"
          className="focus-ring shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          Notify me
        </button>
      </div>
      {error && <p className="text-xs text-clay">{error}</p>}
    </form>
  );
}
