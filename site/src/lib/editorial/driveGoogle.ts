import "server-only";
import { createSign } from "node:crypto";

export async function googleReadToken(write=false) {
  const raw=process.env.EDITORIAL_GOOGLE_SERVICE_ACCOUNT_JSON ?? process.env.GA_SERVICE_ACCOUNT_JSON;
  if (!raw) throw Error("Compte de collecte Google absent.");
  const account=JSON.parse(raw);
  if (!account.client_email || !account.private_key) throw Error("Compte de collecte Google incomplet.");
  const now=Math.floor(Date.now()/1000), enc=(v:unknown)=>Buffer.from(JSON.stringify(v)).toString("base64url");
  const scope=write?"https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/documents":"https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly";
  const claim=enc({alg:"RS256",typ:"JWT"})+"."+enc({iss:account.client_email,scope,aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
  const assertion=claim+"."+createSign("RSA-SHA256").update(claim).sign(account.private_key,"base64url");
  const response=await googleResponse("https://oauth2.googleapis.com/token",{method:"POST",body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion})});
  return (await response.json()).access_token as string;
}
export async function googleResponse(url:string, init:RequestInit={}) {
  const response=await fetch(url,{...init,cache:"no-store",signal:AbortSignal.timeout(45000)});
  if (!response.ok) {
    let detail="";
    try { const value=await response.json(); detail=String(value.error?.message ?? value.error_description ?? value.error ?? ""); } catch {}
    throw Error("Google HTTP "+response.status+": "+detail.slice(0,500));
  }
  return response;
}
export async function googleJson(url:string,token:string) {return (await googleResponse(url,{headers:{authorization:"Bearer "+token}})).json();}
export async function drivePublicationFiles(token:string) {
  const files:{id:string;name:string}[]=[];
  let page="";
  do {
    const params=new URLSearchParams({q:"'1LxnH_dpGPFGRZ3upwDpaCh1k15euRfL9' in parents and trashed = false and mimeType = 'application/vnd.google-apps.document'",fields:"files(id,name),nextPageToken",pageSize:"100"});
    if(page)params.set("pageToken",page);
    let result;
    try { result=await googleJson("https://www.googleapis.com/drive/v3/files?"+params,token); }
    catch(error) {
      // L'API Docs reste utilisable quand l'API Drive est désactivée.
      if(!String(error).includes("Google Drive API has not been used"))throw error;
      return {driveAvailable:false,files:[
        {id:"18DlAfDFPMpngQwrpUUPJB_71-9M69IWN7qBOXQNVHI8",name:"Publication-jc-2026-10-27"},
        {id:"1F7e0TsqI0jsFd85hb0Fio0l5L21VVBgZNloMTxgAoQ4",name:"Publication-rm-2026-10-27"},
        {id:"1IAJgpmNdQ8hcZ5WPbiF3Ro7d3VSKmF3kaUgTk4gYckY",name:"Publication-qdlb-2026-10-27"}
      ]};
    }
    files.push(...(result.files??[]));page=result.nextPageToken??"";
  } while(page);
  return {driveAvailable:true,files:files.filter(f=>/^Publication-(jc|rm|qdlb)-\d{4}-\d{2}-\d{2}$/.test(f.name))};
}
