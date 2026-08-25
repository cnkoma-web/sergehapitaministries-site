"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { computeReadingTime } from "@/lib/readingTime";

export async function publishRosee(formData: FormData) {
  const supabase = await createClient();
  const articleDate = String(formData.get("article_date") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!articleDate) return;

  await supabase.from("articles").insert({
    type: "rm",
    slug: `rm-${articleDate}`,
    title: `Rosée Matinale — ${articleDate}`,
    article_date: articleDate,
    verse_text: String(formData.get("verse_text") ?? "").trim() || null,
    body: body || null,
    status: "published",
    reading_time_minutes: body ? computeReadingTime(body) : null,
  });

  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/rosee-matinale");
}

export async function updateRosee(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const body = String(formData.get("body") ?? "").trim();
  if (!id) return;

  await supabase
    .from("articles")
    .update({
      verse_text: String(formData.get("verse_text") ?? "").trim() || null,
      body: body || null,
      status: String(formData.get("status") ?? "published"),
      reading_time_minutes: body ? computeReadingTime(body) : null,
    })
    .eq("id", id);

  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/rosee-matinale");
}

export async function deleteRosee(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/rosee-matinale");
}
