import { validBearer } from "@/lib/editorial/access";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { editorialClock } from "@/lib/content/editorialClock";
import { automaticPublication } from "@/lib/editorial/automaticPublication";
import { publicationWindow } from "@/lib/editorial/publicationWindow";
export const runtime="nodejs";
export const maxDuration=600;
export async function GET(request:Request){
  if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:"Unauthorized"},{status:401});
  if(process.env.VERCEL_ENV!=="production")return Response.json({skipped:"preview"});
  const clock=editorialClock(),url=new URL(request.url),dryRun=url.searchParams.get("check")==="1";
  if(!dryRun&&!publicationWindow().due)return Response.json({skipped:"publication-at-paris-midnight"});
  const date=dryRun?clock.targetDate:clock.today;
  try{const result=await automaticPublication(createServiceRoleClient(),date,dryRun);return Response.json(result,{status:result.success?200:503});}
  catch(error){return Response.json({success:false,error:error instanceof Error?error.message:"Publication interrompue."},{status:503});}
}
