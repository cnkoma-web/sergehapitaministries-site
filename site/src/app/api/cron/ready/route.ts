import {validBearer} from '@/lib/editorial/access';
import {createServiceRoleClient} from '@/lib/supabase/serviceRole';
import {readyWindow} from '@/lib/editorial/readyDocument';
import {publishReadyDrive} from '@/lib/editorial/readyPublication';
export const runtime='nodejs';export const maxDuration=600;
export async function GET(request:Request){
 if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 if(process.env.VERCEL_ENV!=='production')return Response.json({skipped:'preview'});
 const clock=readyWindow(),url=new URL(request.url),dryRun=url.searchParams.get('check')==='1';
 if(!dryRun&&!clock.due)return Response.json({skipped:'publication-directe-23h-Paris-a-partir-du-29-octobre-2026'});
 const date=dryRun?(url.searchParams.get('date')??clock.date):clock.date;
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return Response.json({error:'Date invalide'},{status:400});
 try{const r=await publishReadyDrive(createServiceRoleClient(),date,dryRun);return Response.json(r,{status:r.success?200:503});}catch(e){return Response.json({success:false,error:e instanceof Error?e.message:String(e)},{status:503});}
}
