import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { allChecks, collectSources, prepareJob, approveJob, publishJob } from "./workflow";
import { archivePublishedDraft } from "./driveArchive";
import { editorialClock } from "@/lib/content/editorialClock";
import type { EditorialJob } from "./types";

// Ordre permanent donné par Serge Hapita le 27/10 : préparation 23 h, publication minuit.
export const AUTOMATIC_PUBLICATION_START="2026-10-28";
export async function automaticPublication(db:SupabaseClient,date:string,dryRun=false) {
  if(date<AUTOMATIC_PUBLICATION_START)throw Error("Date antérieure au démarrage de la publication automatique.");
  const clock=editorialClock();
  if(!dryRun&&date!==clock.today)throw Error("La publication attend la date prévue à Paris.");
  const started=new Date().toISOString();
  const read=async()=>{const r=await db.from("editorial_jobs").select("*").eq("article_date",date).order("type");if(r.error)throw r.error;return r.data as EditorialJob[];};
  let jobs=await read();
  if(!dryRun&&jobs.length!==3){await collectSources(db,date);jobs=await read();}
  if(jobs.length!==3||new Set(jobs.map(j=>j.type)).size!==3)throw Error("Les trois rubriques quotidiennes sont attendues.");
  const outcomes:{type:string;status:string;url?:string;error?:string}[]=[];
  for(let job of jobs){
    try{
      if(dryRun){
        if(!job.draft||!["review","approved","published"].includes(job.status))throw Error("Texte en cours de préparation.");
        const issues=allChecks(job.draft,job.source);if(issues.length)throw Error(issues.join("\n"));
        outcomes.push({type:job.type,status:"prêt pour publication automatique"});continue;
      }
      if(["collected","failed"].includes(job.status))job=await prepareJob(db,job.id);
      if(job.status!=="published"){
        if(!job.draft||!["review","approved"].includes(job.status)||!job.draft_hash)throw Error(job.last_error??"Préparation encore en cours.");
        await approveJob(db,job.id,job.draft_hash,"automation:ordre-permanent-2026-10-27");
        job=await publishJob(db,job.id);
      }
      await archivePublishedDraft(job);
      outcomes.push({type:job.type,status:"publié et archivé dans Drive",url:job.public_url??undefined});
    }catch(error){outcomes.push({type:job.type,status:"reprise automatique au prochain passage",error:error instanceof Error?error.message:String((error as any)?.message??error)});}
  }
  const success=!outcomes.some(o=>o.error);
  if(!dryRun){const r=await db.from("editorial_runs").insert({started_at:started,target_date:date,status:success?"ok":"failed",detail:JSON.stringify({phase:"publication automatique",outcomes})});if(r.error)throw r.error;}
  return {success,date,dryRun,outcomes};
}
