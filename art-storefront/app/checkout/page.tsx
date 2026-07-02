"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart-context";
import { useCatalog } from "@/lib/catalog-context";
import { getShippingForArtwork, type ShippingZone } from "@/lib/shipping";
import { formatPrice } from "@/lib/format";
import { GST_RATE } from "@/lib/pricing";

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  gstin?: string;
}

type Step = "shipping" | "payment";

const PAYMENT_METHODS = [
  { value: "upi", label: "UPI" },
  { value: "card", label: "Credit / Debit card" },
  { value: "netbanking", label: "Netbanking" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotal, clearCart, isHydrated } = useCart();
  const { getArtworkBySlug, isLoaded } = useCatalog();
  const [step, setStep] = useState<Step>("shipping");
  const [country, setCountry] = useState("India");
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    gstin: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const zone: ShippingZone = country === "India" ? "domestic" : "international";

  const cartArtworks = useMemo(
    () =>
      lines
        .map((line) => ({ line, artwork: getArtworkBySlug(line.slug) }))
        .filter((x) => x.artwork),
    [lines, getArtworkBySlug]
  );

  const shippingTotal = useMemo(
    () =>
      cartArtworks.reduce((sum, { artwork }) => {
        const result = getShippingForArtwork(artwork!, zone);
        return sum + result.cost;
      }, 0),
    [cartArtworks, zone]
  );

  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + shippingTotal + gst;

  if (isHydrated && isLoaded && lines.length === 0 && !processing) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <h1 className="font-display text-3xl">Nothing to check out</h1>
        <p className="mt-3 text-ink-soft">Your cart is currently empty.</p>
        <Link
          href="/catalog"
          className="focus-ring mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper hover:bg-clay-dark"
        >
          Browse the catalog
        </Link>
      </div>
    );
  }

  function handleShippingSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handlePay(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    // No payment gateway is called here on purpose (see README) — this
    // creates a real order and decrements real inventory in the database,
    // it just never charges a card/UPI. Phase 2+ would verify a Razorpay/
    // Stripe payment server-side before this request is allowed to succeed.
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: { ...address, country },
          paymentMethod,
          lines: lines.map((l) => ({ slug: l.slug, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong placing your order.");
        setProcessing(false);
        return;
      }
      clearCart();
      router.push(`/checkout/confirmation?order=${data.id}`);
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Checkout</h1>

        <ol className="mt-6 flex gap-6 text-sm">
          <li className={step === "shipping" ? "font-medium text-ink" : "text-ink-soft"}>
            1. Shipping
          </li>
          <li className={step === "payment" ? "font-medium text-ink" : "text-ink-soft"}>
            2. Payment
          </li>
        </ol>

        {step === "shipping" && (
          <form onSubmit={handleShippingSubmit} className="mt-8 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" required>
                <input
                  required
                  value={address.fullName}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, fullName: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  value={address.email}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, email: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Phone" required>
              <input
                type="tel"
                required
                value={address.phone}
                onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))}
                className={inputClass}
              />
            </Field>

            <Field label="Address line 1" required>
              <input
                required
                value={address.addressLine1}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, addressLine1: e.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Address line 2">
              <input
                value={address.addressLine2}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, addressLine2: e.target.value }))
                }
                className={inputClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="City" required>
                <input
                  required
                  value={address.city}
                  onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="State" required>
                <input
                  required
                  value={address.state}
                  onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))}
                  className={inputClass}
                />
              </Field>
              <Field label="Postal code" required>
                <input
                  required
                  value={address.postalCode}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, postalCode: e.target.value }))
                  }
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Country" required>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="Singapore">Singapore</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            <Field label="GSTIN (optional, for a business GST invoice)">
              <input
                value={address.gstin}
                onChange={(e) => setAddress((a) => ({ ...a, gstin: e.target.value }))}
                placeholder="22AAAAA0000A1Z5"
                className={inputClass}
              />
            </Field>

            <button
              type="submit"
              className="focus-ring mt-4 w-full rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-clay-dark sm:w-auto sm:px-10"
            >
              Continue to payment
            </button>
          </form>
        )}

        {step === "payment" && (
          <form onSubmit={handlePay} className="mt-8 flex flex-col gap-5">
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">Payment method</legend>
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="focus-ring flex items-center gap-3 rounded-md border border-line px-4 py-3 text-sm has-[:checked]:border-clay"
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={() => setPaymentMethod(method.value)}
                  />
                  {method.label}
                </label>
              ))}
            </fieldset>

            <p className="rounded-md border border-line bg-paper-dim px-4 py-3 text-xs text-ink-soft">
              No real payment gateway is connected — placing this order
              won&apos;t charge a card or UPI, but it does create a real order
              and update real inventory. Wiring Razorpay (UPI/cards/netbanking
              for India) here is the one piece left for a fully live store.
            </p>

            {error && (
              <p className="rounded-md border border-clay/40 bg-clay/10 px-4 py-3 text-sm text-clay-dark">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep("shipping")}
                className="focus-ring rounded-full border border-line px-6 py-3.5 text-sm font-medium text-ink-soft hover:border-clay hover:text-clay"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={processing}
                className="focus-ring flex-1 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-paper transition-colors hover:bg-clay-dark disabled:opacity-60"
              >
                {processing ? "Processing…" : `Pay ${formatPrice(total)}`}
              </button>
            </div>
          </form>
        )}
      </div>

      <aside className="h-fit rounded-lg border border-line bg-paper-dim/60 p-6">
        <h2 className="font-display text-lg">Order summary</h2>
        <ul className="mt-4 flex flex-col gap-4">
          {cartArtworks.map(({ line, artwork }) => (
            <li key={line.slug} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-paper">
                <Image
                  src={artwork!.images[0].src}
                  alt={artwork!.images[0].alt}
                  fill
                  unoptimized
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{artwork!.title}</p>
                <p className="text-ink-soft">Qty {line.quantity}</p>
              </div>
              <p className="text-sm">{formatPrice(artwork!.price * line.quantity)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-soft">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">
              Shipping ({zone === "domestic" ? "within India" : "international"})
            </span>
            <span>{formatPrice(shippingTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Estimated GST (12%)</span>
            <span>{formatPrice(gst)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-base font-medium">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

const inputClass =
  "focus-ring rounded-md border border-line bg-paper px-3 py-2.5 text-sm text-ink outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-ink-soft">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </span>
      {children}
    </label>
  );
}
