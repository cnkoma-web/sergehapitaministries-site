"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markContactRead(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
  revalidatePath("/admin/messages");
  revalidatePath("/admin");
}
