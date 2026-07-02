import { NextResponse } from "next/server";
import { getArtworksBySlugs } from "@/lib/db/artworks";
import { createOrder, type OrderAddressInput } from "@/lib/db/orders";
import { isPurchasable } from "@/lib/artwork-rules";
import { computeOrderTotals, zoneForCountry } from "@/lib/pricing";
import { sendEmail } from "@/lib/email";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

interface CartLineRequest {
  slug: string;
  quantity: number;
}

interface CreateOrderRequest {
  address: OrderAddressInput;
  paymentMethod: string;
  lines: CartLineRequest[];
}

const REQUIRED_ADDRESS_FIELDS: (keyof OrderAddressInput)[] = [
  "fullName",
  "email",
  "phone",
  "addressLine1",
  "city",
  "state",
  "postalCode",
  "country",
];

export async function POST(request: Request) {
  let body: CreateOrderRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.lines?.length) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  for (const field of REQUIRED_ADDRESS_FIELDS) {
    if (!body.address?.[field]) {
      return NextResponse.json({ error: `Missing address field: ${field}` }, { status: 400 });
    }
  }
  if (!body.paymentMethod) {
    return NextResponse.json({ error: "Missing payment method" }, { status: 400 });
  }

  const slugs = body.lines.map((l) => l.slug);
  const artworks = await getArtworksBySlugs(slugs);
  const artworkBySlug = new Map(artworks.map((a) => [a.slug, a]));

  // Re-validate stock/price against the database — never trust client-sent
  // prices or availability. This is also where a real payment gateway
  // charge would be verified server-side before committing; that step is
  // intentionally skipped here (no Razorpay/Stripe call is made).
  const pricedLines = [];
  for (const line of body.lines) {
    const artwork = artworkBySlug.get(line.slug);
    if (!artwork) {
      return NextResponse.json({ error: `Unknown piece: ${line.slug}` }, { status: 400 });
    }
    if (!isPurchasable(artwork)) {
      return NextResponse.json(
        { error: `"${artwork.title}" is no longer available.` },
        { status: 409 }
      );
    }
    if (artwork.requiresShippingQuote) {
      return NextResponse.json(
        { error: `"${artwork.title}" requires a shipping quote and can't be checked out directly.` },
        { status: 409 }
      );
    }
    const maxQuantity = artwork.edition ? artwork.edition.availableCount : 1;
    if (line.quantity < 1 || line.quantity > maxQuantity) {
      return NextResponse.json(
        { error: `Only ${maxQuantity} of "${artwork.title}" available.` },
        { status: 409 }
      );
    }
    pricedLines.push({ artwork, quantity: line.quantity });
  }

  const zone = zoneForCountry(body.address.country);
  const totals = computeOrderTotals(pricedLines, zone);

  const order = await createOrder({
    address: body.address,
    paymentMethod: body.paymentMethod,
    lines: pricedLines.map(({ artwork, quantity }) => ({
      artworkId: artwork.id,
      title: artwork.title,
      medium: artwork.medium,
      image: artwork.images[0]?.src ?? "",
      price: artwork.price,
      quantity,
    })),
    ...totals,
  });

  const lineSummary = order.lines
    .map((l) => `${l.title} x${l.quantity} — ${formatPrice(l.price * l.quantity)}`)
    .join("\n");
  await sendEmail({
    to: order.address.email,
    subject: `Order ${order.orderNumber} confirmed — ${siteConfig.name}`,
    body: `Thank you for your order.\n\n${lineSummary}\n\nSubtotal: ${formatPrice(
      order.subtotal
    )}\nShipping: ${formatPrice(order.shipping)}\nGST: ${formatPrice(
      order.gst
    )}\nTotal: ${formatPrice(order.total)}\n\nShipping to:\n${order.address.fullName}\n${
      order.address.addressLine1
    }\n${order.address.city}, ${order.address.state} ${order.address.postalCode}\n${
      order.address.country
    }`,
  });

  return NextResponse.json(order, { status: 201 });
}
