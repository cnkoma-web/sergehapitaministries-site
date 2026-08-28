"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addNavItem(formData: FormData) {
  const supabase = await createClient();
  const label = String(formData.get("label") ?? "").trim();
  if (!label) return;
  const href = String(formData.get("href") ?? "").trim() || null;
  const parentId = String(formData.get("parent_id") ?? "").trim() || null;

  const { count } = await supabase.from("nav_items").select("id", { count: "exact", head: true }).eq("parent_id", parentId);

  await supabase.from("nav_items").insert({ label, href, parent_id: parentId, position: count ?? 0 });

  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}

export async function updateNavItem(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const label = String(formData.get("label") ?? "").trim();
  if (!id || !label) return;

  await supabase
    .from("nav_items")
    .update({
      label,
      href: String(formData.get("href") ?? "").trim() || null,
      position: Number(formData.get("position") ?? 0),
    })
    .eq("id", id);

  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}

export async function deleteNavItem(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  // ON DELETE CASCADE supprime aussi les enfants si c'était un menu déroulant.
  await supabase.from("nav_items").delete().eq("id", id);
  revalidatePath("/admin/navigation");
  revalidatePath("/", "layout");
}
