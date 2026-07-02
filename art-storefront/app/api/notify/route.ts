import { NextResponse } from "next/server";
import { createNotifyRequest } from "@/lib/db/inquiries";

export async function POST(request: Request) {
  let body: { email?: string; artworkSlug?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.email || !body.artworkSlug) {
    return NextResponse.json({ error: "Missing email or artworkSlug" }, { status: 400 });
  }
  await createNotifyRequest(body.email, body.artworkSlug);
  return NextResponse.json({ ok: true }, { status: 201 });
}
