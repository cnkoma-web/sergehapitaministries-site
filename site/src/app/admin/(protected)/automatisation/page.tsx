import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { editorialClock } from "@/lib/content/editorialClock";
import { plainText } from "@/lib/editorial/checks";
import { configuration } from "@/lib/editorial/providers";
import { editorialAction } from "./actions";
import type { EditorialJob } from "@/lib/editorial/types";
export const dynamic = "force-dynamic";
const labels: Record<string,string> = { collected:"Sources collectées",writing:"Rédaction en cours",review:"À relire",blocked:"Corrections nécessaires",approved:"Validé",publishing:"Publication en cours",published:"Publié",failed:"Préparation interrompue" };
const rubrics = {rm:"Rosée Matinale",jc:"Je Confesse",qdlb:"Que dit la Bible ?"};
export default async function EditorialPage({ searchParams }: { searchParams: Promise<{message?:string}> }) {
  const db = await createClient();
  const query = await searchParams;
  const [{data,error},{data:runs}] = await Promise.all([
    db.from("editorial_jobs").select("*").order("article_date",{ascending:false}).order("type").limit(30),
    db.from("editorial_runs").select("*").order("started_at",{ascending:false}).limit(5),
  ]);
  const config = configuration();
  return <div className="editorial-page">
    <style>{".editorial-page{max-width:1000px}.editorial-page section{background:white;border:1px solid #ddd;border-radius:12px;padding:20px;margin:20px 0}.editorial-page textarea,.editorial-page input[type=text],.editorial-page input[type=date]{display:block;width:100%;box-sizing:border-box;padding:10px;margin:6px 0 15px}.editorial-page label{display:block;margin:8px 0}.editorial-page pre{white-space:pre-wrap;overflow-wrap:anywhere}.editorial-page button{padding:10px 16px;margin:8px 8px 8px 0;cursor:pointer}.editorial-page .notice{padding:12px;background:#fff2c7;white-space:pre-wrap}.editorial-page .image{position:relative;aspect-ratio:16/9;margin:16px 0}.editorial-page details{margin:16px 0}.editorial-page summary{cursor:pointer;font-weight:600}.editorial-page .checks label{padding:8px 0}.editorial-page p{line-height:1.6}"} </style>
    <h1>Automatisation éditoriale</h1>
    <p>Collecte quotidienne à 23 h, heure de Paris. Chaque contenu attend ta relecture et ta validation avant publication.</p>
    {query.message && <p role="status" className="notice">{query.message}</p>}
    {error && <p role="alert">{error.message}</p>}
    {(!config.googleEmail || !config.gatewayAuthentication || !config.cronConfigured) && <p className="notice">La configuration de la collecte ou de la rédaction reste à compléter.</p>}
    <form action={editorialAction}><input type="hidden" name="action" value="collect"/><label>Date des sources<input type="date" name="date" defaultValue={editorialClock().targetDate} required/></label><button>Collecter les sources</button></form>
    {(data as EditorialJob[] ?? []).map(job => <section id={job.id} key={job.id}>
      <h2>{rubrics[job.type]} · {job.article_date}</h2><p><strong>{labels[job.status] ?? job.status}</strong>{job.verified_at ? " · Vérifié publiquement" : ""}</p>
      {job.last_error && <p className="notice">{job.last_error}</p>}
      <details><summary>Consulter la source</summary><pre>{job.source}</pre></details>
      {job.draft && <>
        <h3>{job.draft.title}</h3>
        {job.draft.cover_url && <div className="image"><Image src={job.draft.cover_url} alt={job.draft.cover_alt ?? ""} fill sizes="(max-width: 800px) 90vw, 800px" style={{objectFit:"contain"}}/></div>}
        {(job.draft.excerpt || (job.type==="rm" && job.draft.verse_text)) && <p><strong>{job.draft.excerpt || job.draft.verse_text}</strong></p>}
        {job.type!=="rm" && <blockquote>{job.draft.verse_text} <cite>{job.draft.verse_reference}</cite></blockquote>}
        {job.draft.body.split(/<\/p>/i).map((p,i) => <p key={i}>{plainText(p)}</p>)}
        {job.draft.prayer && <p>{job.draft.prayer}</p>}
        {job.draft.further_verses?.map(v => <blockquote key={v.reference}>{v.text} <cite>{v.reference}</cite></blockquote>)}
        {!["published","publishing","writing"].includes(job.status) && <details><summary>Corriger ce brouillon</summary><form action={editorialAction}>
          <input type="hidden" name="id" value={job.id}/><input type="hidden" name="action" value="save"/>
          <label>Titre<input type="text" name="title" defaultValue={job.draft.title} required/></label>
          <label>{job.type==="rm" ? "Chapeau (deux phrases)" : "Verset d’ouverture"}<textarea name="verse_text" defaultValue={job.draft.verse_text ?? ""} rows={3}/></label>
          <label>Référence biblique<input type="text" name="verse_reference" defaultValue={job.draft.verse_reference ?? ""}/></label>
          {job.type==="qdlb" && <label>Chapeau<textarea name="excerpt" defaultValue={job.draft.excerpt ?? ""} rows={3}/></label>}
          <label>Texte (une ligne vide entre les paragraphes)<textarea name="body_text" defaultValue={job.draft.body.split(/<\/p>/i).map(plainText).filter(Boolean).join("\n\n")} rows={16}/></label>
          {job.type==="rm" && <label>Phrase clé à surligner<input type="text" name="highlight" defaultValue={job.draft.body.match(/<mark>([^<]+)<\/mark>/)?.[1] ?? ""}/></label>}
          {job.type==="qdlb" && <><label>Prière<textarea name="prayer" defaultValue={job.draft.prayer ?? ""} rows={3}/></label>{[...(job.draft.further_verses ?? []),{reference:"",text:""}].map((v,i) => <div key={i}><label>Passage complémentaire<input type="text" name="further_reference" defaultValue={v.reference}/></label><label>Texte exact<textarea name="further_text" defaultValue={v.text} rows={3}/></label></div>)}</>}
          <label>Description de l’image<input type="text" name="cover_alt" defaultValue={job.draft.cover_alt ?? ""}/></label>
          <label>Mots-clés (séparés par des virgules)<textarea name="seo_keywords" defaultValue={job.draft.seo_keywords?.join(", ")} rows={3}/></label><button>Enregistrer les corrections</button>
        </form></details>}
      </>}
      {["collected","failed"].includes(job.status) && <form action={editorialAction}><input type="hidden" name="id" value={job.id}/><button name="action" value="prepare">Préparer le contenu</button></form>}
      {job.status==="review" && <form action={editorialAction} className="checks"><input type="hidden" name="id" value={job.id}/><input type="hidden" name="hash" value={job.draft_hash ?? ""}/><input type="hidden" name="action" value="approve"/>
        <label><input type="checkbox" name="source_ok" required/> J’ai relu le texte et vérifié sa fidélité à la source.</label><label><input type="checkbox" name="bible_ok" required/> J’ai vérifié les citations bibliques en Louis Segond et le contenu doctrinal.</label><label><input type="checkbox" name="image_ok" required/> J’ai contrôlé le visuel : plan large, sans portrait ni texte.</label><button>Valider ce contenu</button></form>}
      {job.status==="approved" && <form action={editorialAction}><input type="hidden" name="id" value={job.id}/><button name="action" value="publish">Publier et vérifier</button></form>}
      {job.status==="published" && <><p><a href={job.public_url ?? "#"} target="_blank" rel="noreferrer">Voir la publication</a></p><form action={editorialAction}><input type="hidden" name="id" value={job.id}/><button name="action" value="verify">Vérifier la page publique</button></form></>}
    </section>)}
    <h2>Dernières collectes</h2>{runs?.map(run => <p key={run.id}>{new Date(run.started_at).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})} · {run.target_date} · {run.status==="ok" ? "Collecte effectuée" : "Échec"} · {run.detail}</p>)}
  </div>;
}
