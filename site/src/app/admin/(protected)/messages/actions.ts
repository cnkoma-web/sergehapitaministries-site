"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function markContactRead(formData: FormData) {
  const id=String(formData.get("id")??"");
  if(!id) return;
  const supabase=await createClient();
  const {error}=await supabase.from("contact_submissions").update({read:true}).eq("id",id);
  if(error) throw new Error(`Lecture impossible à enregistrer : ${error.message}`);
  revalidatePath("/admin/messages"); revalidatePath("/admin"); revalidatePath(`/admin/messages/${id}`);
}
export async function deleteContactMessage(formData: FormData) {
  const id=String(formData.get("id")??"");
  if(!id) return;
  const supabase=await createClient();
  const {error}=await supabase.from("contact_submissions").delete().eq("id",id);
  if(error) throw new Error(`Suppression impossible : ${error.message}`);
  revalidatePath("/admin/messages"); revalidatePath("/admin");
  redirect("/admin/messages");
}
