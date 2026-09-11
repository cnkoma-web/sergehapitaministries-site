"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// V2 Lot 9 (11/09) — Podcast, nouvelle fonctionnalité additive. Ausha n'est
// pas encore souscrit (confirmé le 11/09) : ces actions saisissent les
// épisodes à la main (audio_url = lien direct fourni par Ausha une fois
// l'épisode publié là-bas). Aucune synchronisation RSS/API ici — voir le
// commentaire en tête de la migration 20260911030000_podcast_episodes.sql.

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parseUniverse(raw: FormDataEntryValue | null): "qdlb" | "vs" | "rm" | "jc" {
  const v = String(raw ?? "qdlb");
  return v === "vs" || v === "rm" || v === "jc" ? v : "qdlb";
}

export async function createPodcastEpisode(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "Nouvel épisode").trim() || "Nouvel épisode";

  const { data, error } = await supabase
    .from("podcast_episodes")
    .insert({
      title,
      slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 7),
      universe: parseUniverse(formData.get("universe")),
      episode_date: new Date().toISOString().slice(0, 10),
      audio_url: "",
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/admin/podcast");
  redirect(`/admin/podcast/${data.id}`);
}

async function saveEpisode(formData: FormData, status?: "draft" | "published") {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  const audio_url = String(formData.get("audio_url") ?? "").trim();
  if (!id || !title) return;

  const update: Record<string, unknown> = {
    title,
    universe: parseUniverse(formData.get("universe")),
    theme: String(formData.get("theme") ?? "").trim() || null,
    episode_date: String(formData.get("episode_date") ?? "") || undefined,
    audio_url,
    duration_seconds: Number(formData.get("duration_seconds")) || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    share_image_url: String(formData.get("share_image_url") ?? "").trim() || null,
    linked_article_id: String(formData.get("linked_article_id") ?? "").trim() || null,
    position: Number(formData.get("position")) || 0,
  };

  if (status) update.status = status;

  await supabase.from("podcast_episodes").update(update).eq("id", id);

  revalidatePath(`/admin/podcast/${id}`);
  revalidatePath("/admin/podcast");
  revalidatePath("/podcast");
  revalidatePath("/");
}

export async function updatePodcastEpisode(formData: FormData) {
  const id = String(formData.get("id"));
  await saveEpisode(formData);
  redirect(`/admin/podcast/${id}?saved=1`);
}

export async function publishPodcastEpisode(formData: FormData) {
  const id = String(formData.get("id"));
  const wasAlreadyPublished = String(formData.get("was_published")) === "1";
  await saveEpisode(formData, "published");
  if (wasAlreadyPublished) redirect(`/admin/podcast/${id}?saved=1`);
  redirect("/admin/podcast");
}

export async function unpublishPodcastEpisode(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("podcast_episodes").update({ status: "draft" }).eq("id", id);
  revalidatePath("/admin/podcast");
  revalidatePath("/podcast");
}

export async function deletePodcastEpisode(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("podcast_episodes").delete().eq("id", id);
  revalidatePath("/admin/podcast");
  revalidatePath("/podcast");
  revalidatePath("/");
  redirect("/admin/podcast");
}
