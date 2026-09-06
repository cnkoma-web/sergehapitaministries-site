"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleShipped(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const shipped = String(formData.get("shipped")) === "true";
  if (!id) return;
  // Corrigé en même temps que markContactRead (retour du 06/09, même bug :
  // permission UPDATE manquante en base — voir migration
  // 20260906010000_admin_todo_flags_update_grant.sql).
  const { error } = await supabase.from("orders").update({ shipped: !shipped }).eq("id", id);
  if (error) console.error("toggleShipped:", error);
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
}
