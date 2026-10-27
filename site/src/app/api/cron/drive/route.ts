import { validBearer } from "@/lib/editorial/access";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { syncApprovedDrive } from "@/lib/editorial/driveSync";
export const runtime="nodejs";
export const maxDuration=600;
export async function GET(request:Request) {
  if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:"Unauthorized"},{status:401});
  if(process.env.VERCEL_ENV!=="production")return Response.json({skipped:"preview"});
  try {
    const dryRun=new URL(request.url).searchParams.get("check")==="1";
    const result=await syncApprovedDrive(createServiceRoleClient(),dryRun);
    return Response.json(result,{status:result.success?200:503});
  }catch(error){return Response.json({success:false,error:error instanceof Error?error.message:"Synchronisation interrompue."},{status:503});}
}
