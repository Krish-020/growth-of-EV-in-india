import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";

// ---- Commission requests ----

export interface CommissionAttachmentInput {
  filename: string;
  mimeType: string;
  dataBase64: string;
}

export interface CreateCommissionInput {
  fullName: string;
  email: string;
  phone?: string;
  workType: string;
  brief: string;
  approxSize?: string;
  budgetRange: string;
  pieceSlug?: string;
  attachments: CommissionAttachmentInput[];
}

export interface CommissionRecord {
  id: string;
  referenceId: string;
  createdAt: string;
  fullName: string;
  email: string;
  phone?: string;
  workType: string;
  brief: string;
  approxSize?: string;
  budgetRange: string;
  pieceSlug?: string;
  status: string;
  attachments: { id: string; filename: string; mimeType: string }[];
}

interface CommissionRow {
  id: string;
  reference_id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string | null;
  work_type: string;
  brief: string;
  approx_size: string | null;
  budget_range: string;
  piece_slug: string | null;
  status: string;
}

interface AttachmentRow {
  id: string;
  commission_id: string;
  filename: string;
  mime_type: string;
}

function generateReferenceId(): string {
  return `COM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

function mapCommission(row: CommissionRow, attachments: AttachmentRow[]): CommissionRecord {
  return {
    id: row.id,
    referenceId: row.reference_id,
    createdAt: row.created_at,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? undefined,
    workType: row.work_type,
    brief: row.brief,
    approxSize: row.approx_size ?? undefined,
    budgetRange: row.budget_range,
    pieceSlug: row.piece_slug ?? undefined,
    status: row.status,
    attachments: attachments.map((a) => ({
      id: a.id,
      filename: a.filename,
      mimeType: a.mime_type,
    })),
  };
}

export async function createCommissionRequest(
  input: CreateCommissionInput
): Promise<CommissionRecord> {
  const id = randomUUID();
  const referenceId = generateReferenceId();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO commission_requests (
      id, reference_id, created_at, full_name, email, phone, work_type, brief,
      approx_size, budget_range, piece_slug, status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    referenceId,
    now,
    input.fullName,
    input.email,
    input.phone ?? null,
    input.workType,
    input.brief,
    input.approxSize ?? null,
    input.budgetRange,
    input.pieceSlug ?? null,
    "new"
  );

  const insertAttachment = db.prepare(
    "INSERT INTO commission_attachments (id, commission_id, filename, mime_type, data_base64) VALUES (?,?,?,?,?)"
  );
  for (const file of input.attachments) {
    insertAttachment.run(randomUUID(), id, file.filename, file.mimeType, file.dataBase64);
  }

  const created = await getCommissionById(id);
  if (!created) throw new Error("Failed to load commission after insert");
  return created;
}

export async function getCommissionById(id: string): Promise<CommissionRecord | undefined> {
  const row = db.prepare("SELECT * FROM commission_requests WHERE id = ?").get(id) as
    | CommissionRow
    | undefined;
  if (!row) return undefined;
  const attachments = db
    .prepare("SELECT id, commission_id, filename, mime_type FROM commission_attachments WHERE commission_id = ?")
    .all(id) as unknown as AttachmentRow[];
  return mapCommission(row, attachments);
}

export async function getAllCommissions(): Promise<CommissionRecord[]> {
  const rows = db
    .prepare("SELECT * FROM commission_requests ORDER BY created_at DESC")
    .all() as unknown as CommissionRow[];
  return rows.map((row) => {
    const attachments = db
      .prepare(
        "SELECT id, commission_id, filename, mime_type FROM commission_attachments WHERE commission_id = ?"
      )
      .all(row.id) as unknown as AttachmentRow[];
    return mapCommission(row, attachments);
  });
}

export async function getCommissionAttachment(
  attachmentId: string
): Promise<{ filename: string; mimeType: string; dataBase64: string } | undefined> {
  const row = db
    .prepare("SELECT filename, mime_type, data_base64 FROM commission_attachments WHERE id = ?")
    .get(attachmentId) as
    | { filename: string; mime_type: string; data_base64: string }
    | undefined;
  if (!row) return undefined;
  return { filename: row.filename, mimeType: row.mime_type, dataBase64: row.data_base64 };
}

export async function setCommissionStatus(id: string, status: string): Promise<void> {
  db.prepare("UPDATE commission_requests SET status = ? WHERE id = ?").run(status, id);
}

// ---- Notify-me waitlist ----

export async function createNotifyRequest(email: string, artworkSlug: string): Promise<void> {
  db.prepare(
    "INSERT INTO notify_requests (id, created_at, email, artwork_slug) VALUES (?,?,?,?)"
  ).run(randomUUID(), new Date().toISOString(), email, artworkSlug);
}

export async function getAllNotifyRequests() {
  return db
    .prepare("SELECT * FROM notify_requests ORDER BY created_at DESC")
    .all() as unknown as { id: string; created_at: string; email: string; artwork_slug: string }[];
}

// ---- Newsletter ----

export async function subscribeToNewsletter(email: string): Promise<boolean> {
  try {
    db.prepare(
      "INSERT INTO newsletter_subscribers (id, created_at, email) VALUES (?,?,?)"
    ).run(randomUUID(), new Date().toISOString(), email);
    return true;
  } catch {
    // already subscribed (unique constraint) — treat as success
    return true;
  }
}

export async function getAllNewsletterSubscribers() {
  return db
    .prepare("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC")
    .all() as unknown as { id: string; created_at: string; email: string }[];
}

// ---- Shipping quote requests (oversized/fragile pieces) ----

export interface ShippingQuoteRecord {
  id: string;
  createdAt: string;
  artworkSlug: string;
  email: string;
  destination: string;
  status: string;
}

interface ShippingQuoteRow {
  id: string;
  created_at: string;
  artwork_slug: string;
  email: string;
  destination: string;
  status: string;
}

export async function createShippingQuoteRequest(
  artworkSlug: string,
  email: string,
  destination: string
): Promise<void> {
  db.prepare(
    "INSERT INTO shipping_quote_requests (id, created_at, artwork_slug, email, destination, status) VALUES (?,?,?,?,?,?)"
  ).run(randomUUID(), new Date().toISOString(), artworkSlug, email, destination, "new");
}

export async function getAllShippingQuoteRequests(): Promise<ShippingQuoteRecord[]> {
  const rows = db
    .prepare("SELECT * FROM shipping_quote_requests ORDER BY created_at DESC")
    .all() as unknown as ShippingQuoteRow[];
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    artworkSlug: r.artwork_slug,
    email: r.email,
    destination: r.destination,
    status: r.status,
  }));
}

export async function setShippingQuoteStatus(id: string, status: string): Promise<void> {
  db.prepare("UPDATE shipping_quote_requests SET status = ? WHERE id = ?").run(status, id);
}
