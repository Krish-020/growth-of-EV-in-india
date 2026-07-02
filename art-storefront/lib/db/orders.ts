import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db/client";
import { decrementInventory } from "@/lib/db/artworks";

export interface OrderLineInput {
  artworkId: string;
  title: string;
  medium: string;
  image: string;
  price: number;
  quantity: number;
}

export interface OrderAddressInput {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  gstin?: string;
}

export interface CreateOrderInput {
  address: OrderAddressInput;
  paymentMethod: string;
  lines: OrderLineInput[];
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  createdAt: string;
  address: OrderAddressInput;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
  status: string;
  lines: (OrderLineInput & { id: string })[];
}

function generateOrderNumber(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AR-${new Date().getFullYear()}-${random}`;
}

interface OrderRow {
  id: string;
  order_number: string;
  created_at: string;
  full_name: string;
  email: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  gstin: string | null;
  payment_method: string;
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
  status: string;
}

interface OrderLineRow {
  id: string;
  order_id: string;
  artwork_id: string | null;
  title_snapshot: string;
  medium_snapshot: string;
  image_snapshot: string;
  price_snapshot: number;
  quantity: number;
}

function mapOrder(row: OrderRow, lineRows: OrderLineRow[]): OrderRecord {
  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    address: {
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      addressLine1: row.address_line1,
      addressLine2: row.address_line2 ?? undefined,
      city: row.city,
      state: row.state,
      postalCode: row.postal_code,
      country: row.country,
      gstin: row.gstin ?? undefined,
    },
    paymentMethod: row.payment_method,
    subtotal: row.subtotal,
    shipping: row.shipping,
    gst: row.gst,
    total: row.total,
    status: row.status,
    lines: lineRows.map((l) => ({
      id: l.id,
      artworkId: l.artwork_id ?? "",
      title: l.title_snapshot,
      medium: l.medium_snapshot,
      image: l.image_snapshot,
      price: l.price_snapshot,
      quantity: l.quantity,
    })),
  };
}

/**
 * Creates an order and decrements inventory for each line. This is
 * explicitly where a real payment gateway charge would be verified before
 * committing — Phase 1/2 here intentionally skips that step (see README);
 * nothing here talks to Razorpay/Stripe.
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderRecord> {
  const id = randomUUID();
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  db.prepare(
    `INSERT INTO orders (
      id, order_number, created_at, full_name, email, phone, address_line1,
      address_line2, city, state, postal_code, country, gstin, payment_method,
      subtotal, shipping, gst, total, status
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    orderNumber,
    now,
    input.address.fullName,
    input.address.email,
    input.address.phone,
    input.address.addressLine1,
    input.address.addressLine2 ?? null,
    input.address.city,
    input.address.state,
    input.address.postalCode,
    input.address.country,
    input.address.gstin ?? null,
    input.paymentMethod,
    input.subtotal,
    input.shipping,
    input.gst,
    input.total,
    "paid"
  );

  const insertLine = db.prepare(
    `INSERT INTO order_lines (
      id, order_id, artwork_id, title_snapshot, medium_snapshot, image_snapshot,
      price_snapshot, quantity
    ) VALUES (?,?,?,?,?,?,?,?)`
  );

  for (const line of input.lines) {
    insertLine.run(
      randomUUID(),
      id,
      line.artworkId,
      line.title,
      line.medium,
      line.image,
      line.price,
      line.quantity
    );
    await decrementInventory(line.artworkId, line.quantity);
  }

  const created = await getOrderById(id);
  if (!created) throw new Error("Failed to load order after insert");
  return created;
}

export async function getOrderById(id: string): Promise<OrderRecord | undefined> {
  const row = db.prepare("SELECT * FROM orders WHERE id = ?").get(id) as
    | OrderRow
    | undefined;
  if (!row) return undefined;
  const lines = db
    .prepare("SELECT * FROM order_lines WHERE order_id = ?")
    .all(id) as unknown as OrderLineRow[];
  return mapOrder(row, lines);
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  const rows = db
    .prepare("SELECT * FROM orders ORDER BY created_at DESC")
    .all() as unknown as OrderRow[];
  return rows.map((row) => {
    const lines = db
      .prepare("SELECT * FROM order_lines WHERE order_id = ?")
      .all(row.id) as unknown as OrderLineRow[];
    return mapOrder(row, lines);
  });
}

export async function setOrderStatus(id: string, status: string): Promise<void> {
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
}
