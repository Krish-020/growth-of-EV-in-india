# Anaya Rao Studio — Art Storefront (Phase 1 Prototype)

A gallery-shop storefront for selling original paintings, sculpture and
limited-edition prints direct to buyers. This is the **Phase 1** deliverable:
a fully designed, fully interactive front-end prototype running on realistic
mock data — no real backend, database, auth, or payment gateway yet. See
[What's not real yet](#whats-not-real-yet-phase-2) below.

## How to run it locally

Requires Node.js 20+.

```bash
cd art-storefront
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
npm run build   # production build (also type-checks)
npm run start   # serve the production build locally
npm run lint    # ESLint
```

If you ever want to regenerate the placeholder artwork images (e.g. after
editing `data/artworks.json`), run:

```bash
node scripts/generate-art-placeholders.mjs
```

## How to deploy (Vercel)

1. Push this repo to GitHub (already done if you're reading this on the
   branch).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, and set
   the **Root Directory** to `art-storefront` (since the Next.js app lives in
   a subfolder of this repo, not the repo root).
3. Vercel auto-detects Next.js — no build settings to change.
4. Optionally set the environment variable `NEXT_PUBLIC_SITE_URL` to your
   production URL (e.g. `https://anayaraostudio.vercel.app`) so Open Graph
   tags, the sitemap and robots.txt point at the right domain. Without it,
   these default to `http://localhost:3000`.
5. Deploy. Every push to the branch gets a preview URL; merging to your
   production branch deploys to your main domain.

There is no database or secret API key to configure yet — that starts in
Phase 2.

## What's in this prototype

- **Landing page** — hero, artist teaser, featured work, category tiles,
  commission CTA.
- **Catalog** (`/catalog`) — filter by category, medium, size, price band and
  availability, all driven by the URL query string (shareable/bookmarkable
  filtered views).
- **Product pages** (`/art/[slug]`) — multi-image gallery with a hover-zoom
  lightbox, a drag-to-rotate angle viewer for sculptures (front/side/back/
  detail), full specs, story copy, certificate-of-authenticity note, and
  correct availability logic (see below).
- **Cart** (`/cart`) — persisted to `localStorage`, quantity controls for
  print editions, locked to qty 1 for one-of-one originals.
- **Mock checkout** (`/checkout` → `/checkout/confirmation`) — address form,
  a Razorpay-style payment method selector (UPI/card/netbanking — visual
  only, no real gateway), an order summary with shipping + estimated GST,
  and a confirmation page with a mock order number and "invoice."
- **Commission requests** (`/commission`) — brief + budget + reference image
  upload, submitted as an inquiry, never as an instant purchase.
- **About page** (`/about`) — artist bio/story.
- **SEO** — per-page metadata and Open Graph/Twitter tags, per-artwork
  structured data (schema.org `VisualArtwork`), `sitemap.xml`, `robots.txt`.

### Availability logic (the part that has to be correct)

- **Originals** (paintings, sculptures) have inventory of exactly one. Once
  `status` is `"sold"`, the buy button is replaced by a "Notify me" waitlist
  form and the piece can never be added to a cart.
- **Prints** decrement from a fixed edition size (`edition.availableCount`).
  When it hits zero the piece is treated as sold out, same as an original.
- **Commission-only** pieces (`status: "commission"`) never show a buy
  button — only a link into the commission request form.
- **Oversized/fragile sculpture** (`requiresShippingQuote: true`) skips the
  cart entirely and shows a "Request a shipping quote" form instead, per the
  spec (flat-rate shipping doesn't make sense for a 38kg welded-steel piece).

All of this logic lives in `lib/mockData.ts` and `lib/cart-context.tsx`, so
swapping in a real database later is mostly a matter of replacing the data
source, not rewriting the UI.

## Tech stack (and why)

- **Next.js 16 (App Router) + React 19 + TypeScript** — the default,
  well-supported choice for this kind of site: server-rendered for SEO,
  file-based routing, first-class image handling, and it deploys to Vercel
  with zero config. Since this is a solo-artist storefront (not high-traffic
  enterprise commerce), a single full-stack framework is simpler to reason
  about than separate frontend/backend services.
- **Tailwind CSS v4** — fast to build a bespoke, editorial "gallery" look
  with, without fighting a component library's opinions.
- **Fraunces (serif, display) + Inter (sans, body/UI)** via `next/font` —
  a warm editorial serif for headings against a clean sans for UI chrome,
  matching the "minimal gallery-white" brief.
- **No state management library** — cart state is ~5 functions over
  `localStorage`, implemented with `useSyncExternalStore` (no external
  dependency needed).
- Phase 2 will add **Postgres** (via Vercel Postgres/Neon/Supabase — any
  works, none is baked in yet), **Razorpay** (primary, since the brief calls
  for UPI/India-first; Stripe as an alternative for international cards),
  and an **image host** (Vercel Blob or Cloudinary) for real photography.

## Project structure

```
app/                  routes (App Router)
  page.tsx            landing page
  catalog/            catalog + filters
  art/[slug]/         product detail page
  cart/               cart
  checkout/           mock checkout + confirmation
  commission/         commission request form
  about/              artist story
components/           shared UI (ArtCard, ProductGallery, BuyBox, Nav, ...)
lib/                  types, mock data helpers, cart context, formatting,
                       shipping logic, site config
data/artworks.json    the entire mock catalog (single source of truth)
scripts/              generate-art-placeholders.mjs (placeholder image gen)
public/images/        generated placeholder SVGs (art + site imagery)
```

## Decisions & assumptions made for you

Since the brief's "fill these in" fields were left blank, everything below
is a placeholder — **swap it out before this goes live**:

- **Studio/artist name**: "Anaya Rao Studio" / "Anaya Rao" — a stand-in.
  Search-and-replace `lib/site-config.ts`.
- **What's sold**: original paintings (acrylic/oil/mixed media), ceramic +
  welded steel/bronze sculpture, and small hand-numbered print editions —
  matches your example in the brief.
- **Price range**: ₹18,000–₹2,40,000 across the mock catalog (your stated
  ₹5,000–₹2,50,000 range, roughly).
- **Ships to**: India + select international, with flat-rate tiers for
  small/medium/large and a "request a quote" path for oversized/fragile
  sculpture.
- **Aesthetic**: minimal gallery-white — warm off-white background, a
  terracotta/clay accent color, generous whitespace, serif display type.
  (You mentioned this as one option among a few — easy to restyle via the
  CSS variables in `app/globals.css` if you'd rather go warm/handmade or
  dark/dramatic instead.)
- **GST rate on checkout**: shown as a flat 12% estimate
  (`app/checkout/page.tsx`, `GST_RATE`). This is a placeholder — the real
  HSN/GST treatment of original art vs. prints needs sign-off from an
  accountant before Phase 2.
- **Catalog images**: all 55 product photos are **generated abstract SVG
  placeholders**, not real photography (see `scripts/generate-art-
  placeholders.mjs`). They're deterministic and category-colored so the
  catalog looks coherent, but they are not meant to be shipped — replace
  with real photos in Phase 2.
- **Mock catalog size**: 21 pieces (8 paintings, 7 sculptures, 6 prints) —
  enough to make filtering, sold-out states, commission-only states, and
  oversized-shipping states all visible without the copy taking forever to
  read.
- **Payment methods shown**: UPI, card, netbanking (Razorpay's usual set) —
  per your "Razorpay/UPI for India" instruction. Stripe was noted as an
  alternative but not built, since you can only wire up one gateway in
  Phase 2 and Razorpay fits India-first better.

## What's still needed from you before Phase 2

1. **Real content**: studio name, artist bio, actual catalog (titles,
   prices, dimensions, stories, photos — several angles per sculpture,
   ideally a couple of high-res shots per painting).
2. **Accounts/keys**: a Razorpay (or Stripe) account, a Postgres provider
   (Vercel Postgres, Neon, Supabase — your call), an image host (Vercel Blob
   or Cloudinary), and a transactional email provider (Resend is a common
   Vercel-ecosystem pick) for order receipts and the newsletter/notify-me
   flows.
3. **A decision on the GST/invoicing setup** — flat rate, HSN codes, and
   whether your accountant wants invoices generated in-app or through an
   external accounting tool.
4. **Sign-off on the placeholder brand** (name, tagline, palette) or your
   real ones to swap in.

## What's not real yet (Phase 2)

This prototype intentionally has **no backend**. Specifically:

- The "catalog" is a static JSON file, not a database — there's no admin
  dashboard to add/edit/mark-sold pieces yet.
- "Add to cart" → "checkout" → "payment" is entirely client-side and fake:
  no real Razorpay/Stripe session is created, no charge happens, no email is
  sent, and the "order" only exists in the browser's `sessionStorage` long
  enough to render the confirmation page.
- "Notify me," the newsletter signup, and the commission request form all
  just show a success message locally — nothing is actually stored or
  emailed.
- There's no authentication, so there's no real admin area yet.

Phase 2 replaces the mock catalog with Postgres, wires up real Razorpay
payments with server-side order verification, adds transactional email for
receipts/GST invoices and notify-me/commission alerts, and adds an
authenticated admin dashboard for managing pieces, editions, orders and
commission inquiries.
