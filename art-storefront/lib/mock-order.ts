import { useSyncExternalStore } from "react";

export interface OrderLineSnapshot {
  slug: string;
  title: string;
  medium: string;
  image: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
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

export interface MockOrder {
  id: string;
  createdAt: string;
  lines: OrderLineSnapshot[];
  address: ShippingAddress;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  gst: number;
  total: number;
}

const STORAGE_KEY = "art-storefront-last-order-v1";

export function saveMockOrder(order: MockOrder) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

export function readMockOrder(): MockOrder | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockOrder) : null;
  } catch {
    return null;
  }
}

export function generateOrderId(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `AR-${new Date().getFullYear()}-${random}`;
}

function subscribeNoop() {
  return () => {};
}

function getServerOrderSnapshot(): MockOrder | null {
  return null;
}

// useSyncExternalStore requires getSnapshot to return a stable (===) value
// when nothing has changed, but sessionStorage + JSON.parse would otherwise
// produce a new object on every call. Cache against the raw string so repeat
// calls between real writes return the same reference.
let cachedRaw: string | null | undefined;
let cachedOrder: MockOrder | null = null;

function getCachedMockOrder(): MockOrder | null {
  let raw: string | null;
  try {
    raw = window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedOrder = raw ? (JSON.parse(raw) as MockOrder) : null;
    } catch {
      cachedOrder = null;
    }
  }
  return cachedOrder;
}

/** Reads the last mock order from sessionStorage without a manual effect. */
export function useMockOrder(): MockOrder | null {
  return useSyncExternalStore(
    subscribeNoop,
    getCachedMockOrder,
    getServerOrderSnapshot
  );
}
