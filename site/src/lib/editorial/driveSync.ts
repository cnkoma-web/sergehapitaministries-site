import "server-only";
import { createHash } from "node:crypto";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { googleReadToken, googleJson, googleResponse, drivePublicationFiles } from "./driveGoogle";
import { readDriveApproval } from "./driveDocument";
import { assertDraftShape, editorialChecks, fingerprint } from "./checks";
import { validatePublicationDraft } from "@/lib/content/publicationValidation";
import { publishThroughCms } from "./native";
import type { EditorialJob, EditorialDraft } from "./types";

const docsUrl=(id:string)=>"https://docs.googleapis.com/v1/documents/"+id+"?includeTabsContent=true";
function validate(draft:EditorialDraft) {
  assertDraftShape(draft);
  // La longueur finale a été expressément validée dans Drive, sans nouvelle rédaction.
  const issues=[...validatePublicationDraft(draft).map(i=>i.message),...editorialChecks(draft)];
  if(issues.length)throw Error(issues.join("\n"));
}
export async function syncApprovedDrive(db:SupabaseClient, dryRun=false) {
  const started=new Date().toISOString(),token=await googleReadToken();
  const {files,driveAvailable}=await drivePublicationFiles(token);
  const outcomes:{document:string;status:string;url?:string;error?:string}[]=[];
  const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  for(const file of files) {
    if(file.name.slice(-10)>today)continue;
    let lease:string|null=null, job:EditorialJob|null=null;
    try {
      const doc=await googleJson(docsUrl(file.id),token);
      const approval=readDriveApproval(doc,file.name);
      if(!approval.approved) {outcomes.push({document:file.name,status:"validation attendue"});continue;}
      validate(approval.draft);
      const found=await db.from("editorial_jobs").select("*").eq("type",approval.draft.type).eq("article_date",approval.draft.article_date).maybeSingle();
      if(found.error)throw found.error;
      job=found.data;
      const actor="drive:"+file.id+":"+approval.hash;
      if(job?.status==="published"&&job.approved_by===actor) {outcomes.push({document:file.name,status:"déjà synchronisé",url:job.public_url??undefined});continue;}
      if(dryRun){outcomes.push({document:file.name,status:"validé, prêt à synchroniser"});continue;}
      const previous=await db.from("articles").select("*").eq("type",approval.draft.type).eq("article_date",approval.draft.article_date).maybeSingle();
      if(previous.error)throw previous.error;
      if(!job) {
        const inserted=await db.from("editorial_jobs").insert({type:approval.draft.type,article_date:approval.draft.article_date,source:"Texte final validé dans Drive : "+file.id,source_hash:fingerprint(file.id),source_revision:String(doc.revisionId??""),article_id:previous.data?.id??null,status:"review"}).select("*").single();
        if(inserted.error)throw inserted.error;job=inserted.data;
      }
      if(!job)throw Error("Travail absent.");
      if(job.status==="writing")throw Error("Préparation déjà en cours.");
      lease=crypto.randomUUID();
      const locked=await db.from("editorial_jobs").update({lease_token:lease,lease_until:new Date(Date.now()+5*60000).toISOString(),status:"publishing"}).eq("id",job.id).eq("status",job.status).or("lease_until.is.null,lease_until.lt."+started).select("id").single();
      if(locked.error)throw Error("Synchronisation concurrente ; reprise au prochain passage.");
      const save=async(values:Record<string,unknown>)=>{const r=await db.from("editorial_jobs").update({...values,updated_at:new Date().toISOString()}).eq("id",job!.id).eq("lease_token",lease).select("id").single();if(r.error)throw r.error;};
      // Le texte est publié avant de tenter le téléchargement de son image.
      const latest=readDriveApproval(await googleJson(docsUrl(file.id),token),file.name);
      if(!latest.approved||latest.hash!==approval.hash)throw Error("Document modifié pendant la synchronisation.");
      let draft={...approval.draft,cover_url:previous.data?.cover_url??null,cover_alt:previous.data?.cover_alt??null};
      let article=await publishThroughCms(db,{...job,draft});
      await save({article_id:article.id});
      revalidatePath(article.path);
      if(approval.asset && driveAvailable) {
        const response=await googleResponse("https://www.googleapis.com/drive/v3/files/"+approval.asset.id+"?alt=media",{headers:{authorization:"Bearer "+token}});
        if(Number(response.headers.get("content-length")??0)>800000)throw Error("Image supérieure à 800 Ko.");
        const reader=response.body?.getReader();if(!reader)throw Error("Image vide.");
        const chunks:Uint8Array[]=[];let size=0;
        for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>800000){await reader.cancel();throw Error("Image supérieure à 800 Ko.");}chunks.push(value);}
        const bytes=Buffer.concat(chunks),hash=createHash("sha256").update(bytes).digest("hex");
        if(hash!==approval.asset.sha256)throw Error("L’image a changé depuis sa validation.");
        const info=await sharp(bytes).metadata();
        if(!["jpeg","png","webp"].includes(info.format??""))throw Error("Format d’image non autorisé.");
        const slug=draft.title.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
        const ext=info.format==="jpeg"?"jpg":info.format;
        const path="editorial/"+draft.article_date+"/"+draft.type+"/"+slug+"-"+hash.slice(0,16)+"."+ext;
        const bucket=db.storage.from("article-covers");
        draft={...approval.draft,cover_url:bucket.getPublicUrl(path).data.publicUrl,cover_alt:approval.draft.cover_alt,image_bytes:bytes.length,image_width:info.width,image_height:info.height};
        validate(draft);
        const uploaded=await bucket.upload(path,bytes,{contentType:"image/"+info.format,upsert:true});
        if(uploaded.error)throw uploaded.error;
        // Relire la version Drive juste avant d'ajouter l'image au texte publié.
        const current=readDriveApproval(await googleJson(docsUrl(file.id),token),file.name);
        if(!current.approved||current.hash!==approval.hash)throw Error("Document modifié pendant la synchronisation.");
        article=await publishThroughCms(db,{...job,article_id:article.id,draft});
      }
      const hash=fingerprint({source_hash:job.source_hash,draft});
      const url="https://sergehapitaministries.org"+article.path;
      const pendingImage=Boolean(approval.asset&&!driveAvailable);
      await save({draft,draft_hash:hash,approved_hash:hash,approved_by:pendingImage?actor+":texte":actor,approved_at:started,article_id:article.id,public_url:url,status:"published",last_error:pendingImage?"Texte publié ; image en attente d’activation de l’API Google Drive.":null,verified_at:null,lease_token:null,lease_until:null});
      for(const p of [article.path,"/","/publications","/rosee-matinale","/publications/que-dit-la-bible","/publications/je-confesse-et-declare","/sitemap.xml"])revalidatePath(p);
      outcomes.push({document:file.name,status:pendingImage?"texte synchronisé ; image en attente API Drive":"synchronisé",url});
    } catch(error) {
      const message=error instanceof Error?error.message:String((error as any)?.message??error);
      if(job&&lease)await db.from("editorial_jobs").update({status:"review",last_error:message,approved_hash:null,approved_by:null,lease_token:null,lease_until:null}).eq("id",job.id).eq("lease_token",lease);
      outcomes.push({document:file.name,status:"erreur",error:message});
    }
  }
  if(!dryRun) {
    const r=await db.from("editorial_runs").insert({started_at:started,target_date:today,status:outcomes.some(o=>o.error)?"failed":"ok",detail:JSON.stringify(outcomes)});
    if(r.error)throw r.error;
  }
  return {success:!outcomes.some(o=>o.error),dryRun,driveAvailable,outcomes};
}
