import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteInvitation, setInvitationHandled } from "../actions";

export default async function InvitationDetail({params}:{params:Promise<{id:string}>}) {
 const {id}=await params; const supabase=await createClient();
 const {data:i}=await supabase.from("invitation_submissions").select("*").eq("id",id).maybeSingle();
 if(!i) notFound();
 return <><div className="admin-header"><h2>Demande d&apos;invitation</h2><span className={`status-badge ${i.handled?"masque":"actif"}`}>{i.handled?"Traitée":"Nouvelle"}</span></div>
 <p className="admin-lede"><Link href="/admin/invitations">← Retour à la liste</Link></p>
 <div className="admin-card admin-detail-card">
  <h3>{i.prenom} {i.nom}</h3>
  <dl className="admin-detail-list">
   <div><dt>Reçue le</dt><dd>{new Date(i.created_at).toLocaleString("fr-FR")}</dd></div>
   <div><dt>E-mail</dt><dd><a href={`mailto:${i.email}`}>{i.email}</a></dd></div>
   <div><dt>Téléphone</dt><dd><a href={`tel:${i.telephone}`}>{i.telephone}</a></dd></div>
   <div><dt>Hôte</dt><dd>{i.hote}</dd></div><div><dt>Lieu</dt><dd>{i.ville}, {i.pays}</dd></div>
   <div><dt>Type</dt><dd>{i.type_invitation}</dd></div><div><dt>Thème</dt><dd>{i.theme||"Non précisé"}</dd></div>
   <div><dt>Dates souhaitées</dt><dd>{new Date(i.date_debut).toLocaleDateString("fr-FR")} → {new Date(i.date_fin).toLocaleDateString("fr-FR")}</dd></div>
   {i.message&&<div><dt>Message</dt><dd style={{whiteSpace:"pre-wrap"}}>{i.message}</dd></div>}
  </dl>
  <div className="admin-detail-actions">
   <form action={setInvitationHandled}><input type="hidden" name="id" value={i.id}/><input type="hidden" name="handled" value={i.handled?"false":"true"}/><button className="admin-btn-primary">{i.handled?"Marquer non traitée":"Marquer traitée"}</button></form>
   <form action={deleteInvitation}><input type="hidden" name="id" value={i.id}/><button className="btn-danger">Supprimer</button></form>
  </div>
 </div></>;
}
