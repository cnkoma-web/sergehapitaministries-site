import {validBearer} from '@/lib/editorial/access';
import {createServiceRoleClient} from '@/lib/supabase/serviceRole';
import {readyWindow} from '@/lib/editorial/readyDocument';
import {readyInvocation} from '@/lib/editorial/readyReplay';
import {publishReadyDrive} from '@/lib/editorial/readyPublication';
export const runtime='nodejs';export const maxDuration=600;
async function handle(request:Request){
 // Le secret existant reste obligatoire pour la planification comme pour la reprise.
 if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 let invocation;
 try{
  const body=request.method==='POST'?await request.json():undefined;
  invocation=readyInvocation({method:request.method,url:request.url,body,clock:readyWindow()});
 }catch(e){return Response.json({error:e instanceof Error?e.message:String(e)},{status:400});}
 // Une preview peut tester les accès réels en lecture seule. Aucune publication n'y est autorisée.
 if(process.env.VERCEL_ENV!=='production'&&invocation?.mode!=='check')return Response.json({skipped:'preview'});
 if(!invocation)return Response.json({skipped:'publication-directe-23h-Paris-a-partir-du-28-octobre-2026'});
 try{
  const r=await publishReadyDrive(createServiceRoleClient(),invocation.date,invocation.mode==='check');
  return Response.json(r,{status:r.success?200:503});
 }catch(e){return Response.json({success:false,error:e instanceof Error?e.message:String(e)},{status:503});}
}
export const GET=handle;
export const POST=handle;

