import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {editorialChecks} from '../src/lib/editorial/checks.ts';
import {validatePublicationDraft} from '../src/lib/content/publicationValidation.ts';
const drafts=JSON.parse(await readFile(new URL('./revisions-approved-2026-10-27.json',import.meta.url),'utf8'));
if(drafts.length!==2||new Set(drafts.map(x=>x.type)).size!==2)throw Error('Deux corrections autorisées attendues');
for(const d of drafts){
 if(!['jc','rm'].includes(d.type)||d.article_date!=='2026-10-27')throw Error('Correction non autorisée');
 const issues=[...validatePublicationDraft(d),...editorialChecks(d)];if(issues.length)throw Error(JSON.stringify(issues));
}
if(!process.argv.includes('--execute')){console.log('Deux textes validés contrôlés ; aucune écriture.');process.exit(0);}
if(process.env.VERCEL_ENV!=='production')throw Error('Production uniquement');
const secret=process.env.EDITORIAL_OPERATOR_SECRET;if(!secret||secret.length<32)throw Error('Opérateur absent');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:{...process.env,EDITORIAL_OPERATOR_DATE:'2026-10-27'},stdio:'ignore'});
const endpoint='http://127.0.0.1:3217/api/editorial';
async function action(action,extra={}){
 const r=await fetch(endpoint,{method:'POST',headers:{authorization:'Bearer '+secret,'content-type':'application/json'},body:JSON.stringify({date:'2026-10-27',action,...extra}),signal:AbortSignal.timeout(60000)});
 const value=await r.json();if(!r.ok)throw Error('CMS '+r.status+' '+JSON.stringify(value));return value;
}
try{
 let ready=false;for(let n=0;n<100;n++){
  if(server.exitCode!==null)throw Error('Serveur arrêté');
  try{const r=await fetch(endpoint);if(r.status===405){ready=true;break;}}catch{}
  await delay(200);
 }
 if(!ready)throw Error('CMS indisponible');
 for(const d of drafts){
  let job=(await action('list')).jobs.find(j=>j.type===d.type);
  if(!job||!job.article_id)throw Error('Article existant absent');
  if(job.status==='published'&&job.draft.body===d.body&&job.draft.title===d.title){console.log('Correction déjà présente : '+d.type);continue;}
  await action('replace',{id:job.id,draft:d});
  job=(await action('list')).jobs.find(j=>j.id===job.id);
  await action('approve',{id:job.id,hash:job.draft_hash,confirmSource:true,confirmBible:true,confirmImage:false});
  const result=await action('publish',{id:job.id});
  console.log('Correction publiée par le CMS : '+d.type+' '+result.job.public_url);
 }
}finally{server.kill('SIGTERM');}
