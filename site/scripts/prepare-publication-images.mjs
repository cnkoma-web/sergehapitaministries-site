import {spawn} from 'node:child_process';import {setTimeout as delay} from 'node:timers/promises';
if(process.env.VERCEL_ENV!=='production')process.exit(0);
const key=process.env.CRON_SECRET;if(!key||key.length<32)throw Error('Authentification absente.');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
const endpoint='http://127.0.0.1:3217/api/cron/images';
try{
 let ready=false;for(let n=0;n<100;n++){if(server.exitCode!==null)throw Error('Serveur arrêté.');try{const r=await fetch(endpoint);if(r.status===401){ready=true;break;}}catch{}await delay(200);}
 if(!ready)throw Error('CMS indisponible.');
 const r=await fetch(endpoint,{headers:{authorization:'Bearer '+key},signal:AbortSignal.timeout(550000)});const data=await r.json();console.log('[Images automatiques]',JSON.stringify(data));if(!r.ok)throw Error('Génération d’image en échec.');
 if(data.skipped)throw Error('Génération à effectuer après les textes dans la plage de préparation.');
 const check=await fetch('http://127.0.0.1:3217/api/cron/publish?check=1',{headers:{authorization:'Bearer '+key}});const result=await check.json();console.log('[Textes et images prêts]',JSON.stringify(result));if(!check.ok)throw Error('Contrôle de publication en échec.');
}finally{server.kill('SIGTERM');}
