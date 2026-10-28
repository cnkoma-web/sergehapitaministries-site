"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function refresh(id?: string) {
  revalidatePath("/admin/invitations");
  revalidatePath("/admin");
  if (id) revalidatePath(`/admin/invitations/${id}`);
}
export async function setInvitationHandled(formData: FormData) {
  const id=String(formData.get("id")??"");
  const handled=String(formData.get("handled"))==="true";
  if(!id) return;
  const supabase=await createClient();
  const {error}=await supabase.from("invitation_submissions").update({handled}).eq("id",id);
  if(error) throw new Error(`Statut impossible à modifier : ${error.message}`);
  await refresh(id);
}
export async function markInvitationHandled(formData: FormData) {
  formData.set("handled","true");
  return setInvitationHandled(formData);
}
export async function deleteInvitation(formData: FormData) {
  const id=String(formData.get("id")??"");
  if(!id) return;
  const supabase=await createClient();
  const {error}=await supabase.from("invitation_submissions").delete().eq("id",id);
  if(error) throw new Error(`Suppression impossible : ${error.message}`);
  await refresh();
  redirect("/admin/invitations");
}
