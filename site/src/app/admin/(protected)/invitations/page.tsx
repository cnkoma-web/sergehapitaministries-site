import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteInvitation, markInvitationHandled } from "./actions";
import Pagination from "@/components/admin/Pagination";

export default async function AdminInvitationsPage({searchParams}:{searchParams:Promise<{page?:string;perPage?:string}>}) {
  const p=await searchParams; const page=Math.max(1,Number(p.page)||1); const requested=Number(p.perPage); const perPage=[5,7].includes(requested)?requested:5;
  const supabase=await createClient(); const from=(page-1)*perPage;
  const {data:invitations,count}=await supabase.from("invitation_submissions").select("id, prenom, nom, email, telephone, hote, ville, pays, type_invitation, theme, date_debut, date_fin, handled, created_at",{count:"exact"}).order("created_at",{ascending:false}).range(from,from+perPage-1);
  return <><div className="admin-header"><h2>Demandes d&apos;invitation</h2></div><p className="admin-lede">Ouvrez une demande pour consulter tous ses détails. Le statut change uniquement lorsque vous le décidez.</p>
  <div className="items-table">
    <div className="item-row head" style={{gridTemplateColumns:"1fr 1fr 1fr 90px 190px"}}><div>De</div><div>Hôte / lieu</div><div>Événement</div><div>Statut</div><div>Actions</div></div>
    {!invitations?.length&&<div className="item-row" style={{gridTemplateColumns:"1fr"}}><div className="admin-row-empty">Aucune demande pour le moment.</div></div>}
    {invitations?.map(inv=><div className="item-row" key={inv.id} style={{gridTemplateColumns:"1fr 1fr 1fr 90px 190px",background:inv.handled?undefined:"var(--lavender)"}}>
      <div style={{fontSize:13}}><Link href={`/admin/invitations/${inv.id}`}><strong>{inv.prenom} {inv.nom}</strong></Link><span style={{display:"block",fontSize:11.5,color:"var(--ink-soft)"}}>{inv.email} · {inv.telephone}</span></div>
      <div style={{fontSize:12.5}}>{inv.hote}<span style={{display:"block",fontSize:11.5,color:"var(--ink-soft)"}}>{inv.ville}, {inv.pays}</span></div>
      <div style={{fontSize:12.5,color:"var(--ink-soft)"}}>{inv.type_invitation} — {inv.theme}<span style={{display:"block",fontSize:11.5}}>{new Date(inv.date_debut).toLocaleDateString("fr-FR")} → {new Date(inv.date_fin).toLocaleDateString("fr-FR")}</span></div>
      <div><span className={`status-badge ${inv.handled?"masque":"actif"}`}>{inv.handled?"Traitée":"Nouvelle"}</span></div>
      <div className="item-actions"><Link href={`/admin/invitations/${inv.id}`}>Ouvrir</Link>{!inv.handled&&<form action={markInvitationHandled}><input type="hidden" name="id" value={inv.id}/><button>Traiter</button></form>}<form action={deleteInvitation}><input type="hidden" name="id" value={inv.id}/><button className="danger">Suppr.</button></form></div>
    </div>)}
  </div>
  {(count??0)>0&&<Pagination page={page} perPage={perPage} total={count??0} basePath="/admin/invitations" perPageOptions={[5,7]}/>}</>;
}
