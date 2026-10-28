import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deleteContactMessage } from "../actions";

export default async function AdminMessageDetailPage({params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const supabase=await createClient();
 const {data:message}=await supabase.from("contact_submissions").select("id, nom, email, sujet, message, read, created_at").eq("id",id).maybeSingle();
 if(!message) notFound();
 if(!message.read){const {error}=await supabase.from("contact_submissions").update({read:true}).eq("id",id);if(error)console.error(error);revalidatePath("/admin/messages");revalidatePath("/admin");}
 return <><div className="admin-header"><h2>Message de contact</h2><form action={deleteContactMessage}><input type="hidden" name="id" value={message.id}/><button className="btn-danger">Supprimer</button></form></div>
 <p className="admin-lede"><Link href="/admin/messages">← Retour à la liste</Link></p>
 <div className="admin-card admin-detail-card"><div style={{display:"flex",justifyContent:"space-between",gap:16,alignItems:"flex-start",marginBottom:18}}><div><h3>{message.sujet}</h3><div>{message.nom} · <a href={`mailto:${message.email}`}>{message.email}</a></div></div><span className="status-badge actif">Lu</span></div>
 <div style={{fontSize:12,color:"var(--ink-soft)",marginBottom:18}}>Reçu le {new Date(message.created_at).toLocaleString("fr-FR")}</div>
 <div style={{fontSize:14.5,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{message.message}</div></div></>;
}
