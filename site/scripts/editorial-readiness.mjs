// Diagnostic des fournisseurs dans Vercel, sans écrire dans le CMS.
// Ne journalise ni clé, ni jeton, ni contenu du document.
import { createSign } from "node:crypto";
import { parseDailySources } from "../src/lib/content/dailySourceParser.ts";

async function checked(url, init) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(60000) });
  if (!response.ok) {
    const detail = await response.json().catch(()=>null);
    const message = new URL(url).hostname.endsWith("googleapis.com") ? detail?.error?.message : null;
    throw new Error(new URL(url).hostname + " HTTP " + response.status + (message ? " : " + message : ""));
  }
  return response.json();
}
let failed = false;
try {
  const account = JSON.parse(process.env.EDITORIAL_GOOGLE_SERVICE_ACCOUNT_JSON ?? process.env.GA_SERVICE_ACCOUNT_JSON ?? "{}");
  if (!account.client_email || !account.private_key) throw new Error("Compte de service Google absent");
  console.log("[editorial] Compte de collecte : " + account.client_email);
  const now = Math.floor(Date.now()/1000);
  const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const claim = encode({alg:"RS256",typ:"JWT"}) + "." + encode({iss:account.client_email,scope:"https://www.googleapis.com/auth/documents.readonly",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const signature = createSign("RSA-SHA256").update(claim).sign(account.private_key,"base64url");
  const token = await checked("https://oauth2.googleapis.com/token", {method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:claim+"."+signature})});
  const doc = await checked("https://docs.googleapis.com/v1/documents/19ddvhQwejwTrYMCICcHXtvIMAYyu7BdNMAfdNdGpqGk?includeTabsContent=true",{headers:{authorization:"Bearer "+token.access_token}});
  const texts=[];
  function walk(value) {
    if (!value || typeof value!=="object") return;
    if (value.textRun) { if(value.textRun.content) texts.push(value.textRun.content); return; }
    for(const item of Object.values(value)) {
      if(Array.isArray(item)) item.forEach(walk); else if(typeof item==="object") walk(item);
    }
  }
  walk(doc.tabs ?? doc.body);
  const date = process.env.EDITORIAL_CHECK_DATE;
  if(date) {
    const result=parseDailySources(texts.join(""),date);
    if(result.missing.length) throw new Error("Rubriques manquantes pour "+date+" : "+result.missing.join(", "));
  }
  console.log("[editorial] Google Docs : lecture réelle OK" + (date ? " ; trois rubriques " + date : ""));
} catch(error) { failed=true; console.error("[editorial] Google Docs : " + error.message); }
try {
  const models=await checked("https://ai-gateway.vercel.sh/v1/models");
  for(const id of [process.env.EDITORIAL_TEXT_MODEL ?? "openai/gpt-5-mini",process.env.EDITORIAL_IMAGE_MODEL ?? "bfl/flux-3-image-klein"]) {
    if(!models.data?.some(model=>model.id===id)) throw new Error("Modèle absent du catalogue : "+id);
    console.log("[editorial] Modèle disponible : "+id);
  }
  if(!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) throw new Error("Authentification Gateway absente");
  console.log("[editorial] Authentification Gateway configurée (requête de génération à tester séparément)");
} catch(error) { failed=true; console.error("[editorial] Gateway : " + error.message); }
if(failed) process.exitCode=1;
