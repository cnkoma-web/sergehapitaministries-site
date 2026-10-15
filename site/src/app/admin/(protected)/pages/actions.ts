"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPageDefinition } from "@/lib/content/pageContent";

export async function savePageContent(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const definition = getPageDefinition(slug);
  if (!definition) return;

  const supabase = await createClient();
  const rows = definition.fields.map((field) => ({
    key: `page.${slug}.${field.key}`,
    value: String(formData.get(field.key) ?? "").trim(),
  }));
  const { error } = await supabase.from("interface_texts").upsert(rows, { onConflict: "key" });
  if (error) redirect(`/admin/pages/${slug}?error=save`);

  revalidatePath(definition.publicPath);
  revalidatePath("/admin/pages");
  revalidatePath(`/admin/pages/${slug}`);
  redirect(`/admin/pages/${slug}?saved=1`);
}
