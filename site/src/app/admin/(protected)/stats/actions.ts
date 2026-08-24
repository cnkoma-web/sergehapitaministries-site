"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addStat(formData: FormData) {
  const supabase = await createClient();
  const key = String(formData.get("key") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  if (!key || !label) return;

  await supabase.from("stat_definitions").insert({
    key,
    label,
    calc_type: String(formData.get("calc_type") ?? "manual"),
    manual_value: String(formData.get("manual_value") ?? "").trim() || null,
    position: Number(formData.get("position") ?? 0),
  });

  revalidatePath("/admin/stats");
  revalidatePath("/", "layout");
}

export async function updateStat(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const label = String(formData.get("label") ?? "").trim();
  if (!id || !label) return;

  await supabase
    .from("stat_definitions")
    .update({
      label,
      calc_type: String(formData.get("calc_type") ?? "manual"),
      manual_value: String(formData.get("manual_value") ?? "").trim() || null,
      position: Number(formData.get("position") ?? 0),
      active: formData.get("active") === "on",
    })
    .eq("id", id);

  revalidatePath("/admin/stats");
  revalidatePath("/", "layout");
}

export async function deleteStat(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;

  await supabase.from("stat_definitions").delete().eq("id", id);

  revalidatePath("/admin/stats");
  revalidatePath("/", "layout");
}
