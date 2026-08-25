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

function parseList(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function addGoodie(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const priceRaw = String(formData.get("price") ?? "").replace(",", ".").trim();

  await supabase.from("goodies").insert({
    title,
    slug: slugify(title),
    price_cents: priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null,
    status: String(formData.get("status") ?? "coming_soon"),
    position: Number(formData.get("position") ?? 0),
  });

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
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
      status: String(formData.get("status") ?? "coming_soon"),
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}

export async function deleteGoodie(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("goodies").delete().eq("id", id);
  revalidatePath("/admin/boutique");
  revalidatePath("/boutique");
}
