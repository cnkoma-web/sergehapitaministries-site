import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { illustrate } from "./providers";
import { fingerprint } from "./checks";
import { allChecks } from "./workflow";
import type { EditorialJob } from "./types";
export async function prepareImages(db:SupabaseClient,date:string){
  const result=await db.from("editorial_jobs").select("*").eq("article_date",date).in("status",["review","approved"]).order("type");
  if(result.error)throw result.error;
  const outcomes:{type:string;status:string;bytes?:number;file?:string;error?:string}[]=[];
  for(const job of (result.data??[]) as EditorialJob[]){
    if(!job.draft)continue;
    if(job.draft.cover_url&&job.draft.image_drive_file_id){outcomes.push({type:job.type,status:"image déjà prête",bytes:job.draft.image_bytes,file:job.draft.image_drive_file_id});continue;}
    const lease=crypto.randomUUID(),now=new Date().toISOString();
    const locked=await db.from("editorial_jobs").update({lease_token:lease,lease_until:new Date(Date.now()+6*60000).toISOString()}).eq("id",job.id).eq("draft_hash",job.draft_hash).or("lease_until.is.null,lease_until.lt."+now).select("id").single();
    if(locked.error){outcomes.push({type:job.type,status:"génération déjà en cours"});continue;}
    try{
      const draft=await illustrate(db,job,job.draft);
      const issues=allChecks(draft,job.source);if(issues.length)throw Error(issues.join("\n"));
      const saved=await db.from("editorial_jobs").update({draft,draft_hash:fingerprint({source_hash:job.source_hash,draft}),status:"review",approved_hash:null,approved_by:null,approved_at:null,last_error:null,lease_token:null,lease_until:null}).eq("id",job.id).eq("lease_token",lease).select("id").single();
      if(saved.error)throw saved.error;
      outcomes.push({type:job.type,status:"image générée et enregistrée dans Drive",bytes:draft.image_bytes,file:draft.image_drive_file_id});
    }catch(error){const message=error instanceof Error?error.message:String((error as any)?.message??error);await db.from("editorial_jobs").update({last_error:"Image : "+message,lease_token:null,lease_until:null}).eq("id",job.id).eq("lease_token",lease);outcomes.push({type:job.type,status:"reprise image nécessaire",error:message});}
  }
  return {success:!outcomes.some(o=>o.error),date,outcomes};
}
