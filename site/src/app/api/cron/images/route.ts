import {validBearer} from '@/lib/editorial/access';
export async function GET(request:Request){
 if(!validBearer(request,process.env.CRON_SECRET))return Response.json({error:'Unauthorized'},{status:401});
 return Response.json({retired:true,mode:'Publication directe des textes et images prêts dans Publiées à 23 h',replacement:'/api/cron/ready'});
}
