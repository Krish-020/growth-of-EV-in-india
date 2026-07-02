"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createArtwork,
  updateArtwork,
  addArtworkImage,
  deleteArtworkImage,
  setArtworkStatus,
  type ArtworkInput,
} from "@/lib/db/artworks";
import type { ArtCategory, AvailabilityStatus, ImageView, SizeBucket } from "@/lib/types";

const VIEW_CYCLE: ImageView[] = ["front", "side", "back", "detail"];

async function filesToImages(formData: FormData, title: string) {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const images = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
    images.push({
      src: dataUri,
      view: VIEW_CYCLE[i % VIEW_CYCLE.length],
      alt: `${title}, ${VIEW_CYCLE[i % VIEW_CYCLE.length]} view`,
    });
  }
  return images;
}

function readArtworkInput(formData: FormData): ArtworkInput {
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const isOriginal = formData.get("isOriginal") === "on";
  const editionSize = formData.get("editionSize");
  const editionAvailable = formData.get("editionAvailable");

  return {
    title: String(formData.get("title") ?? "").trim(),
    category: String(formData.get("category")) as ArtCategory,
    medium: String(formData.get("medium") ?? "").trim(),
    year: Number(formData.get("year")),
    height: Number(formData.get("height")),
    width: Number(formData.get("width")),
    depth: formData.get("depth") ? Number(formData.get("depth")) : undefined,
    weightKg: Number(formData.get("weightKg")),
    isOriginal,
    price: Number(formData.get("price")),
    priceNote: (formData.get("priceNote") as string) || undefined,
    status: String(formData.get("status")) as AvailabilityStatus,
    requiresShippingQuote: formData.get("requiresShippingQuote") === "on",
    featured: formData.get("featured") === "on",
    sizeBucket: String(formData.get("sizeBucket")) as SizeBucket,
    story: String(formData.get("story") ?? "").trim(),
    tags,
    printOf: (formData.get("printOf") as string) || undefined,
    editionSize: !isOriginal && editionSize ? Number(editionSize) : undefined,
    editionAvailable: !isOriginal && editionAvailable ? Number(editionAvailable) : undefined,
  };
}

export async function saveArtworkAction(formData: FormData): Promise<void> {
  const input = readArtworkInput(formData);
  const id = formData.get("id") as string | null;
  const images = await filesToImages(formData, input.title);

  if (id) {
    await updateArtwork(id, input);
    for (const image of images) {
      await addArtworkImage(id, image);
    }
    revalidatePath("/admin/pieces");
    revalidatePath(`/admin/pieces/${id}`);
    redirect(`/admin/pieces/${id}`);
  } else {
    const created = await createArtwork(input, images);
    revalidatePath("/admin/pieces");
    redirect(`/admin/pieces/${created.id}`);
  }
}

export async function deleteImageAction(formData: FormData): Promise<void> {
  const imageId = String(formData.get("imageId"));
  const artworkId = String(formData.get("artworkId"));
  await deleteArtworkImage(imageId);
  revalidatePath(`/admin/pieces/${artworkId}`);
}

export async function toggleSoldAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const nextStatus = String(formData.get("nextStatus")) as AvailabilityStatus;
  await setArtworkStatus(id, nextStatus);
  revalidatePath("/admin/pieces");
  revalidatePath(`/admin/pieces/${id}`);
}
