"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleShipped(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const shipped = String(formData.get("shipped")) === "true";
  if (!id) return;
  await supabase.from("orders").update({ shipped: !shipped }).eq("id", id);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
}
