"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Toute la sécurité repose sur les policies RLS (public.is_admin()) de la table
// ticker_messages — ces actions utilisent le client "serveur" lié à la session
// de l'utilisateur connecté, jamais la service_role key.

export async function addTickerMessage(formData: FormData) {
  const supabase = await createClient();
  const text = String(formData.get("text") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  if (!text) return;

  await supabase.from("ticker_messages").insert({
    text,
    href: href || null,
    position: Number(formData.get("position") ?? 0),
  });

  revalidatePath("/admin/ticker");
  revalidatePath("/", "layout");
}

export async function updateTickerMessage(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const text = String(formData.get("text") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim();
  if (!id || !text) return;

  await supabase
    .from("ticker_messages")
    .update({
      text,
      href: href || null,
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/ticker");
  revalidatePath("/", "layout");
}

export async function deleteTickerMessage(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;

  await supabase.from("ticker_messages").delete().eq("id", id);

  revalidatePath("/admin/ticker");
  revalidatePath("/", "layout");
}
