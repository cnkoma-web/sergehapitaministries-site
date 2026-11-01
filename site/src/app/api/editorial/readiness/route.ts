import {GET as checkReady,POST as replayReady} from "@/app/api/cron/ready/route";
export const runtime="nodejs";
export const maxDuration=600;

/** Diagnostic durable en lecture seule, disponible uniquement dans les previews protégées par Vercel. */
export async function GET(request:Request){
 if(process.env.VERCEL_ENV!=="preview")return Response.json({error:"Not found"},{status:404});
 const date=new URL(request.url).searchParams.get("date");
 if(!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))return Response.json({error:"Date de contrôle requise."},{status:400});
 const secret=process.env.CRON_SECRET;
 if(!secret || secret.length<32)return Response.json({phase:"configuration",success:false},{status:503});
 const target=new URL("/api/cron/ready",request.url);
 target.searchParams.set("check","1");target.searchParams.set("date",date);
 const unauthenticated=await checkReady(new Request(target));
 const invalid=await checkReady(new Request(target,{headers:{authorization:"Bearer "+secret+"-invalid"}}));
 if(unauthenticated.status!==401 || invalid.status!==401)return Response.json({phase:"authentication",success:false},{status:503});
 const replay=await replayReady(new Request(new URL("/api/cron/ready",request.url),{
  method:"POST",headers:{authorization:"Bearer "+secret,"content-type":"application/json"},body:JSON.stringify({action:"replay",date})
 }));
 const blocked=await replay.json();
 if(replay.status!==200 || blocked.skipped!=="preview")return Response.json({phase:"preview-write-protection",success:false},{status:503});
 const response=await checkReady(new Request(target,{headers:{authorization:"Bearer "+secret}}));
 const result=await response.json();
 const outcomes=(result.outcomes??[]).map((item:{document?:string;type?:string;status?:string;bytes?:number;error?:string})=>({
  document:item.document,type:item.type,status:item.status,imageBytes:item.bytes,...(item.error?{error:item.error}:{})
 }));
 const ready=["jc","rm","qdlb"].every(type=>outcomes.some((item:{document?:string;status?:string})=>
  item.document==="Publication-"+type+"-"+date && ["texte final et image prêts","déjà publié, version conservée"].includes(item.status??"")
 ));
 return Response.json({
  success:response.status===200 && result.success===true && result.dryRun===true && result.date===date && ready,
  date,readOnly:true,authenticationVerified:true,previewWritesBlocked:true,publicationExecuted:false,
  phase:response.status===200?"drive-and-cms-read":"drive-and-cms-error",
  outcomes,...(result.error?{error:result.error}:{})
 },{status:response.status===200 && ready?200:503});
}

