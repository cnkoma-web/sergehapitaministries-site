import {validBearer} from '@/lib/editorial/access';
import {createServiceRoleClient} from '@/lib/supabase/serviceRole';
import {writeDraft} from '@/lib/editorial/providers';
import {replaceDraft,approveJob,publishJob,verifyJob,allChecks} from '@/lib/editorial/workflow';
import {archivePublishedDraft} from '@/lib/editorial/driveArchive';
import type {EditorialJob} from '@/lib/editorial/types';
export const runtime='nodejs';export const maxDuration=600;
export async function POST(request:Request){
 if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 if(process.env.VERCEL_ENV!=='production')return Response.json({error:'Production requise'},{status:403});
 const {type}=await request.json();if(!['qdlb','rm','jc'].includes(type))return Response.json({error:'Rubrique invalide'},{status:400});
 const db=createServiceRoleClient();const found=await db.from('editorial_jobs').select('*').eq('article_date','2026-10-28').eq('type',type).single();
 if(found.error)return Response.json({error:found.error.message},{status:503});
 const job=found.data as EditorialJob;
 try{
  let current=job;
  if(!job.draft?.editorial_audit){
   const draft=await writeDraft(job,'Reprise expressément demandée par Serge Hapita le 28 octobre. Refaire analyse, traduction fidèle, enrichissement selon modèles avant le 20 octobre et contrôle. Conserver le titre existant.');
   draft.title=job.draft?.title??draft.title;
   // Les images déjà prêtes illustrent les mêmes sources et restent associées à la reprise.
   for(const key of ['cover_url','cover_alt','image_bytes','image_width','image_height','image_drive_file_id','image_source_hash'] as const)(draft as any)[key]=(job.draft as any)?.[key];
   const issues=allChecks(draft,job.source);if(issues.length)throw Error(issues.join('\n'));
   await replaceDraft(db,job.id,draft);
   const refreshed=await db.from('editorial_jobs').select('*').eq('id',job.id).single();if(refreshed.error)throw refreshed.error;current=refreshed.data;
  }
  if(current.status!=='published'){
   await approveJob(db,current.id,current.draft_hash!,'automation:reprise-expresse-2026-10-28');
   current=await publishJob(db,current.id);
  }
  const archive=await archivePublishedDraft(current,true);
  const origin=new URL(request.url).origin;
  if(origin==="http://127.0.0.1:3217"){
   const page=await fetch(origin+new URL(current.public_url!).pathname,{cache:"no-store"});
   if(!page.ok)throw Error("Page locale indisponible après reprise.");
  }else await verifyJob(db,current.id);
  return Response.json({success:true,type,url:current.public_url,archive,audit:current.draft?.editorial_audit});
 }catch(e){return Response.json({success:false,type,error:e instanceof Error?e.message:String(e)},{status:503});}
}
