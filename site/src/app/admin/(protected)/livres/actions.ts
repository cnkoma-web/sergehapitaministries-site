"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function addBook(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const priceRaw = String(formData.get("price") ?? "").replace(",", ".").trim();
  const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;

  await supabase.from("books").insert({
    title,
    slug: slugify(title),
    badge: String(formData.get("badge") ?? "").trim() || null,
    price_cents,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    format: String(formData.get("format") ?? "").trim() || null,
    pages: formData.get("pages") ? Number(formData.get("pages")) : null,
    isbn: String(formData.get("isbn") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    position: Number(formData.get("position") ?? 0),
  });

  revalidatePath("/admin/livres");
  revalidatePath("/livres");
}

export async function updateBook(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  const priceRaw = String(formData.get("price") ?? "").replace(",", ".").trim();
  const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;

  await supabase
    .from("books")
    .update({
      title,
      badge: String(formData.get("badge") ?? "").trim() || null,
      price_cents,
      cover_url: String(formData.get("cover_url") ?? "").trim() || null,
      format: String(formData.get("format") ?? "").trim() || null,
      pages: formData.get("pages") ? Number(formData.get("pages")) : null,
      isbn: String(formData.get("isbn") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/livres");
  revalidatePath("/livres");
}

export async function deleteBook(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("books").delete().eq("id", id);
  revalidatePath("/admin/livres");
  revalidatePath("/livres");
}
