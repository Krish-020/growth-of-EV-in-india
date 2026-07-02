"use server";

import { revalidatePath } from "next/cache";
import { setCommissionStatus, setShippingQuoteStatus } from "@/lib/db/inquiries";

export async function updateCommissionStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await setCommissionStatus(id, status);
  revalidatePath("/admin/commissions");
  revalidatePath(`/admin/commissions/${id}`);
}

export async function updateShippingQuoteStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await setShippingQuoteStatus(id, status);
  revalidatePath("/admin/commissions");
}
