import { NextResponse } from "next/server";
import { createShippingQuoteRequest } from "@/lib/db/inquiries";
import { getArtworkBySlug } from "@/lib/db/artworks";
import { sendEmail } from "@/lib/email";
import { siteConfig } from "@/lib/site-config";

export async function POST(request: Request) {
  let body: { artworkSlug?: string; email?: string; destination?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.artworkSlug || !body.email || !body.destination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const artwork = await getArtworkBySlug(body.artworkSlug);
  await createShippingQuoteRequest(body.artworkSlug, body.email, body.destination);

  await sendEmail({
    to: siteConfig.email,
    subject: `Shipping quote requested: ${artwork?.title ?? body.artworkSlug}`,
    body: `${body.email} requested a shipping quote for "${artwork?.title ?? body.artworkSlug}" to ${body.destination}.`,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
