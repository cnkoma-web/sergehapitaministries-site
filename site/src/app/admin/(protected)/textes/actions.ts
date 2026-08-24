"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function upsertText(formData: FormData) {
  const supabase = await createClient();
  const key = String(formData.get("key") ?? "").trim();
  const value = String(formData.get("value") ?? "").trim();
  if (!key) return;

  await supabase.from("interface_texts").upsert({ key, value }, { onConflict: "key" });

  revalidatePath("/admin/textes");
  revalidatePath("/", "layout");
}

export async function deleteText(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;

  await supabase.from("interface_texts").delete().eq("id", id);

  revalidatePath("/admin/textes");
  revalidatePath("/", "layout");
}
