import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteContactMessage, markContactRead } from "./actions";
import Pagination from "@/components/admin/Pagination";

export default async function AdminMessagesPage({searchParams}:{searchParams:Promise<{page?:string;perPage?:string}>}) {
  const p=await searchParams; const page=Math.max(1,Number(p.page)||1); const requested=Number(p.perPage); const perPage=[5,7].includes(requested)?requested:5;
  const supabase=await createClient(); const from=(page-1)*perPage;
  const {data:messages,count}=await supabase.from("contact_submissions").select("id, nom, email, sujet, message, read, created_at",{count:"exact"}).order("created_at",{ascending:false}).range(from,from+perPage-1);
  return <><div className="admin-header"><h2>Messages de contact</h2></div><p className="admin-lede">Ouvrez un message pour le lire en entier. Son ouverture le marque comme lu.</p>
  <div className="items-table"><div className="item-row head" style={{gridTemplateColumns:"1fr 130px 1fr 90px 190px"}}><div>De</div><div>Sujet</div><div>Message</div><div>Statut</div><div>Actions</div></div>
  {!messages?.length&&<div className="item-row" style={{gridTemplateColumns:"1fr"}}><div className="admin-row-empty">Aucun message pour le moment.</div></div>}
  {messages?.map(m=><div className="item-row" key={m.id} style={{gridTemplateColumns:"1fr 130px 1fr 90px 190px",background:m.read?undefined:"var(--lavender)"}}>
    <div style={{fontSize:13}}>{m.nom}<span style={{display:"block",fontSize:11.5,color:"var(--ink-soft)"}}>{m.email}</span></div>
    <div style={{fontSize:12.5}}><Link href={`/admin/messages/${m.id}`} style={{color:"inherit",fontWeight:m.read?400:700}}>{m.sujet}</Link></div>
    <div className="admin-message-preview">{m.message}</div>
    <div><span className={`status-badge ${m.read?"masque":"actif"}`}>{m.read?"Lu":"Nouveau"}</span></div>
    <div className="item-actions"><Link href={`/admin/messages/${m.id}`}>Ouvrir</Link>{!m.read&&<form action={markContactRead}><input type="hidden" name="id" value={m.id}/><button>Marquer lu</button></form>}<form action={deleteContactMessage}><input type="hidden" name="id" value={m.id}/><button className="danger">Suppr.</button></form></div>
  </div>)}</div>
  {(count??0)>0&&<Pagination page={page} perPage={perPage} total={count??0} basePath="/admin/messages" perPageOptions={[5,7]}/>}</>;
}
