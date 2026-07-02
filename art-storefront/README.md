# Anaya Rao Studio — Art Storefront

A gallery-shop storefront for selling original paintings, sculpture and
limited-edition prints direct to buyers. This is a real, working full-stack
app — database, admin dashboard, order/commission/notify/newsletter
persistence, transactional email hooks — with **one thing deliberately left
out: no payment gateway is wired up.** "Pay" on checkout creates a real
order and decrements real inventory, it just never charges a card or UPI.
See [What's not real yet](#whats-not-real-yet) below for the exact line.

## How to run it locally

Requires Node.js 22+ (uses the built-in `node:sqlite` module — see
[Database](#database) below for why).

```bash
cd art-storefront
npm install
cp .env.example .env.local   # then fill in ADMIN_PASSWORD and SESSION_SECRET
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin dashboard is
at [http://localhost:3000/admin](http://localhost:3000/admin) — sign in with
the `ADMIN_PASSWORD` you set in `.env.local`.

On first run, the database is created at `var/app.db` and auto-seeded from
`data/artworks.json` (21 starter pieces) — no separate migration step.

Other useful commands:

```bash
npm run build     # production build (also type-checks)
npm run start     # serve the production build locally
npm run lint       # ESLint
npm run db:reset   # delete the local database (it re-seeds on next start)
```

If you ever want to regenerate the placeholder artwork images (e.g. after
editing `data/artworks.json`), run:

```bash
node scripts/generate-art-placeholders.mjs
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Required | What it's for |
| --- | --- | --- |
| `ADMIN_PASSWORD` | Yes | Password for `/admin`. Plain string, compared in constant time — pick something strong. |
| `SESSION_SECRET` | Yes | Signs the admin session cookie. Any long random string. |
| `RESEND_API_KEY` | No | If set, order receipts / commission notifications / etc. send via [Resend](https://resend.com). If unset, every email is written to an `email_log` table instead of sent — nothing is silently lost, it just doesn't leave the server. |
| `RESEND_FROM_EMAIL` | No | The "from" address for real emails (needs a domain verified in Resend). |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL for `sitemap.xml`, `robots.txt`, and Open Graph tags. Defaults to `http://localhost:3000`. |
| `SQLITE_PATH` | No | Override where the SQLite file lives. Defaults to `./var/app.db`. |

## How to deploy (Vercel)

1. Push this repo to GitHub (already done if you're reading this on the
   branch).
2. Go to [vercel.com/new](https://vercel.com/new), import the repo, and set
   the **Root Directory** to `art-storefront` (the Next.js app lives in a
   subfolder of this repo, not the repo root).
3. Add the environment variables from the table above (`ADMIN_PASSWORD` and
   `SESSION_SECRET` at minimum) in the Vercel project settings.
4. Deploy.

### Read this before you trust the deployed database

**SQLite-on-Vercel does not reliably persist writes.** Vercel's serverless
functions run on an ephemeral, per-invocation filesystem — a piece an admin
adds or an order that gets placed may vanish on the next request, or two
concurrent requests may not see each other's writes, because they can land
on different function instances that don't share a disk. This app was built
against a hard constraint of this environment (see
[Database](#database) below) and the tradeoff was made deliberately, with
sign-off, to get a fully working app without requiring a Postgres account
up front.

**Before you rely on this in production**, swap SQLite for a real hosted
Postgres (Neon, Supabase, or Vercel Postgres all have free tiers). That
means: standing up the database, translating `lib/db/client.ts`'s schema
and `lib/db/*.ts`'s hand-written SQL to your Postgres driver of choice (or
introducing an ORM), and re-running the seed logic once against it. Until
then, treat any Vercel deployment of this app as a **demo**, not a live
store — good for showing someone the UI and flows, not for taking real
orders.

Running it on a single long-lived Node process (a VM, Railway, Fly.io,
Render, a Raspberry Pi under your desk) has none of this problem — SQLite
is completely fine there.

## What's in this app

- **Landing page** — hero, artist teaser, featured work, category tiles,
  commission CTA.
- **Catalog** (`/catalog`) — filter by category, medium, size, price band and
  availability, all driven by the URL query string (shareable/bookmarkable
  filtered views). Queries the database on every request — an admin edit
  shows up immediately, no rebuild needed.
- **Product pages** (`/art/[slug]`) — multi-image gallery with a hover-zoom
  lightbox, a drag-to-rotate angle viewer for sculptures (front/side/back/
  detail), full specs, story copy, certificate-of-authenticity note, and
  correct availability logic (see below).
- **Cart** (`/cart`) — persisted to `localStorage`, quantity controls for
  print editions, locked to qty 1 for one-of-one originals.
- **Checkout** (`/checkout` → `/checkout/confirmation`) — address form, a
  Razorpay-style payment method selector (UPI/card/netbanking), an order
  summary with shipping + estimated GST. Submitting creates a **real**
  `Order` row, decrements **real** inventory, and sends a **real** email
  (or logs one — see env vars) — see [What's not real yet](#whats-not-real-yet)
  for the one thing it doesn't do.
- **Commission requests** (`/commission`) — brief + budget + reference image
  upload (stored as the request's attachments), submitted as an inquiry that
  lands in the admin dashboard, never as an instant purchase.
- **Notify-me / newsletter / shipping-quote requests** — all persisted and
  visible to the studio (admin overview + commissions page), all trigger an
  email hook.
- **Admin dashboard** (`/admin`) — password-protected. Add/edit pieces
  (with image upload), mark sold, manage print editions; view and manage
  orders; review commission inquiries and shipping-quote requests, with
  reference images visible inline.
- **About page** (`/about`) — artist bio/story.
- **SEO** — per-page metadata and Open Graph/Twitter tags, per-artwork
  structured data (schema.org `VisualArtwork`), `sitemap.xml`, `robots.txt`.

### Availability logic (the part that has to be correct)

- **Originals** (paintings, sculptures) have inventory of exactly one. Once
  `status` is `"sold"`, the buy button is replaced by a "Notify me" waitlist
  form and the piece can never be added to a cart. Checkout re-validates
  this server-side against the database — a stale client can't buy a piece
  someone else just bought.
- **Prints** decrement from a fixed edition size (`edition.availableCount`).
  When it hits zero the piece is treated as sold out, same as an original.
- **Commission-only** pieces (`status: "commission"`) never show a buy
  button — only a link into the commission request form.
- **Oversized/fragile sculpture** (`requiresShippingQuote: true`) skips the
  cart entirely and shows a "Request a shipping quote" form instead, per the
  spec (flat-rate shipping doesn't make sense for a 38kg welded-steel piece).

This logic lives in `lib/artwork-rules.ts` (pure, shared by client and
server) and `lib/db/artworks.ts` (the database-backed fetchers/mutations),
and is re-checked server-side in `app/api/orders/route.ts` at checkout time.

## Database

`lib/db/client.ts` uses Node's built-in `node:sqlite` module (`DatabaseSync`,
stable-ish/experimental since Node 22.5) rather than an ORM. This was a
deliberate fallback, not the first choice: **Prisma's engine-binary
postinstall download was blocked by this sandbox's network proxy**
(`ECONNRESET` on every retry, even after the `@prisma/client` package itself
installed fine), and `better-sqlite3`'s native-binary install carried the
same risk. `node:sqlite` needs zero downloads beyond Node itself, so it was
the only option that reliably worked in this environment. The schema and
queries are hand-written SQL in `lib/db/*.ts` — no migration framework, just
`CREATE TABLE IF NOT EXISTS` run at startup, plus a first-run seed from
`data/artworks.json`.

If you swap to Postgres for production (recommended — see the deploy
section above), you're replacing this file plus the query functions in
`lib/db/artworks.ts`, `lib/db/orders.ts`, and `lib/db/inquiries.ts`; nothing
above the data layer needs to change.

## Tech stack (and why)

- **Next.js 16 (App Router) + React 19 + TypeScript** — server-rendered for
  SEO, file-based routing, first-class image handling, Server Actions for
  the admin CRUD forms, deploys to Vercel with near-zero config.
- **`node:sqlite`** for the database — see above for why it's not Prisma.
- **Tailwind CSS v4** — fast to build a bespoke, editorial "gallery" look
  with, without fighting a component library's opinions.
- **Fraunces (serif, display) + Inter (sans, body/UI)** via `next/font` —
  a warm editorial serif for headings against a clean sans for UI chrome,
  matching the "minimal gallery-white" brief.
- **No client state management library** — cart state is a small
  `localStorage`-backed store built on `useSyncExternalStore`; the catalog is
  fetched once client-side via `/api/artworks` and cached in React context
  for the few client components (cart, checkout, commission form) that need
  slug lookups outside a server component.
- **Resend** (optional) for transactional email — order receipts, commission
  notifications, notify-me/shipping-quote alerts. Falls back to a database
  log if no API key is set, so nothing depends on an account existing yet.
- **Razorpay** was the intended payment gateway per the brief (UPI/India
  first) but is **not integrated** — see below.

## Project structure

```
app/                        routes (App Router)
  page.tsx                  landing page
  catalog/                  catalog + filters
  art/[slug]/                product detail page
  cart/                      cart
  checkout/                  checkout + confirmation (real order creation)
  commission/                 commission request form
  about/                      artist story
  admin/                      password-protected dashboard
    login/                    sign-in
    (dashboard)/               pieces / orders / commissions CRUD + overview
  api/                         REST-ish routes the client components call
    artworks/ orders/ commissions/ notify/ newsletter/ shipping-quotes/
components/                  shared UI (ArtCard, ProductGallery, BuyBox, ...)
  admin/                      admin-only UI (LoginForm, ArtworkForm)
lib/
  db/                         node:sqlite client + schema + query functions
  artwork-rules.ts             pure availability logic (client + server safe)
  catalog-context.tsx           client-side catalog cache (fetches /api/artworks)
  cart-context.tsx              localStorage-backed cart store
  auth.ts                       admin session (HMAC-signed cookie)
  email.ts                      sendEmail() — Resend or log fallback
  pricing.ts                    GST/shipping total calculation (shared)
  shipping.ts                   flat-rate shipping tiers by size/zone
data/artworks.json            seed data for a fresh database (single source of truth)
scripts/generate-art-placeholders.mjs   placeholder image generator
public/images/                generated placeholder SVGs (art + site imagery)
var/app.db                    local SQLite database (gitignored)
```

## Decisions & assumptions made for you

Since the brief's "fill these in" fields were left blank, everything below
is a placeholder — **swap it out before this goes live**:

- **Studio/artist name**: "Anaya Rao Studio" / "Anaya Rao" — a stand-in.
  Search-and-replace `lib/site-config.ts`.
- **What's sold**: original paintings (acrylic/oil/mixed media), ceramic +
  welded steel/bronze sculpture, and small hand-numbered print editions.
- **Price range**: ₹18,000–₹2,40,000 across the seed catalog (your stated
  ₹5,000–₹2,50,000 range, roughly).
- **Ships to**: India + select international, with flat-rate tiers for
  small/medium/large and a "request a quote" path for oversized/fragile
  sculpture.
- **Aesthetic**: minimal gallery-white — warm off-white background, a
  terracotta/clay accent color, generous whitespace, serif display type.
  Easy to restyle via the CSS variables in `app/globals.css`.
- **GST rate on checkout**: shown as a flat 12% estimate (`lib/pricing.ts`,
  `GST_RATE`). This is a placeholder — the real HSN/GST treatment of
  original art vs. prints needs sign-off from an accountant.
- **Catalog images**: all product photos are **generated abstract SVG
  placeholders**, not real photography. They're deterministic and
  category-colored so the catalog looks coherent, but replace them with real
  photos before launch. New pieces added via the admin dashboard are stored
  as base64 data URIs in the database (no blob-storage account required for
  this prototype) — swap for a real image host (Vercel Blob, Cloudinary)
  before uploading full-resolution photography, since storing large images
  as base64 text in SQLite doesn't scale.
- **Seed catalog size**: 21 pieces (8 paintings, 7 sculptures, 6 prints) —
  enough to exercise filtering, sold-out states, commission-only states, and
  oversized-shipping states.
- **Admin auth**: a single shared password (`ADMIN_PASSWORD`), no user
  accounts/roles. Fine for a solo-artist studio; revisit if more than one
  person needs access with different permissions.

## What's still needed from you

1. **Real content**: studio name, artist bio, actual catalog (titles,
   prices, dimensions, stories, real photos — several angles per sculpture).
2. **A Razorpay (or Stripe) account** to actually wire up payment — see
   below.
3. **A Postgres provider** (Neon, Supabase, or Vercel Postgres) if/when you
   move off local SQLite for a real deployment.
4. **A Resend account + verified sending domain** if you want real emails
   instead of the local `email_log` fallback.
5. **A decision on the GST/invoicing setup** — flat rate, HSN codes, and
   whether your accountant wants invoices generated in-app or through an
   external accounting tool.
6. **Sign-off on the placeholder brand** (name, tagline, palette) or your
   real ones to swap in.

## What's not real yet

Exactly one thing, by design: **no payment gateway is integrated.**
`app/checkout/page.tsx` shows a Razorpay-style UPI/card/netbanking picker,
and `app/api/orders/route.ts` creates a real order and decrements real
inventory when "Pay" is submitted — it just never calls Razorpay, Stripe, or
any payment processor, and no money moves. Wiring up Razorpay means:

- Creating a Razorpay order server-side before showing the payment step.
- Rendering Razorpay's checkout widget (or redirecting to their hosted page).
- Verifying the payment signature server-side via a webhook before calling
  `createOrder()` — right now `createOrder()` is called directly from the
  request, which is exactly the line that needs to move behind payment
  verification.

Everything else — database, admin dashboard, order/commission/notify/
newsletter persistence, email hooks, inventory logic — is real and working
today, with the SQLite-on-serverless caveat noted in the deploy section
above.
