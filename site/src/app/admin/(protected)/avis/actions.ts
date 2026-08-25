"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function moderateReview(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!id || !["approved", "rejected", "pending"].includes(status)) return;

  await supabase.from("reviews").update({ status }).eq("id", id);

  revalidatePath("/admin/avis");
  revalidatePath("/livres");
  revalidatePath("/boutique");
}

export async function deleteReview(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("reviews").delete().eq("id", id);
  revalidatePath("/admin/avis");
}
