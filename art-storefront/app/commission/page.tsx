import { Suspense } from "react";
import type { Metadata } from "next";
import CommissionForm from "@/components/CommissionForm";

export const metadata: Metadata = {
  title: "Request a Commission",
  description:
    "Commission an original painting or sculpture — share a brief, budget and references to start the conversation.",
};

export default function CommissionPage() {
  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-clay">Commissions</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">
        Request a commission
      </h1>
      <p className="mt-4 text-ink-soft">
        Commissions are made to order and start as a conversation, not an
        instant checkout. Tell us about the space, the mood, and your budget,
        and we&apos;ll follow up with questions and a rough quote.
      </p>

      <div className="mt-10">
        <Suspense fallback={null}>
          <CommissionForm />
        </Suspense>
      </div>
    </div>
  );
}
