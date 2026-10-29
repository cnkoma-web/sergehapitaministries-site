import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import{stripTypeScriptTypes}from'node:module';
let code=await readFile(new URL('../src/lib/editorial/readyDocument.ts',import.meta.url),'utf8');
let docCode=await readFile(new URL('../src/lib/editorial/driveDocument.ts',import.meta.url),'utf8');docCode=docCode.replace('"./checks"',JSON.stringify(new URL('../src/lib/editorial/checks.ts',import.meta.url).href));docCode=docCode.replace(/import type[^;]+;/g,'');
const docUrl='data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(docCode)).toString('base64');
code=code.replace("'./driveDocument'",JSON.stringify(docUrl)).replace(/import type[^;]+;/g,'');
const{readReadyPublication,readyWindow}=await import('data:text/javascript;base64,'+Buffer.from(stripTypeScriptTypes(code)).toString('base64'));
const makeDoc=rows=>({body:{content:rows.map(row=>({paragraph:{elements:Array.isArray(row)?row:[{textRun:{content:row+'\n'}}]}}))}});
test('le contenu final garde ses mots, son gras, ses italiques et ses trois versets',()=>{
const d=readReadyPublication(makeDoc(['LE PHÉNOMÈNE DU SALUT','Chapeau déjà rédigé.','« Texte biblique exact » — Psaume 27:1',[{textRun:{content:'Développement prêt : '}},{textRun:{content:'terme grec',textStyle:{italic:true}}},{textRun:{content:' et '}},{textRun:{content:'phrase forte.',textStyle:{bold:true}}}],'Prière','Père, voici la prière préparée.','Pour aller plus loin','Ésaïe 12:2','« Citation une. »','2 Timothée 1:7','« Citation deux. »','Psaume 118:14','« Citation trois. »']),'Publication-qdlb-2026-10-29');
assert.equal(d.title,'LE PHÉNOMÈNE DU SALUT');assert.equal(d.excerpt,'Chapeau déjà rédigé.');assert.equal(d.body,'<p>Développement prêt : <em>terme grec</em> et <strong>phrase forte.</strong></p>');assert.equal(d.prayer,'Père, voici la prière préparée.');assert.equal(d.further_verses.length,3);assert.ok(!d.body.includes('Prière'));
});
test('Rosée et Je Confesse gardent leurs champs dédiés',()=>{
const rm=readReadyPublication(makeDoc(['Titre','Une phrase. Deux phrases.','Corps final.']),'Publication-rm-2026-10-29');assert.equal(rm.verse_text,'Une phrase. Deux phrases.');assert.equal(rm.body,'<p>Corps final.</p>');
const jc=readReadyPublication(makeDoc(['Titre','« Verset » — Jean 3:16','Je confesse le texte préparé.']),'Publication-jc-2026-10-29');assert.equal(jc.verse_reference,'Jean 3:16');assert.equal(jc.author_name,null);
});
test('publication à 23 h Paris dès le 28 octobre, été et hiver',()=>{
assert.equal(readyWindow(new Date('2026-10-27T22:00:00Z')).due,false);
assert.equal(readyWindow(new Date('2026-10-28T21:00:00Z')).due,false);
assert.equal(readyWindow(new Date('2026-10-28T22:00:00Z')).due,true);
assert.equal(readyWindow(new Date('2026-10-28T22:00:00Z')).date,'2026-10-29');
assert.equal(readyWindow(new Date('2026-10-28T23:00:00Z')).due,false);
assert.equal(readyWindow(new Date('2027-06-28T21:00:00Z')).due,true);
assert.equal(readyWindow(new Date('2027-06-28T21:00:00Z')).date,'2027-06-29');
assert.equal(readyWindow(new Date('2027-06-28T22:00:00Z')).due,false);
assert.equal(readyWindow(new Date('2027-03-27T22:00:00Z')).due,true);
assert.equal(readyWindow(new Date('2027-03-28T21:00:00Z')).due,true);
assert.equal(readyWindow(new Date('2027-10-30T21:00:00Z')).due,true);
assert.equal(readyWindow(new Date('2027-10-31T22:00:00Z')).due,true);
});
test('le lendemain suit le calendrier parisien aux fins de mois, année et changements d’heure',()=>{
for(const [instant,date] of [
 ['2026-10-29T22:00:00Z','2026-10-30'],
 ['2026-10-31T22:00:00Z','2026-11-01'],
 ['2026-12-31T22:00:00Z','2027-01-01'],
 ['2027-02-28T22:00:00Z','2027-03-01'],
 ['2028-02-28T22:00:00Z','2028-02-29'],
 ['2028-02-29T22:00:00Z','2028-03-01'],
 ['2027-03-27T22:00:00Z','2027-03-28'],
 ['2027-03-28T21:00:00Z','2027-03-29'],
 ['2027-10-30T21:00:00Z','2027-10-31'],
 ['2027-10-31T22:00:00Z','2027-11-01'],
]) assert.deepEqual(readyWindow(new Date(instant)),{date,due:true},instant);
});

// Exercer la route réelle avec une horloge et un CMS isolés : aucune écriture externe.
async function routeAt(instant){
 const source=await readFile(new URL('../src/app/api/cron/ready/route.ts',import.meta.url),'utf8');
 const js=stripTypeScriptTypes(source.replace(/^import .*;\n/gm,'')).replace(/export /g,'');
 const calls=[];
 const GET=new Function('validBearer','createServiceRoleClient','readyWindow','publishReadyDrive','process',js+';return GET;')(
  ()=>true,()=>({}),()=>readyWindow(new Date(instant)),async(_db,date,dryRun)=>{calls.push({date,dryRun});return{success:true,date,dryRun};},{env:{VERCEL_ENV:'production',CRON_SECRET:'test'}}
 );
 return{GET,calls};
}
test('la route transmet J+1 au CMS, même si un appel de production fournit une autre date',async()=>{
 const {GET,calls}=await routeAt('2026-10-28T22:00:00Z');
 const response=await GET(new Request('https://site.test/api/cron/ready?date=2026-10-28'));
 assert.equal(response.status,200);
 assert.deepEqual(calls,[{date:'2026-10-29',dryRun:false}]);
});
test('le créneau UTC inactif ne lance aucune publication',async()=>{
 const {GET,calls}=await routeAt('2027-06-28T22:00:00Z');
 await GET(new Request('https://site.test/api/cron/ready'));
 assert.deepEqual(calls,[]);
});
test('le contrôle peut viser J explicitement hors 23 h, en lecture seule',async()=>{
 const {GET,calls}=await routeAt('2026-10-29T07:20:00Z');
 await GET(new Request('https://site.test/api/cron/ready?check=1&date=2026-10-29'));
 assert.deepEqual(calls,[{date:'2026-10-29',dryRun:true}]);
});
test('les anciens chemins sont retirés et un seul déclenchement métier est programmé',async()=>{
const config=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));assert.deepEqual(config.crons,[{path:'/api/cron/ready',schedule:'0 21,22 * * *'}]);
for(const name of ['editorial','images','publish','drive']){const route=await readFile(new URL('../src/app/api/cron/'+name+'/route.ts',import.meta.url),'utf8');assert.ok(route.includes('retired:true'));assert.ok(!route.includes('prepareJob'));}
const processor=await readFile(new URL('../src/lib/editorial/readyPublication.ts',import.meta.url),'utf8');assert.ok(!processor.includes('writeDraft'));assert.ok(!processor.includes('illustrate('));assert.ok(processor.includes('publishThroughCms'));assert.ok(!processor.includes('1K28hMeY'));
});

