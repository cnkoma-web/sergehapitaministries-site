import test from 'node:test';import assert from 'node:assert/strict';import {registerHooks} from 'node:module';
const mod=s=>'data:text/javascript,'+encodeURIComponent(s);
registerHooks({resolve(s,c,n){
 if(s==='server-only')return {url:mod('export {}'),shortCircuit:true};
 if(s==='./workflow')return {url:mod(`export const allChecks=()=>[];export async function collectSources(){throw Error('Sources déjà présentes');}export async function prepareJob(){throw Error('Préparation déjà terminée');}export async function approveJob(db,id,hash,actor){const row=db.rows.find(r=>r.id===id);if(row.draft_hash!==hash)throw Error('Version changée');row.status='approved';row.approved_by=actor;db.approvals++;}export async function publishJob(db,id){const row=db.rows.find(r=>r.id===id);if(row.status!=='approved')throw Error('Ordre manquant');row.status='published';row.public_url='https://sergehapitaministries.org/'+row.type;db.publications++;return structuredClone(row);}`),shortCircuit:true};
 if(s==='./driveArchive')return {url:mod(`export async function archivePublishedDraft(job){if(job.status!=='published')throw Error('Archive prématurée');}`),shortCircuit:true};
 if(s==='@/lib/content/editorialClock')return {url:mod(`export function editorialClock(){return {today:'2026-10-28'};}`),shortCircuit:true};
 return n(s,c);
}});
const {automaticPublication}=await import('../src/lib/editorial/automaticPublication.ts');
function db(){const value={rows:['jc','qdlb','rm'].map(type=>({id:type,type,article_date:'2026-10-28',status:'review',source:'source',draft:{title:type},draft_hash:'hash-'+type})),approvals:0,publications:0};value.from=()=>({select(){return this},eq(){return this},async order(){return {data:structuredClone(value.rows),error:null}},async insert(){return {error:null}}});return value;}
test('le contrôle préalable ne publie et ne valide aucun texte',async()=>{const d=db();const r=await automaticPublication(d,'2026-10-28',true);assert.equal(r.success,true);assert.equal(d.publications,0);assert.equal(d.approvals,0);});
test('la date prévue déclenche les trois publications sans validation humaine',async()=>{const d=db();const r=await automaticPublication(d,'2026-10-28');assert.equal(r.success,true);assert.equal(d.publications,3);assert.equal(d.approvals,3);assert.ok(d.rows.every(r=>r.approved_by==='automation:ordre-permanent-2026-10-27'));});
test('une reprise conserve les articles déjà publiés',async()=>{const d=db();await automaticPublication(d,'2026-10-28');await automaticPublication(d,'2026-10-28');assert.equal(d.publications,3);});
test('les anciennes publications et les dates futures sont exclues',async()=>{const d=db();await assert.rejects(()=>automaticPublication(d,'2026-10-27'));await assert.rejects(()=>automaticPublication(d,'2026-10-29'));assert.equal(d.publications,0);});
