import { NextResponse } from "next/server";
import { getAllArtworks } from "@/lib/db/artworks";

export async function GET() {
  const artworks = await getAllArtworks();
  return NextResponse.json(artworks);
}
