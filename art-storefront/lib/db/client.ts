import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import path from "node:path";

// Node's built-in SQLite driver — no native binary download required, which
// matters because this environment's proxy blocks Prisma's engine-binary
// fetch. Good enough for local dev / a single-instance deploy; swap for a
// hosted Postgres before relying on this in a real serverless deployment
// (see README: serverless filesystems don't persist writes reliably).
const DB_DIR = path.join(process.cwd(), "var");
const DB_PATH = process.env.SQLITE_PATH ?? path.join(DB_DIR, "app.db");

if (!existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true });

declare global {
  var __artStorefrontDb: DatabaseSync | undefined;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  medium TEXT NOT NULL,
  year INTEGER NOT NULL,
  height REAL NOT NULL,
  width REAL NOT NULL,
  depth REAL,
  weight_kg REAL NOT NULL,
  is_original INTEGER NOT NULL,
  price INTEGER NOT NULL,
  price_note TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL,
  requires_shipping_quote INTEGER NOT NULL DEFAULT 0,
  featured INTEGER NOT NULL DEFAULT 0,
  size_bucket TEXT NOT NULL,
  story TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  print_of_slug TEXT,
  edition_size INTEGER,
  edition_available INTEGER
);

CREATE TABLE IF NOT EXISTS artwork_images (
  id TEXT PRIMARY KEY,
  artwork_id TEXT NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  src TEXT NOT NULL,
  view TEXT NOT NULL,
  alt TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_artwork_images_artwork_id ON artwork_images(artwork_id);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  gstin TEXT,
  payment_method TEXT NOT NULL,
  subtotal INTEGER NOT NULL,
  shipping INTEGER NOT NULL,
  gst INTEGER NOT NULL,
  total INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid'
);

CREATE TABLE IF NOT EXISTS order_lines (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  artwork_id TEXT REFERENCES artworks(id),
  title_snapshot TEXT NOT NULL,
  medium_snapshot TEXT NOT NULL,
  image_snapshot TEXT NOT NULL,
  price_snapshot INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_lines_order_id ON order_lines(order_id);

CREATE TABLE IF NOT EXISTS commission_requests (
  id TEXT PRIMARY KEY,
  reference_id TEXT UNIQUE NOT NULL,
  created_at TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  work_type TEXT NOT NULL,
  brief TEXT NOT NULL,
  approx_size TEXT,
  budget_range TEXT NOT NULL,
  piece_slug TEXT,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS commission_attachments (
  id TEXT PRIMARY KEY,
  commission_id TEXT NOT NULL REFERENCES commission_requests(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  data_base64 TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_commission_attachments_commission_id ON commission_attachments(commission_id);

CREATE TABLE IF NOT EXISTS notify_requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  email TEXT NOT NULL,
  artwork_slug TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS shipping_quote_requests (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  artwork_slug TEXT NOT NULL,
  email TEXT NOT NULL,
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS email_log (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  sent INTEGER NOT NULL DEFAULT 0
);
`;

interface SeedArtwork {
  slug: string;
  title: string;
  category: string;
  medium: string;
  year: number;
  dimensions: { height: number; width: number; depth?: number; unit: string };
  weightKg: number;
  isOriginal: boolean;
  price: number;
  priceNote?: string;
  currency?: string;
  status: string;
  requiresShippingQuote: boolean;
  featured: boolean;
  sizeBucket: string;
  story: string;
  tags: string[];
  createdAt: string;
  images: { src: string; view: string; alt: string }[];
  printOf?: string;
  edition?: { size: number; availableCount: number };
}

// First-run only: loads the starter catalog from data/artworks.json into an
// otherwise-empty database, so `npm run dev` works out of the box on a
// fresh clone without a separate migration/seed step. Next's build spins up
// several worker processes that each open this same file concurrently, so
// the empty-check + insert runs inside BEGIN IMMEDIATE (paired with the
// busy_timeout pragma in openDb) to avoid two workers seeding at once.
function seedIfEmpty(database: DatabaseSync) {
  database.exec("BEGIN IMMEDIATE");
  try {
    const { count } = database.prepare("SELECT COUNT(*) as count FROM artworks").get() as {
      count: number;
    };
    if (count > 0) {
      database.exec("COMMIT");
      return;
    }

    const dataPath = path.join(process.cwd(), "data", "artworks.json");
    if (!existsSync(dataPath)) {
      database.exec("COMMIT");
      return;
    }

    const seedArtworks = JSON.parse(readFileSync(dataPath, "utf8")) as SeedArtwork[];
    insertSeedArtworks(database, seedArtworks);
    database.exec("COMMIT");
  } catch (err) {
    database.exec("ROLLBACK");
    throw err;
  }
}

function insertSeedArtworks(database: DatabaseSync, seedArtworks: SeedArtwork[]) {
  const insertArtwork = database.prepare(
    `INSERT INTO artworks (
      id, slug, title, category, medium, year, height, width, depth, weight_kg,
      is_original, price, price_note, currency, status, requires_shipping_quote,
      featured, size_bucket, story, tags, created_at, print_of_slug,
      edition_size, edition_available
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  );
  const insertImage = database.prepare(
    "INSERT INTO artwork_images (id, artwork_id, src, view, alt, position) VALUES (?,?,?,?,?,?)"
  );

  for (const a of seedArtworks) {
    const id = randomUUID();
    insertArtwork.run(
      id,
      a.slug,
      a.title,
      a.category,
      a.medium,
      a.year,
      a.dimensions.height,
      a.dimensions.width,
      a.dimensions.depth ?? null,
      a.weightKg,
      a.isOriginal ? 1 : 0,
      a.price,
      a.priceNote ?? null,
      a.currency ?? "INR",
      a.status,
      a.requiresShippingQuote ? 1 : 0,
      a.featured ? 1 : 0,
      a.sizeBucket,
      a.story,
      JSON.stringify(a.tags ?? []),
      a.createdAt,
      a.printOf ?? null,
      a.edition?.size ?? null,
      a.edition?.availableCount ?? null
    );
    a.images.forEach((img, i) => {
      insertImage.run(randomUUID(), id, img.src, img.view, img.alt, i);
    });
  }
}

function openDb(): DatabaseSync {
  const database = new DatabaseSync(DB_PATH);
  // Next's build spawns several worker processes that each open this file
  // concurrently; busy_timeout makes them wait for each other's writes
  // instead of throwing "database is locked".
  database.exec("PRAGMA busy_timeout = 5000;");
  database.exec("PRAGMA journal_mode = WAL;");
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(SCHEMA_SQL);
  seedIfEmpty(database);
  return database;
}

// Cache across Next.js dev-server hot reloads so we don't reopen the file
// (and re-run schema creation) on every module reload.
export const db = globalThis.__artStorefrontDb ?? openDb();
if (process.env.NODE_ENV !== "production") {
  globalThis.__artStorefrontDb = db;
}
