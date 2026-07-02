import { NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/lib/db/inquiries";

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  await subscribeToNewsletter(body.email);
  return NextResponse.json({ ok: true }, { status: 201 });
}
