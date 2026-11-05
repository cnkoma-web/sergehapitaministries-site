import "server-only";
import {createHash,timingSafeEqual} from "node:crypto";
import type {SupabaseClient} from "@supabase/supabase-js";
import {publishReadyDrive} from "./readyPublication";
import {readyWindow} from "./readyDocument";
type CommandResult={success:boolean;date:string;outcomes?:unknown[];error?:string;[key:string]:unknown};
export async function executeEditorialCommand(db:SupabaseClient,id:string,authorization:string,now=new Date()){
 const reply=(body:Record<string,unknown>,status=200)=>({body,status});
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return reply({error:"Commande introuvable."},404);
 if(!/^[0-9a-f]{64}$/.test(authorization))return reply({error:"Authentification requise."},401);
 const found=await db.from("editorial_commands").select("*").eq("id",id).maybeSingle();
 if(found.error)throw Error("Lecture de la commande CMS impossible.");
 const command=found.data;
 if(!command || command.action!=="publish_ready")return reply({error:"Commande introuvable."},404);
 const expected=String(command.authorization_hash??"");
 const supplied=createHash("sha256").update(authorization).digest("hex");
 if(!/^[0-9a-f]{64}$/.test(expected)||!timingSafeEqual(Buffer.from(expected,"hex"),Buffer.from(supplied,"hex")))return reply({error:"Authentification invalide."},401);
 const created=Date.parse(command.created_at),expires=Date.parse(command.expires_at);
 if(!Number.isFinite(created)||!Number.isFinite(expires)||created>now.getTime()+30000||expires<=now.getTime()||expires-created>900000){
  await db.from("editorial_commands").update({status:"failed",result:{success:false,error:"Commande expirée."},finished_at:now.toISOString()}).eq("id",id).eq("status","queued");
  return reply({error:"Commande expirée ou période de validité invalide."},410);
 }
 if(command.status==="completed" || command.status==="failed")return reply({...(command.result??{}),commandId:id,commandStatus:command.status,reused:true});
 if(command.status==="running")return reply({commandId:id,commandStatus:"running"},202);
 if(command.status!=="queued")return reply({error:"Commande non disponible."},409);
 const date=command.article_date;
 const clock=readyWindow(now);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date) || date<"2026-10-28" || date>clock.date || (date===clock.date&&!clock.due))return reply({error:"Date de rattrapage non autorisée."},400);
 // La ligne et le hash du jeton sont créés par la connexion administrative. Le jeton aléatoire est requis ; aucune date ni contenu ne provient de l’URL.
 const claim=await db.from("editorial_commands").update({status:"running"}).eq("id",id).eq("status","queued").gt("expires_at",now.toISOString()).select("id").maybeSingle();
 if(claim.error)throw Error("Prise de la commande CMS impossible.");
 if(!claim.data)return reply({commandId:id,commandStatus:"running"},202);
 let result:CommandResult;
 try{
  result=await publishReadyDrive(db,date,false);
  if(!result.outcomes?.length)result={...result,success:false,error:"Aucun contenu final disponible pour cette date."};
 }catch(error){result={success:false,date,error:error instanceof Error?error.message:"Publication CMS impossible."};}
 const status=result.success?"completed":"failed";
 const saved=await db.from("editorial_commands").update({status,result,finished_at:new Date().toISOString()}).eq("id",id).eq("status","running").select("id").single();
 if(saved.error)throw Error("Le résultat CMS n’a pas pu être enregistré ; vérifier les articles avant toute reprise.");
 return reply({...result,commandId:id,commandStatus:status,reused:false});
}

