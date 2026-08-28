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

function parseList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function createGoodie(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await supabase.from("goodies").select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("goodies")
    .insert({
      title,
      slug: slugify(title) || crypto.randomUUID(),
      status: "coming_soon",
      active: true,
      position: count ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/admin/boutique");
  redirect(`/admin/boutique/${data.id}`);
}

export async function updateGoodie(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  const priceRaw = String(formData.get("price") ?? "").replace(",", ".").trim();

  await supabase
    .from("goodies")
    .update({
      title,
      price_cents: priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      sizes: parseList(formData.get("sizes")),
      colors: parseList(formData.get("colors")),
      material: String(formData.get("material") ?? "").trim() || null,
      cut: String(formData.get("cut") ?? "").trim() || null,
      care: String(formData.get("care") ?? "").trim() || null,
      fabrication: String(formData.get("fabrication") ?? "").trim() || null,
      shipping_delay: String(formData.get("shipping_delay") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      status: String(formData.get("status") ?? "coming_soon"),
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath(`/admin/boutique/${id}`);
  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
  redirect("/admin/boutique");
}

export async function deleteGoodie(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("goodies").delete().eq("id", id);
  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
  redirect("/admin/boutique");
}
