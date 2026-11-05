import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {createHash,timingSafeEqual} from "node:crypto";
const source=stripTypeScriptTypes(await readFile(new URL("../src/lib/editorial/commands.ts",import.meta.url),"utf8")).replace(/^import .*;\s*$/gm,"").replace(/\bexport\s+/g,"");
const id="7e258f34-7b02-43ed-93b2-9938225db582";
const authorization="a".repeat(64);
const authorization_hash=createHash("sha256").update(authorization).digest("hex");
const now=new Date("2026-11-01T09:00:00Z");
const base=()=>({id,action:"publish_ready",article_date:"2026-10-29",status:"queued",created_at:"2026-11-01T08:59:00Z",expires_at:"2026-11-01T09:14:00Z",result:null,authorization_hash});
function database(initial){
 let row=initial?structuredClone(initial):null;
 return {get row(){return row;},from(table){
  assert.equal(table,"editorial_commands");let update=null;const filters=[];
  const chain={select(){return chain;},eq(k,v){filters.push(r=>r[k]===v);return chain;},gt(k,v){filters.push(r=>r[k]>v);return chain;},update(value){update=value;return chain;},
   async maybeSingle(){if(!row||!filters.every(f=>f(row)))return {data:null,error:null};if(update)row={...row,...update};return {data:structuredClone(row),error:null};},
   async single(){return chain.maybeSingle();},then(resolve,reject){return chain.maybeSingle().then(resolve,reject);}};
  return chain;
 }};
}
function executor(publish,clock={date:"2026-11-02",due:false}){
 return new Function("publishReadyDrive","readyWindow","createHash","timingSafeEqual",source+";return executeEditorialCommand;")(publish,()=>clock,createHash,timingSafeEqual);
}
test("aucune commande inexistante ou expirée ne lance le CMS",async()=>{
 let calls=0;const run=executor(async()=>{calls++;});
 assert.equal((await run(database(null),id,authorization,now)).status,404);
 assert.equal((await run(database(base()),"incorrect",authorization,now)).status,404);
 const expired=database({...base(),expires_at:"2026-11-01T08:59:30Z"});
 assert.equal((await run(expired,id,authorization,now)).status,410);assert.equal(expired.row.status,"failed");assert.equal(calls,0);
});
test("une date future est refusée sans publication",async()=>{
 let calls=0;const run=executor(async()=>{calls++;});
 assert.equal((await run(database({...base(),article_date:"2026-11-02"}),id,authorization,now)).status,400);assert.equal(calls,0);
});
test("un identifiant seul ou un jeton incorrect ne permet aucune publication",async()=>{
 let calls=0;const run=executor(async()=>{calls++;}),db=database(base());
 assert.equal((await run(db,id,"",now)).status,401);
 assert.equal((await run(db,id,"b".repeat(64),now)).status,401);
 assert.equal(calls,0);assert.equal(db.row.status,"queued");
});
test("le lendemain est autorisé à 23h seulement, comme le moteur programmé",async()=>{
 let calls=0;const run=executor(async()=>{calls++;return {success:true,date:"2026-11-02",outcomes:[{}]};},{date:"2026-11-02",due:true});
 assert.equal((await run(database({...base(),article_date:"2026-11-02"}),id,authorization,now)).body.success,true);assert.equal(calls,1);
});
test("une autorisation déclenche exclusivement la date stockée via le moteur natif",async()=>{
 const db=database(base());let calls=0;
 const run=executor(async(client,date,dry)=>{assert.equal(client,db);assert.equal(date,"2026-10-29");assert.equal(dry,false);calls++;return {success:true,date,outcomes:[{type:"jc",status:"published"}]};});
 const first=await run(db,id,authorization,now);assert.equal(first.body.success,true);assert.equal(db.row.status,"completed");
 const replay=await run(db,id,authorization,now);assert.equal(replay.body.reused,true);assert.equal(calls,1);
});
test("deux appels concurrents ne publient qu’une fois",async()=>{
 const db=database(base());let calls=0,release;
 const hold=new Promise(resolve=>release=resolve);
 const run=executor(async()=>{calls++;await hold;return {success:true,date:"2026-10-29",outcomes:[{}]};});
 const first=run(db,id,authorization,now);await new Promise(resolve=>setTimeout(resolve,0));
 const concurrent=await run(db,id,authorization,now);assert.equal(concurrent.status,202);release();await first;assert.equal(calls,1);
});
test("un échec partiel ou un dossier vide n’est jamais annoncé comme une réussite",async()=>{
 for(const publish of [async()=>{throw Error("CMS indisponible");},async()=>({success:true,date:"2026-10-29",outcomes:[]})]){
  const db=database(base()),result=await executor(publish)(db,id,authorization,now);assert.equal(result.body.success,false);assert.equal(db.row.status,"failed");
 }
});

