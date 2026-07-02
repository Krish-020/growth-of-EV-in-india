"use client";

import { useState, type FormEvent } from "react";

export default function Newsletter({
  className = "",
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitted" | "error">("idle");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setStatus(res.ok ? "submitted" : "error");
    } catch {
      setStatus("error");
    }
  }

  const isDark = variant === "dark";

  if (status === "submitted") {
    return (
      <p
        className={`text-sm ${isDark ? "text-paper" : "text-ink"} ${className}`}
      >
        You&apos;re on the list — thank you. Watch your inbox for new drops.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex w-full max-w-sm flex-col gap-2 sm:flex-row ${className}`}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className={`focus-ring w-full rounded-full border px-4 py-2.5 text-sm outline-none ${
          isDark
            ? "border-paper/30 bg-transparent text-paper placeholder:text-paper/50"
            : "border-line bg-paper text-ink placeholder:text-ink-soft/60"
        }`}
      />
      <button
        type="submit"
        className={`focus-ring shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
          isDark
            ? "bg-paper text-ink hover:bg-paper/90"
            : "bg-ink text-paper hover:bg-clay-dark"
        }`}
      >
        Notify me of new drops
      </button>
      {status === "error" && (
        <p className={`text-xs ${isDark ? "text-paper/70" : "text-clay"}`}>
          Couldn&apos;t save that — please try again.
        </p>
      )}
    </form>
  );
}
