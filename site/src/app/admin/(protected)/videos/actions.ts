"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createVideo(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;

  const { count } = await supabase.from("videos").select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("videos")
    .insert({ title, category: "predications", active: true, position: count ?? 0 })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/admin/videos");
  redirect(`/admin/videos/${data.id}`);
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

  revalidatePath(`/admin/videos/${id}`);
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  revalidatePath("/");
  redirect("/admin/videos");
}

export async function deleteVideo(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("videos").delete().eq("id", id);
  revalidatePath("/admin/videos");
  revalidatePath("/videos");
  redirect("/admin/videos");
}
