"use client";

import { useState, type FormEvent } from "react";

export default function NotifyMeForm({ title }: { title: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    // Mock waitlist submission — Phase 2 stores this against the piece/drop
    // in Postgres and triggers a transactional email when similar work drops.
    setSubmitted(true);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
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
    </form>
  );
}
