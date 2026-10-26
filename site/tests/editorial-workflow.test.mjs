import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
const moduleUrl = source => "data:text/javascript," + encodeURIComponent(source);
registerHooks({resolve(specifier, context, next) {
  if(specifier === "server-only") return {url:moduleUrl("export {}"),shortCircuit:true};
  if(specifier === "next/cache") return {url:moduleUrl("export function revalidatePath() {}"),shortCircuit:true};
  if(specifier === "./providers") return {url:moduleUrl("export const collectGoogleDocument = async()=>{throw Error('Provider non simulé')}; export const writeDraft=collectGoogleDocument; export const illustrate=collectGoogleDocument;"),shortCircuit:true};
  if(specifier === "./native") return {url:moduleUrl("export async function publishThroughCms(){throw Error('CMS ne doit pas être appelé sans validation') }"),shortCircuit:true};
  if(specifier.startsWith("@/")) return next(new URL("../src/"+specifier.slice(2)+".ts",import.meta.url).href,context);
  if(specifier.startsWith("./") && !specifier.endsWith(".ts")) return next(new URL(specifier+".ts",context.parentURL).href,context);
  return next(specifier,context);
}});
const {replaceDraft,approveJob,publishJob,collectSources} = await import("../src/lib/editorial/workflow.ts");
const {fingerprint} = await import("../src/lib/editorial/checks.ts");
const draft={type:"qdlb",title:"La vie",article_date:"2026-10-26",body:"<p>Premier paragraphe.</p><p>Second paragraphe.</p>",excerpt:"Chapeau.",verse_text:"Je suis le cep, vous êtes les sarments.",verse_reference:"Jean 15:5",author_name:"Serge Hapita",further_verses:[{reference:"Jean 15:5",text:"Je suis le cep, vous êtes les sarments."}],seo_keywords:Array.from({length:20},(_,i)=>"mot "+i),image_prompt:"Un paysage",cover_url:"https://example.test/paysage.png",cover_alt:"Un paysage",image_bytes:2000000,image_width:1920,image_height:1080};
function database() {
  const hash=fingerprint({source_hash:"source",draft});
  const db={rows:[{id:"job",type:"qdlb",article_date:"2026-10-26",source_hash:"source",draft:structuredClone(draft),draft_hash:hash,status:"approved",approved_hash:hash,approved_by:"admin",approved_at:"2026-10-26T10:00:00Z",lease_token:null}],beforeUpdate:null};
  db.from=table=>{
    let values=null, filters=[], operation="read";
    const query={
      select(){return this},
      update(v){operation="update";values=v;return this},
      eq(k,v){filters.push(row=>row[k]===v);return this},
      is(k,v){filters.push(row=>(row[k]??null)===v);return this},
      in(k,v){filters.push(row=>v.includes(row[k]));return this},
      async execute(single){
        if(table!=="editorial_jobs") throw Error("Table inattendue : "+table);
        if(operation==="update" && db.beforeUpdate){const fn=db.beforeUpdate;db.beforeUpdate=null;fn(db.rows[0]);}
        const rows=db.rows.filter(row=>filters.every(f=>f(row)));
        if(operation==="update") rows.forEach(row=>Object.assign(row,structuredClone(values)));
        return single ? {data:structuredClone(rows[0]??null),error:rows.length===1?null:{message:"Conflit"}} : {data:structuredClone(rows),error:null};
      },
      single(){return this.execute(true)},maybeSingle(){return this.execute(true)},
      then(resolve,reject){return this.execute(false).then(resolve,reject)},
    };
    return query;
  };
  return db;
}
test("corriger un brouillon approuvé annule effectivement sa validation",async()=>{
  const db=database();
  await replaceDraft(db,"job",{...draft,title:"Titre corrigé"});
  assert.equal(db.rows[0].status,"review");
  assert.equal(db.rows[0].approved_hash,null);
  assert.equal(db.rows[0].approved_by,null);
  await assert.rejects(()=>publishJob(db,"job"),/Validation explicite/);
});
test("une modification concurrente est préservée au lieu d'être écrasée",async()=>{
  const db=database();
  db.beforeUpdate=row=>{row.draft={...draft,title:"Correction concurrente"};row.draft_hash="hash-concurrent";};
  await assert.rejects(()=>replaceDraft(db,"job",{...draft,title:"Ancienne correction"}),/modification/);
  assert.equal(db.rows[0].draft.title,"Correction concurrente");
});
test("un ancien hash ne peut approuver la nouvelle version",async()=>{
  const db=database(), oldHash=db.rows[0].draft_hash;
  await replaceDraft(db,"job",{...draft,title:"Version nouvelle"});
  await assert.rejects(()=>approveJob(db,"job",oldHash,"admin"),/changé/);
  assert.equal(db.rows[0].status,"review");
});
test("une modification des sources pendant la validation bloque l'approbation",async()=>{
  const db=database();db.rows[0].status="review";
  db.beforeUpdate=row=>{row.source_hash="nouvelle-source";};
  await assert.rejects(()=>approveJob(db,"job",db.rows[0].draft_hash,"admin"));
  assert.equal(db.rows[0].status,"review");
});
test("une publication dont le texte a changé est bloquée avant le CMS",async()=>{
  const db=database();db.rows[0].draft.title="Altéré";
  await assert.rejects(()=>publishJob(db,"job"),/Validation explicite/);
  assert.equal(db.rows[0].status,"approved");
});
test("une source incomplète n'entraîne aucune écriture partielle",async()=>{
  const db=database(),before=structuredClone(db.rows);
  await assert.rejects(()=>collectSources(db,"2026-10-26","LUNDI 26 OCTOBRE 2026\n1/ QUE DIT LA BIBLE?\nTexte"),/Sources manquantes/);
  assert.deepEqual(db.rows,before);
});
