import { validBearer } from "@/lib/editorial/access";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { editorialClock } from "@/lib/content/editorialClock";
import { prepareImages } from "@/lib/editorial/prepareImages";
export const runtime="nodejs";export const maxDuration=600;
export async function GET(request:Request){
 if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:"Unauthorized"},{status:401});
 if(process.env.VERCEL_ENV!=="production")return Response.json({skipped:"preview"});
 const clock=editorialClock();if(!clock.collectionDue)return Response.json({skipped:"outside-paris-23h"});
 try{const result=await prepareImages(createServiceRoleClient(),clock.targetDate);return Response.json(result,{status:result.success?200:503});}
 catch(error){return Response.json({success:false,error:error instanceof Error?error.message:"Images interrompues."},{status:503});}
}
