"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Le statut "précommande" reste un simple champ, sans position d'affichage
 * séparée (cahier §6.4 : corrige une proposition précédente qui compliquait
 * les choses). "active" (booléen historique) reste synchronisé pour ne rien
 * casser côté requêtes qui l'utilisent encore ailleurs. */
async function syncBookCover(bookId: string) {
  const supabase = await createClient();
  const { data: firstImage } = await supabase
    .from("book_images")
    .select("url")
    .eq("book_id", bookId)
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  await supabase.from("books").update({ cover_url: firstImage?.url ?? null }).eq("id", bookId);
}

export async function createBook(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await supabase.from("books").select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("books")
    .insert({
      title,
      slug: slugify(title) || crypto.randomUUID(),
      status: "active",
      active: true,
      position: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/admin/livres");
  redirect(`/admin/livres/${data.id}`);
}

export async function updateBook(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  const priceRaw = String(formData.get("price") ?? "").replace(",", ".").trim();
  const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;
  const status = String(formData.get("status") ?? "active");

  await supabase
    .from("books")
    .update({
      title,
      badge: String(formData.get("badge") ?? "").trim() || null,
      price_cents,
      format: String(formData.get("format") ?? "").trim() || null,
      pages: formData.get("pages") ? Number(formData.get("pages")) : null,
      isbn: String(formData.get("isbn") ?? "").trim() || null,
      language: String(formData.get("language") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      status: ["active", "precommande", "hidden"].includes(status) ? status : "active",
      active: status !== "hidden",
      position: Number(formData.get("position") ?? 0),
    })
    .eq("id", id);

  revalidatePath(`/admin/livres/${id}`);
  revalidatePath("/admin/livres");
  revalidatePath("/livres");
  revalidatePath("/");
  redirect("/admin/livres");
}

export async function addBookImage(formData: FormData): Promise<{ id: string; url: string; position: number } | null> {
  const supabase = await createClient();
  const bookId = String(formData.get("book_id"));
  const url = String(formData.get("url") ?? "").trim();
  if (!bookId || !url) return null;

  const { count } = await supabase
    .from("book_images")
    .select("id", { count: "exact", head: true })
    .eq("book_id", bookId);

  const { data, error } = await supabase
    .from("book_images")
    .insert({ book_id: bookId, url, position: count ?? 0 })
    .select("id, url, position")
    .single();
  if (error || !data) return null;

  await syncBookCover(bookId);

  revalidatePath(`/admin/livres/${bookId}`);
  revalidatePath("/livres");
  revalidatePath("/");
  return data;
}

export async function removeBookImage(formData: FormData) {
  const supabase = await createClient();
  const imageId = String(formData.get("image_id"));
  const bookId = String(formData.get("book_id"));
  if (!imageId || !bookId) return;

  await supabase.from("book_images").delete().eq("id", imageId);

  // Renumérote les positions restantes pour rester continu (0, 1, 2...).
  const { data: remaining } = await supabase
    .from("book_images")
    .select("id")
    .eq("book_id", bookId)
    .order("position", { ascending: true });
  if (remaining) {
    await Promise.all(remaining.map((img, i) => supabase.from("book_images").update({ position: i }).eq("id", img.id)));
  }
  await syncBookCover(bookId);

  revalidatePath(`/admin/livres/${bookId}`);
  revalidatePath("/livres");
  revalidatePath("/");
}

export async function reorderBookImages(formData: FormData) {
  const supabase = await createClient();
  const bookId = String(formData.get("book_id"));
  const orderedIds = String(formData.get("ordered_ids") ?? "").split(",").filter(Boolean);
  if (!bookId || orderedIds.length === 0) return;

  await Promise.all(orderedIds.map((imgId, i) => supabase.from("book_images").update({ position: i }).eq("id", imgId)));
  await syncBookCover(bookId);

  revalidatePath(`/admin/livres/${bookId}`);
  revalidatePath("/livres");
  revalidatePath("/");
}

export async function deleteBook(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("books").delete().eq("id", id);
  revalidatePath("/admin/livres");
  revalidatePath("/livres");
  redirect("/admin/livres");
}
