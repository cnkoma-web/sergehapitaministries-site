"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { findOrCreateCategory, type Category } from "@/lib/content/categories";

/** Appelée directement depuis le picker de catégories d'un article (client) —
 * pas un <form>, un appel de fonction serveur classique. */
export async function createCategoryFromPicker(name: string): Promise<Category | null> {
  const category = await findOrCreateCategory(name);
  if (category) revalidatePath("/admin/categories");
  return category;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function addCategory(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("categories").insert({ name, slug: slugify(name) || crypto.randomUUID() });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/publications");
}

export async function renameCategory(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  if (!id || !name) return;
  await supabase.from("categories").update({ name, slug: slugify(name) || undefined }).eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}

export async function deleteCategory(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}
