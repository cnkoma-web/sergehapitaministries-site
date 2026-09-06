"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markInvitationHandled(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  // Corrigé en même temps que markContactRead (retour du 06/09, même bug :
  // permission UPDATE manquante en base — voir migration
  // 20260906010000_admin_todo_flags_update_grant.sql).
  const { error } = await supabase.from("invitation_submissions").update({ handled: true }).eq("id", id);
  if (error) console.error("markInvitationHandled:", error);
  revalidatePath("/admin/invitations");
  revalidatePath("/admin");
}
