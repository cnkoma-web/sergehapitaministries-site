"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markInvitationHandled(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("invitation_submissions").update({ handled: true }).eq("id", id);
  revalidatePath("/admin/invitations");
  revalidatePath("/admin");
}
