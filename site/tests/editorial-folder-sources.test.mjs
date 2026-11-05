import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('.')&&!/\.[a-z]+$/.test(s))return n(new URL(s+'.ts',c.parentURL).href,c);return n(s,c);}});
const {collectDatedFolder,SOURCE_FOLDER_ID}=await import('../src/lib/editorial/driveSources.ts');
const {parseDailySources}=await import('../src/lib/content/dailySourceParser.ts');
const F='application/vnd.google-apps.folder',D='application/vnd.google-apps.document';
function reader(){const data={[SOURCE_FOLDER_ID]:[{id:'day',name:'2026-10-28',mimeType:F},{id:'old',name:'2026-10-27',mimeType:F}],day:['qdlb','rm','jc'].map(type=>({id:type,name:type,mimeType:F}))};for(const type of ['qdlb','rm','jc'])data[type]=[{id:'doc-'+type,name:'Source-'+type+'-2026-10-28',mimeType:D}];return {data,async list(id){assert.notEqual(id,'old');return structuredClone(data[id]??[]);},async read(id){return {revisionId:'revision',body:{content:[{paragraph:{elements:[{textRun:{content:'Texte original '+id+'\n'}}]}}]}}}};}
test('lit exactement les trois sources du lendemain dans les dossiers datés',async()=>{const r=await collectDatedFolder('2026-10-28',reader());const parsed=parseDailySources(r.text,'2026-10-28');assert.deepEqual(parsed.missing,[]);for(const t of ['qdlb','rm','jc'])assert.equal(parsed.sections[t],'Texte original doc-'+t);});
test('une rubrique manquante bloque toute collecte partielle',async()=>{const r=reader();r.data.jc=[];await assert.rejects(()=>collectDatedFolder('2026-10-28',r),/absente/);});
test('les doublons sont signalés et une autre date est exclue',async()=>{const r=reader();r.data.jc.push({...r.data.jc[0],id:'double'});await assert.rejects(()=>collectDatedFolder('2026-10-28',r),/doublon/);assert.equal(await collectDatedFolder('2026-10-29',reader()),null);});
