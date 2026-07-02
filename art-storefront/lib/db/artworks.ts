import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";
import type {
  Artwork,
  ArtCategory,
  AvailabilityStatus,
  ImageView,
  SizeBucket,
} from "@/lib/types";

interface ArtworkRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  medium: string;
  year: number;
  height: number;
  width: number;
  depth: number | null;
  weight_kg: number;
  is_original: number;
  price: number;
  price_note: string | null;
  currency: string;
  status: string;
  requires_shipping_quote: number;
  featured: number;
  size_bucket: string;
  story: string;
  tags: string;
  created_at: string;
  print_of_slug: string | null;
  edition_size: number | null;
  edition_available: number | null;
}

interface ArtworkImageRow {
  id: string;
  artwork_id: string;
  src: string;
  view: string;
  alt: string;
  position: number;
}

function mapImages(rows: ArtworkImageRow[]) {
  return rows
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      src: img.src,
      view: img.view as ImageView,
      alt: img.alt,
    }));
}

function mapArtwork(row: ArtworkRow, imageRows: ArtworkImageRow[]): Artwork {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as ArtCategory,
    medium: row.medium,
    year: row.year,
    dimensions: {
      height: row.height,
      width: row.width,
      depth: row.depth ?? undefined,
      unit: "cm",
    },
    weightKg: row.weight_kg,
    isOriginal: Boolean(row.is_original),
    price: row.price,
    priceNote: row.price_note ?? undefined,
    currency: row.currency as "INR",
    status: row.status as AvailabilityStatus,
    requiresShippingQuote: Boolean(row.requires_shipping_quote),
    featured: Boolean(row.featured),
    sizeBucket: row.size_bucket as SizeBucket,
    story: row.story,
    tags: JSON.parse(row.tags || "[]"),
    createdAt: row.created_at,
    images: mapImages(imageRows),
    printOf: row.print_of_slug ?? undefined,
    edition:
      row.edition_size != null && row.edition_available != null
        ? { size: row.edition_size, availableCount: row.edition_available }
        : undefined,
  };
}

function imagesForArtworkIds(artworkIds: string[]): Map<string, ArtworkImageRow[]> {
  const map = new Map<string, ArtworkImageRow[]>();
  if (artworkIds.length === 0) return map;
  const placeholders = artworkIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT * FROM artwork_images WHERE artwork_id IN (${placeholders}) ORDER BY position`
    )
    .all(...artworkIds) as unknown as ArtworkImageRow[];
  for (const row of rows) {
    const list = map.get(row.artwork_id) ?? [];
    list.push(row);
    map.set(row.artwork_id, list);
  }
  return map;
}

function mapRows(rows: ArtworkRow[]): Artwork[] {
  const imageMap = imagesForArtworkIds(rows.map((r) => r.id));
  return rows.map((row) => mapArtwork(row, imageMap.get(row.id) ?? []));
}

export async function getAllArtworks(): Promise<Artwork[]> {
  const rows = db
    .prepare("SELECT * FROM artworks ORDER BY created_at DESC")
    .all() as unknown as ArtworkRow[];
  return mapRows(rows);
}

export async function getArtworkBySlug(slug: string): Promise<Artwork | undefined> {
  const row = db.prepare("SELECT * FROM artworks WHERE slug = ?").get(slug) as
    | ArtworkRow
    | undefined;
  if (!row) return undefined;
  const images = db
    .prepare("SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY position")
    .all(row.id) as unknown as ArtworkImageRow[];
  return mapArtwork(row, images);
}

export async function getArtworkById(id: string): Promise<Artwork | undefined> {
  const row = db.prepare("SELECT * FROM artworks WHERE id = ?").get(id) as
    | ArtworkRow
    | undefined;
  if (!row) return undefined;
  const images = db
    .prepare("SELECT * FROM artwork_images WHERE artwork_id = ? ORDER BY position")
    .all(row.id) as unknown as ArtworkImageRow[];
  return mapArtwork(row, images);
}

export async function getArtworksBySlugs(slugs: string[]): Promise<Artwork[]> {
  if (slugs.length === 0) return [];
  const placeholders = slugs.map(() => "?").join(",");
  const rows = db
    .prepare(`SELECT * FROM artworks WHERE slug IN (${placeholders})`)
    .all(...slugs) as unknown as ArtworkRow[];
  return mapRows(rows);
}

export async function getFeaturedArtworks(limit = 4): Promise<Artwork[]> {
  const rows = db
    .prepare("SELECT * FROM artworks WHERE featured = 1 ORDER BY created_at DESC LIMIT ?")
    .all(limit) as unknown as ArtworkRow[];
  return mapRows(rows);
}

export async function getPrintsOf(slug: string): Promise<Artwork[]> {
  const rows = db
    .prepare("SELECT * FROM artworks WHERE print_of_slug = ?")
    .all(slug) as unknown as ArtworkRow[];
  return mapRows(rows);
}

export async function getOriginalFor(artwork: Artwork): Promise<Artwork | undefined> {
  if (!artwork.printOf) return undefined;
  return getArtworkBySlug(artwork.printOf);
}

export async function getRelatedArtworks(artwork: Artwork, limit = 4): Promise<Artwork[]> {
  const all = await getAllArtworks();
  return all
    .filter(
      (a) =>
        a.slug !== artwork.slug &&
        a.printOf !== artwork.slug &&
        a.slug !== artwork.printOf &&
        (a.category === artwork.category || a.tags.some((t) => artwork.tags.includes(t)))
    )
    .slice(0, limit);
}

export interface CatalogFilters {
  category?: ArtCategory;
  medium?: string;
  size?: SizeBucket;
  minPrice?: number;
  maxPrice?: number;
  availability?: AvailabilityStatus;
}

export async function filterArtworks(filters: CatalogFilters): Promise<Artwork[]> {
  const clauses: string[] = [];
  const params: (string | number)[] = [];

  if (filters.category) {
    clauses.push("category = ?");
    params.push(filters.category);
  }
  if (filters.medium) {
    clauses.push("medium = ?");
    params.push(filters.medium);
  }
  if (filters.size) {
    clauses.push("size_bucket = ?");
    params.push(filters.size);
  }
  if (filters.availability) {
    clauses.push("status = ?");
    params.push(filters.availability);
  }
  if (filters.minPrice !== undefined) {
    clauses.push("price >= ?");
    params.push(filters.minPrice);
  }
  if (filters.maxPrice !== undefined) {
    clauses.push("price <= ?");
    params.push(filters.maxPrice);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = db
    .prepare(`SELECT * FROM artworks ${where} ORDER BY created_at DESC`)
    .all(...params) as unknown as ArtworkRow[];
  return mapRows(rows);
}

export async function getFilterOptions() {
  const mediumRows = db
    .prepare("SELECT DISTINCT medium FROM artworks ORDER BY medium")
    .all() as unknown as { medium: string }[];
  const priceRow = db
    .prepare("SELECT MIN(price) as minPrice, MAX(price) as maxPrice FROM artworks")
    .get() as { minPrice: number; maxPrice: number };
  return {
    mediums: mediumRows.map((r) => r.medium),
    minPrice: priceRow.minPrice,
    maxPrice: priceRow.maxPrice,
  };
}

// ---- Admin mutations ----

export interface ArtworkInput {
  title: string;
  category: ArtCategory;
  medium: string;
  year: number;
  height: number;
  width: number;
  depth?: number;
  weightKg: number;
  isOriginal: boolean;
  price: number;
  priceNote?: string;
  status: AvailabilityStatus;
  requiresShippingQuote: boolean;
  featured: boolean;
  sizeBucket: SizeBucket;
  story: string;
  tags: string[];
  printOf?: string;
  editionSize?: number;
  editionAvailable?: number;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueSlug(base: string): string {
  let slug = base || randomUUID().slice(0, 8);
  let n = 2;
  while (db.prepare("SELECT 1 FROM artworks WHERE slug = ?").get(slug)) {
    slug = `${base}-${n}`;
    n++;
  }
  return slug;
}

export async function createArtwork(
  input: ArtworkInput,
  images: { src: string; view: ImageView; alt: string }[]
): Promise<Artwork> {
  const id = randomUUID();
  const slug = uniqueSlug(slugify(input.title));
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO artworks (
      id, slug, title, category, medium, year, height, width, depth, weight_kg,
      is_original, price, price_note, currency, status, requires_shipping_quote,
      featured, size_bucket, story, tags, created_at, print_of_slug,
      edition_size, edition_available
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    slug,
    input.title,
    input.category,
    input.medium,
    input.year,
    input.height,
    input.width,
    input.depth ?? null,
    input.weightKg,
    input.isOriginal ? 1 : 0,
    input.price,
    input.priceNote ?? null,
    "INR",
    input.status,
    input.requiresShippingQuote ? 1 : 0,
    input.featured ? 1 : 0,
    input.sizeBucket,
    input.story,
    JSON.stringify(input.tags),
    now,
    input.printOf ?? null,
    input.editionSize ?? null,
    input.editionAvailable ?? null
  );

  images.forEach((img, i) => {
    db.prepare(
      "INSERT INTO artwork_images (id, artwork_id, src, view, alt, position) VALUES (?,?,?,?,?,?)"
    ).run(randomUUID(), id, img.src, img.view, img.alt, i);
  });

  const created = await getArtworkById(id);
  if (!created) throw new Error("Failed to load artwork after insert");
  return created;
}

export async function updateArtwork(
  id: string,
  input: ArtworkInput
): Promise<Artwork | undefined> {
  db.prepare(
    `UPDATE artworks SET
      title = ?, category = ?, medium = ?, year = ?, height = ?, width = ?, depth = ?,
      weight_kg = ?, is_original = ?, price = ?, price_note = ?, status = ?,
      requires_shipping_quote = ?, featured = ?, size_bucket = ?, story = ?, tags = ?,
      print_of_slug = ?, edition_size = ?, edition_available = ?
    WHERE id = ?`
  ).run(
    input.title,
    input.category,
    input.medium,
    input.year,
    input.height,
    input.width,
    input.depth ?? null,
    input.weightKg,
    input.isOriginal ? 1 : 0,
    input.price,
    input.priceNote ?? null,
    input.status,
    input.requiresShippingQuote ? 1 : 0,
    input.featured ? 1 : 0,
    input.sizeBucket,
    input.story,
    JSON.stringify(input.tags),
    input.printOf ?? null,
    input.editionSize ?? null,
    input.editionAvailable ?? null,
    id
  );
  return getArtworkById(id);
}

export async function getArtworkImagesWithIds(
  artworkId: string
): Promise<{ id: string; src: string; view: ImageView; alt: string }[]> {
  const rows = db
    .prepare("SELECT id, src, view, alt FROM artwork_images WHERE artwork_id = ? ORDER BY position")
    .all(artworkId) as unknown as { id: string; src: string; view: string; alt: string }[];
  return rows.map((r) => ({ ...r, view: r.view as ImageView }));
}

export async function addArtworkImage(
  artworkId: string,
  image: { src: string; view: ImageView; alt: string }
): Promise<void> {
  const maxPos = db
    .prepare("SELECT MAX(position) as maxPos FROM artwork_images WHERE artwork_id = ?")
    .get(artworkId) as { maxPos: number | null };
  db.prepare(
    "INSERT INTO artwork_images (id, artwork_id, src, view, alt, position) VALUES (?,?,?,?,?,?)"
  ).run(
    randomUUID(),
    artworkId,
    image.src,
    image.view,
    image.alt,
    (maxPos.maxPos ?? -1) + 1
  );
}

export async function deleteArtworkImage(imageId: string): Promise<void> {
  db.prepare("DELETE FROM artwork_images WHERE id = ?").run(imageId);
}

export async function setArtworkStatus(
  id: string,
  status: AvailabilityStatus
): Promise<void> {
  db.prepare("UPDATE artworks SET status = ? WHERE id = ?").run(status, id);
}

/**
 * Applies the effect of a completed (mock) purchase: decrements an edition's
 * remaining count, or marks a one-of-one original as sold. Flips status to
 * "sold" once an edition hits zero. Runs inside the same DB connection as
 * the rest of the app (SQLite transactions are effectively single-writer).
 */
export async function decrementInventory(artworkId: string, quantity: number): Promise<void> {
  const row = db.prepare("SELECT * FROM artworks WHERE id = ?").get(artworkId) as
    | ArtworkRow
    | undefined;
  if (!row) return;

  if (row.edition_available != null) {
    const nextAvailable = Math.max(0, row.edition_available - quantity);
    const nextStatus = nextAvailable === 0 ? "sold" : row.status;
    db.prepare(
      "UPDATE artworks SET edition_available = ?, status = ? WHERE id = ?"
    ).run(nextAvailable, nextStatus, artworkId);
  } else {
    db.prepare("UPDATE artworks SET status = 'sold' WHERE id = ?").run(artworkId);
  }
}
