import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
if(process.env.VERCEL_ENV!=='production'){console.log('Préparation réservée à la production.');process.exit(0);}
const key=process.env.CRON_SECRET;if(!key||key.length<32)throw Error('Authentification du traitement absente.');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
const endpoint='http://127.0.0.1:3217/api/cron/editorial';
try{
 let ready=false;for(let n=0;n<100;n++){if(server.exitCode!==null)throw Error('CMS arrêté.');try{const r=await fetch(endpoint);if(r.status===401){ready=true;break;}}catch{}await delay(200);}
 if(!ready)throw Error('CMS indisponible.');
 for(let n=0;n<3;n++){
  const response=await fetch(endpoint,{headers:{authorization:'Bearer '+key},signal:AbortSignal.timeout(500000)});
  const result=await response.json();console.log('[Préparation lendemain]',JSON.stringify(result));
  if(!response.ok)throw Error('Préparation interrompue : '+JSON.stringify(result));
  if(result.skipped)throw Error('Contrôle à effectuer pendant la plage de préparation.');
 }
}finally{server.kill('SIGTERM');}
