"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// V2 Lot 11 (11/09) — Agenda/Événements, nouvelle fonctionnalité additive.
// Calqué sur le principe de admin/publications/actions.ts (createArticle/
// saveArticle/publishArticle) — pas de statut "brouillon/publié" ici,
// remplacé par "visible/masqué" (voir la migration).

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "Nouvel événement").trim() || "Nouvel événement";

  const { data, error } = await supabase
    .from("events")
    .insert({
      title,
      type: String(formData.get("type") ?? "Conférence").trim() || "Conférence",
      start_date: new Date().toISOString().slice(0, 10),
      visible: false,
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/admin/evenements");
  redirect(`/admin/evenements/${data.id}`);
}

async function saveEvent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const start_date = String(formData.get("start_date") ?? "");
  if (!id || !title || !start_date) return;

  await supabase
    .from("events")
    .update({
      title,
      type: String(formData.get("type") ?? "Conférence").trim() || "Conférence",
      description: String(formData.get("description") ?? "").trim() || null,
      start_date,
      end_date: String(formData.get("end_date") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      external_url: String(formData.get("external_url") ?? "").trim() || null,
      position: Number(formData.get("position")) || 0,
      visible: formData.get("visible") === "on",
    })
    .eq("id", id);

  revalidatePath(`/admin/evenements/${id}`);
  revalidatePath("/admin/evenements");
  revalidatePath("/");
}

export async function updateEvent(formData: FormData) {
  const id = String(formData.get("id"));
  await saveEvent(formData);
  redirect(`/admin/evenements/${id}?saved=1`);
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/evenements");
  revalidatePath("/");
  redirect("/admin/evenements");
}
