import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {timingSafeEqual} from "node:crypto";
import {readyInvocation} from "../src/lib/editorial/readyReplay.ts";
const root=new URL("../",import.meta.url);
const compile=async path=>stripTypeScriptTypes(await readFile(new URL(path,root),"utf8")).replace(/^import .*;\s*$/gm,"").replace(/\bexport\s+/g,"");
const accessSource=stripTypeScriptTypes(await readFile(new URL("../src/lib/editorial/access.ts",import.meta.url),"utf8")).replace(/^import .*;\s*$/gm,"").replace(/\bexport\s+/g,"");
const validBearer=new Function("timingSafeEqual",accessSource+";return validBearer;")(timingSafeEqual);
const routeSource=await compile("src/app/api/cron/ready/route.ts");
const secret="local-test-only-not-a-production-credential";
process.env.CRON_SECRET=secret;process.env.VERCEL_ENV="production";
let clock={date:"2026-10-31",due:false},calls=[],failure=null;
const db={fixture:true};
const handler=new Function("validBearer","createServiceRoleClient","readyWindow","readyInvocation","publishReadyDrive",routeSource+";return {GET,POST};")(
 validBearer,()=>db,()=>clock,readyInvocation,async(...args)=>{calls.push(args);if(failure)throw failure;return {success:true,date:args[1],dryRun:args[2]};}
);
const req=(body,auth=secret)=>new Request("http://localhost/api/cron/ready",{method:"POST",headers:{"content-type":"application/json",...(auth?{authorization:"Bearer "+auth}:{})},body:JSON.stringify(body)});
test("la route réelle refuse les requêtes sans autorisation, avant tout appel CMS",async()=>{
 for(const auth of [null,"incorrect"]){calls=[];const r=await handler.POST(req({action:"replay",date:"2026-10-29"},auth));assert.equal(r.status,401);assert.equal(calls.length,0);}
});
test("un accès valide transmet exactement le 29 au moteur existant hors fenêtre",async()=>{
 calls=[];const r=await handler.POST(req({action:"replay",date:"2026-10-29"}));
 assert.equal(r.status,200);assert.equal(calls.length,1);assert.equal(calls[0][0],db);assert.equal(calls[0][1],"2026-10-29");assert.equal(calls[0][2],false);
});
test("une date future ou un corps mal formé ne déclenche aucune publication",async()=>{
 calls=[];assert.equal((await handler.POST(req({action:"replay",date:"2026-10-31"}))).status,400);
 const malformed=new Request("http://localhost/api/cron/ready",{method:"POST",headers:{authorization:"Bearer "+secret,"content-type":"application/json"},body:"{"});
 assert.equal((await handler.POST(malformed)).status,400);assert.equal(calls.length,0);
});
test("la simulation du 29 reste sans écriture et le cron à 23 h garde J+1",async()=>{
 calls=[];
 let r=await handler.GET(new Request("http://localhost/api/cron/ready?check=1&date=2026-10-29",{headers:{authorization:"Bearer "+secret}}));
 assert.equal(r.status,200);assert.equal(calls[0][1],"2026-10-29");assert.equal(calls[0][2],true);
 calls=[];clock={...clock,due:true};
 r=await handler.GET(new Request("http://localhost/api/cron/ready",{headers:{authorization:"Bearer "+secret}}));
 assert.equal(r.status,200);assert.equal(calls[0][1],"2026-10-31");assert.equal(calls[0][2],false);clock={...clock,due:false};
});
test("les previews et les erreurs moteur ne sont pas présentées comme publiées",async()=>{
 calls=[];process.env.VERCEL_ENV="preview";
 assert.equal((await handler.POST(req({action:"replay",date:"2026-10-29"}))).status,200);assert.equal(calls.length,0);
 process.env.VERCEL_ENV="production";failure=Error("CMS fixture failure");
 assert.equal((await handler.POST(req({action:"replay",date:"2026-10-29"}))).status,503);failure=null;
});
