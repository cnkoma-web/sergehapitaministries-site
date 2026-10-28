// Exécution ponctuelle explicitement autorisée pour le 27 octobre 2026.
// Les écritures d'articles passent exclusivement par /api/editorial et les actions natives du CMS.
// Aucun jeton ni contenu des sources n'est écrit dans les journaux.
import { readFile } from "node:fs/promises";
import { createHash, createSign } from "node:crypto";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { editorialChecks, assertDraftShape } from "../src/lib/editorial/checks.ts";
import { validatePublicationDraft } from "../src/lib/content/publicationValidation.ts";

const manifest=JSON.parse(await readFile(new URL("./publication-2026-10-27.json",import.meta.url),"utf8"));
const sha=value=>createHash("sha256").update(value).digest("hex");
if(manifest.date!=="2026-10-27" || manifest.items.length!==3) throw Error("Manifeste non autorisé");
for(const item of manifest.items){
  assertDraftShape(item.draft);
  if(item.draft.article_date!==manifest.date || item.draft.type!==item.type)throw Error("Identité du contenu invalide");
  if(item.publish && !["jc","qdlb","rm"].includes(item.type))throw Error("Publication non autorisée");
  if(item.asset && sha(await readFile(item.asset.path))!==item.asset.sha256)throw Error("Le visuel validé a changé : "+item.type);
  if(item.publish){const issues=[...validatePublicationDraft(item.draft),...editorialChecks(item.draft)];if(issues.length)throw Error(JSON.stringify(issues));}
}
if(!process.argv.includes("--execute")){
  console.log("[publication27] Manifeste et visuels vérifiés ; aucune écriture.");
  process.exit(0);
}
if(process.env.VERCEL_ENV!=="production")throw Error("Exécution réservée au déploiement de production autorisé");
const secret=process.env.EDITORIAL_OPERATOR_SECRET;
if(!secret || secret.length<32)throw Error("Accès opérateur configuré absent");
const account=JSON.parse(process.env.EDITORIAL_GOOGLE_SERVICE_ACCOUNT_JSON??process.env.GA_SERVICE_ACCOUNT_JSON??"{}");
if(!account.private_key || !account.client_email)throw Error("Compte de collecte absent");
async function json(url,init){
  const r=await fetch(url,{...init,signal:AbortSignal.timeout(60000)});
  const value=await r.json();
  if(!r.ok)throw Error(new URL(url).hostname+" HTTP "+r.status+(typeof value.error==="string"?" : "+value.error:""));
  return value;
}
const seconds=Math.floor(Date.now()/1000),encode=x=>Buffer.from(JSON.stringify(x)).toString("base64url");
const claim=encode({alg:"RS256",typ:"JWT"})+"."+encode({iss:account.client_email,scope:"https://www.googleapis.com/auth/documents.readonly",aud:"https://oauth2.googleapis.com/token",iat:seconds,exp:seconds+3600});
const assertion=claim+"."+createSign("RSA-SHA256").update(claim).sign(account.private_key,"base64url");
const token=await json("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion})});
const sources={};
for(const item of manifest.items){
  const doc=await json("https://docs.googleapis.com/v1/documents/"+item.sourceDocumentId+"?includeTabsContent=true",{headers:{authorization:"Bearer "+token.access_token}});
  const texts=[];
  function walk(value){
    if(!value || typeof value!=="object")return;
    if(value.textRun){if(value.textRun.content)texts.push(value.textRun.content);return;}
    for(const child of Object.values(value)){if(Array.isArray(child))child.forEach(walk);else if(typeof child==="object")walk(child);}
  }
  walk(doc.tabs??doc.body);
  const text=texts.join("");
  if(sha(text.replace(/\s+/g," ").trim())!==item.sourceSha256)throw Error("La source a changé après traduction : "+item.type);
  if(item.publish && editorialChecks(item.draft,text).length)throw Error("Contrôles avec source en échec : "+item.type);
  sources[item.type]=text;
}
console.log("[publication27] Trois sources relues et conformes aux traductions préparées.");
// Le serveur de travail écoute uniquement sur la boucle locale du build.
// La date opérateur est limitée au manifeste de cette exécution ; la configuration distante n'est pas modifiée.
const server=spawn(process.execPath,["node_modules/next/dist/bin/next","start","-H","127.0.0.1","-p","3217"],{env:{...process.env,EDITORIAL_OPERATOR_DATE:manifest.date},stdio:["ignore","pipe","pipe"]});
server.stdout.on("data",()=>{});server.stderr.on("data",()=>{});
let startupError=null;server.on("error",error=>{startupError=error;});
const endpoint="http://127.0.0.1:3217/api/editorial";
async function action(action,extra={}){return json(endpoint,{method:"POST",headers:{authorization:"Bearer "+secret,"content-type":"application/json"},body:JSON.stringify({date:manifest.date,action,...extra})});}
try{
  let ready=false;
  for(let attempt=0;attempt<100;attempt++){
    if(startupError)throw startupError;
    if(server.exitCode!==null)throw Error("Le serveur CMS s'est arrêté avant publication");
    try{const r=await fetch(endpoint,{signal:AbortSignal.timeout(1000)});if(r.status===405){ready=true;break;}}catch{}
    await delay(200);
  }
  if(!ready)throw Error("Le serveur CMS local ne répond pas");
  const documentText="MARDI 27 OCTOBRE 2026\n1/ QUE DIT LA BIBLE?\n"+sources.qdlb+"\n2/ ROSEE MATINALE\n"+sources.rm+"\n3/ JE CONFESSE\n"+sources.jc;
  await action("collect",{documentText});
  for(const item of manifest.items){
    let job=(await action("list")).jobs.find(job=>job.type===item.type);
    if(!job)throw Error("Contenu collecté absent : "+item.type);
    if(job.status==="published"){
      if(job.draft.title!==item.draft.title || job.draft.body!==item.draft.body || job.draft.cover_url!==item.draft.cover_url)throw Error("Une autre version est déjà publiée");
      console.log("[publication27] Déjà publié : "+item.type+" "+job.public_url);continue;
    }
    await action("replace",{id:job.id,draft:item.draft});
    job=(await action("list")).jobs.find(current=>current.id===job.id);
    if(!item.publish){
      const result=await action("stage",{id:job.id});
      console.log("[publication27] Rosée enregistrée en brouillon natif : "+result.article.id);
      continue;
    }
    await action("approve",{id:job.id,hash:job.draft_hash,confirmSource:true,confirmBible:true,confirmImage:false});
    const result=await action("publish",{id:job.id});
    console.log("[publication27] Publié par le CMS natif : "+item.type+" "+result.job.public_url);
  }
}finally{server.kill("SIGTERM");}
