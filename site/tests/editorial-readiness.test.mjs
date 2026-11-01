import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
const source=stripTypeScriptTypes(await readFile(new URL("../src/app/api/editorial/readiness/route.ts",import.meta.url),"utf8")).replace(/^import .*;\s*$/gm,"").replace(/\bexport\s+/g,"");
let readCalls=0,replayCalls=0;
const secret="test-credential-never-use-in-production-0000";
const check=async request=>{
 const authorization=request.headers.get("authorization");
 if(authorization!=="Bearer "+secret)return Response.json({error:"Unauthorized"},{status:401});
 readCalls++;
 return Response.json({success:true,dryRun:true,date:"2026-10-29",outcomes:["jc","rm","qdlb"].map(type=>({document:"Publication-"+type+"-2026-10-29",type,status:"texte final et image prêts",bytes:640000}))});
};
const replay=async()=>{replayCalls++;return Response.json({skipped:"preview"});};
const GET=new Function("checkReady","replayReady",source+";return GET;")(check,replay);
const request=()=>new Request("https://protected-preview.vercel.app/api/editorial/readiness?date=2026-10-29");
test("le diagnostic est absent en production et ne touche pas au moteur",async()=>{
 process.env.VERCEL_ENV="production";process.env.CRON_SECRET=secret;
 assert.equal((await GET(request())).status,404);assert.equal(readCalls,0);assert.equal(replayCalls,0);
});
test("le diagnostic utilise le secret configuré sans le renvoyer et reste sans publication",async()=>{
 process.env.VERCEL_ENV="preview";
 const response=await GET(request()),body=await response.json();
 assert.equal(response.status,200);assert.equal(body.success,true);assert.equal(body.readOnly,true);assert.equal(body.publicationExecuted,false);
 assert.equal(body.authenticationVerified,true);assert.equal(body.previewWritesBlocked,true);assert.equal(readCalls,1);
 assert.ok(!JSON.stringify(body).includes(secret));assert.equal(body.outcomes.length,3);
});
test("un secret absent arrête le diagnostic avant le moteur",async()=>{
 delete process.env.CRON_SECRET;
 const before=readCalls;const response=await GET(request());assert.equal(response.status,503);assert.equal(readCalls,before);
});

