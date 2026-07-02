"use server";

import { revalidatePath } from "next/cache";
import { setOrderStatus } from "@/lib/db/orders";

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  await setOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
