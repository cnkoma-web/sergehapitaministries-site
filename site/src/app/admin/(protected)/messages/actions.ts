"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markContactRead(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  const { error } = await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
  // Ne devrait plus jamais se produire depuis que la permission UPDATE existe
  // (voir migration 20260906010000) — journalisé au cas où, jamais avalé
  // silencieusement comme avant (retour du 06/09).
  if (error) console.error("markContactRead:", error);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
