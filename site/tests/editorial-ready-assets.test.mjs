import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {createHash} from "node:crypto";
const compile=async name=>stripTypeScriptTypes(await readFile(new URL("../src/lib/"+name,import.meta.url),"utf8")).replace(/^import .*;\s*$/gm,"").replace(/\bexport\s+/g,"");
const paragraphs=new Function(await compile("editorial/driveDocument.ts")+";return docParagraphs;")();
const reader=new Function("docParagraphs",await compile("editorial/readyDocument.ts")+";return readReadyPublication;")(paragraphs);
const validate=new Function(await compile("content/publicationValidation.ts")+";return validatePublicationDraft;")();
const source=await compile("editorial/readyPublication.ts");
const doc={revisionId:"one",body:{content:["Titre validé","« Celui qui est en vous est plus grand que celui qui est dans le monde. » — 1 Jean 4:4","Aujourd’hui, je confesse et déclare que la vie de Dieu remplit mon être. La Parole nourrit ma foi et dirige mes pensées. Je marche dans la lumière de Christ et je manifeste sa bonté dans mes actions."].map(content=>({paragraph:{elements:[{textRun:{content:content+"\n"}}]}}))}};
function setup(withImage=false){
 const state={withImage,uploadError:false,uploads:0,nativeCalls:0,visited:[],jobs:[],articles:[],logs:[]};
 const rows={editorial_jobs:state.jobs,articles:state.articles,editorial_runs:state.logs};
 const db={storage:{from(){return {async upload(){state.uploads++;return {error:state.uploadError?Error("Image indisponible"):null};},getPublicUrl(){return {data:{publicUrl:"https://images.example/cover.jpg"}};}};}},from(table){
  const conditions=[];let change=null,addition=null;
  const chain={select(){return chain;},eq(key,value){conditions.push(row=>row[key]===value);return chain;},or(){return chain;},
   update(value){assert.notEqual(table,"articles","les articles doivent passer par le CMS natif");change=value;return chain;},
   insert(value){assert.notEqual(table,"articles","les articles doivent passer par le CMS natif");addition=value;return chain;},
   async maybeSingle(){if(addition){const row={id:"job",lease_until:null,...addition};rows[table].push(row);return {data:structuredClone(row),error:null};}
    const row=rows[table].find(row=>conditions.every(f=>f(row)));
    if(row&&change)Object.assign(row,change);return {data:row?structuredClone(row):null,error:null};},
   async single(){const result=await chain.maybeSingle();return result.data?result:{data:null,error:Error("Row unavailable")};},
   then(resolve,reject){return chain.maybeSingle().then(resolve,reject);}
  };return chain;
 }};
 const googleJson=async url=>{
  if(url.includes("/documents/"))return structuredClone(doc);
  const query=new URL(url).searchParams.get("q"),parent=query.match(/^'([^']+)'/)[1];state.visited.push(parent);
  if(parent==="1LxnH_dpGPFGRZ3upwDpaCh1k15euRfL9")return {files:[{id:"date29",name:"2026-10-29",mimeType:"application/vnd.google-apps.folder"},{id:"date30",name:"2026-10-30",mimeType:"application/vnd.google-apps.folder"}]};
  if(parent==="date29")return {files:[{id:"doc",name:"Publication-jc-2026-10-29",mimeType:"application/vnd.google-apps.document"},...(state.withImage?[{id:"image",name:"titre-valide.jpg",mimeType:"image/jpeg",size:100}]:[])]};
  throw Error("Dossier hors date lu : "+parent);
 };
 const native=async(client,job)=>{
  assert.equal(client,db);state.nativeCalls++;
  let article=state.articles[0];
  if(!article){article={id:"article-stable",type:"jc",article_date:"2026-10-29"};state.articles.push(article);}
  Object.assign(article,structuredClone(job.draft));
  return {id:article.id,path:"/publications/je-confesse-et-declare/2026-10-29"};
 };
 const fingerprint=value=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
 const run=new Function("createHash","sharp","revalidatePath","googleReadToken","googleJson","googleResponse","readReadyPublication","docParagraphs","fingerprint","validatePublicationDraft","publicationJpeg","publishThroughCms",source+";return publishReadyDrive;")(
 createHash,()=>({metadata:async()=>({format:"jpeg",width:1600,height:900})}),()=>{},async()=>"fixture",googleJson,async()=>new Response(new Uint8Array([1,2,3])),reader,paragraphs,fingerprint,validate,async raw=>({bytes:raw}),native
 );
 return {state,run:dry=>run(db,"2026-10-29",dry)};
}
test("un texte validé sans image est publié par le CMS, à sa date",async()=>{
 const {state,run}=setup();const result=await run(false);assert.equal(result.success,true);assert.equal(state.nativeCalls,1);assert.equal(state.articles[0].cover_url,null);
 assert.equal(state.articles[0].article_date,"2026-10-29");assert.ok(!state.visited.includes("date30"));assert.equal(state.uploads,0);
});
test("une image momentanément indisponible ne bloque pas le texte et peut être complétée sans doublon",async()=>{
 const {state,run}=setup(true);state.uploadError=true;
 assert.equal((await run(false)).success,true);assert.equal(state.nativeCalls,1);assert.equal(state.articles[0].cover_url,null);
 state.uploadError=false;assert.equal((await run(false)).success,true);assert.equal(state.nativeCalls,2);
 assert.equal(state.articles.length,1);assert.equal(state.articles[0].id,"article-stable");assert.equal(state.articles[0].cover_url,"https://images.example/cover.jpg");
});
test("un nouveau contrôle conserve une version déjà publiée et ses corrections CMS",async()=>{
 const {state,run}=setup(true);assert.equal((await run(false)).success,true);
 state.articles[0].body="Correction ultérieure du CMS";
 assert.equal((await run(false)).success,true);assert.equal(state.nativeCalls,1);assert.equal(state.articles[0].body,"Correction ultérieure du CMS");
});
test("le contrôle en lecture seule ne publie ni ne dépose d’image",async()=>{
 const {state,run}=setup(true);const result=await run(true);assert.equal(result.success,true);assert.equal(state.nativeCalls,0);assert.equal(state.uploads,0);assert.equal(state.jobs.length,0);
});

