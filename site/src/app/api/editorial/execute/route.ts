import {createServiceRoleClient} from "@/lib/supabase/serviceRole";
import {executeEditorialCommand} from "@/lib/editorial/commands";
export const runtime="nodejs";
export const maxDuration=600;
export async function GET(request:Request){
 const headers={"cache-control":"no-store, private","referrer-policy":"no-referrer","x-robots-tag":"noindex, nofollow"};
 if(request.method!=="GET")return Response.json({error:"Méthode non autorisée."},{status:405,headers});
 if(process.env.VERCEL_ENV!=="production")return Response.json({error:"Not found"},{status:404,headers});
 // Le jeton secret temporaire est contrôlé par le serveur avant toute publication. Cet accès ne crée jamais de commande.
 const parameters=new URL(request.url).searchParams,id=parameters.get("id")??"",authorization=parameters.get("authorization")??"";
 if(!/^[0-9a-f]{64}$/.test(authorization))return Response.json({error:"Authentification requise."},{status:401,headers});
 try{
  const result=await executeEditorialCommand(createServiceRoleClient(),id,authorization);
  return Response.json(result.body,{status:result.status,headers});
 }catch(error){return Response.json({success:false,error:error instanceof Error?error.message:"Commande CMS impossible."},{status:500,headers});}
}

