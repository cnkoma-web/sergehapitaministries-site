"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addVideo(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  if (!title || !["predications", "enseignements", "temoignages"].includes(category)) return;

  await supabase.from("videos").insert({
    title,
    category,
    description: String(formData.get("description") ?? "").trim() || null,
    youtube_url: String(formData.get("youtube_url") ?? "").trim() || null,
    position: Number(formData.get("position") ?? 0),
  });

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}

export async function updateVideo(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  await supabase
    .from("videos")
    .update({
      title,
      category: String(formData.get("category") ?? "predications"),
      description: String(formData.get("description") ?? "").trim() || null,
      youtube_url: String(formData.get("youtube_url") ?? "").trim() || null,
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}

export async function deleteVideo(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("videos").delete().eq("id", id);
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
}
