import test from 'node:test';import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
let code=await readFile(new URL('../src/lib/editorial/editorialPipeline.ts',import.meta.url),'utf8');
code=code.replace("import type { EditorialDraft, EditorialJob } from './types';",'').replace("'./checks'",JSON.stringify(new URL('../src/lib/editorial/checks.ts',import.meta.url).href));
const {stripTypeScriptTypes}=await import('node:module');
const {referenceProfile,runEditorialPipeline,applicableRules}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(code)).toString('base64'));
const refs=[210,240,270].map((n,i)=>({id:String(i),article_date:'2026-10-1'+i,title:'Modèle',body:'mot '.repeat(n)}));
test('la date limite exclut le 20 octobre et les références ultérieures',()=>{assert.throws(()=>referenceProfile('jc',[...refs,{...refs[0],article_date:'2026-10-20'}]));assert.equal(referenceProfile('rm',refs).minimum,230);});
test('les quatre étapes sont distinctes et le refus entraîne une correction',async()=>{
 const stages=[];let n=0;const keys=['fidelite_source','analyse_appliquee','enrichissement','conformite_references','specificites_rubrique','citations_exactes','priere_fidele','style_affirmatif','structure_sans_doublons'];
 const result=await runEditorialPipeline({type:'jc',article_date:'2026-10-28',source:'Source',source_hash:'hash'},refs,'Règles',{
 async ask(){n++;if(n===1)return{idee_centrale:'Idée',progression_source:'Progression',caracteristiques_references:'Modèles',modeles_etudies:refs.map(r=>({id:r.id,date:r.article_date,progression_et_profondeur:'Observation concrète de la construction du modèle.'})),plan_enrichissement:'Plan'};if(n===2)return{texte_traduit:'Traduction fidèle et complète de toutes les idées de la source étudiée.'};if(n===3||n===5)return{type:'jc',article_date:'2026-10-28',title:'Titre',body:'<p>'+'mot '.repeat(240)+'</p>',image_prompt:'Objets',seo_keywords:[]};return{passed:n===6,criteria:Object.fromEntries(keys.map(k=>[k,{passed:n===6,justification:'Examen concret du contenu de la publication.'}])),issues:n===4?['Enrichir davantage']:[]};},async record(stage){stages.push(stage);},validate:()=>[]});
 assert.equal(n,6);assert.deepEqual(stages,['1-analyse-reponse','1-analyse','2-traduction','3-enrichissement','4-conformite','3-enrichissement','4-conformite']);assert.equal(result.editorial_audit.body_words,240);
});

test('les règles d’une rubrique restent isolées des autres formats',()=>{
 const rules='Commun\nRosée Matinale — chaque jour\nChapeau dans verse_text\nJe Confesse — chaque jour\nConfession\nQue dit la Bible ? — chaque jour\nChapeau dans excerpt\nLa Vie Supérieure — le lundi\nEnseignement du lundi\nImages et référencement\nImages réalistes';
 const result=applicableRules(rules,'qdlb');assert.ok(result.includes('Chapeau dans excerpt'));assert.ok(result.includes('Images réalistes'));assert.ok(!result.includes('Chapeau dans verse_text'));assert.ok(!result.includes('Confession'));
});
