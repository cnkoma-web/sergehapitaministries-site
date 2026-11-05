import {spawn} from 'node:child_process';import {setTimeout as delay} from 'node:timers/promises';
if(process.env.VERCEL_ENV!=='production')process.exit(0);
const key=process.env.CRON_SECRET;if(!key||key.length<32)throw Error('Authentification absente.');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
const endpoint='http://127.0.0.1:3217/api/cron/publish';
try{
 let ready=false;for(let n=0;n<100;n++){if(server.exitCode!==null)throw Error('Serveur arrêté.');try{const r=await fetch(endpoint);if(r.status===401){ready=true;break;}}catch{}await delay(200);}
 if(!ready)throw Error('CMS indisponible.');
 const r=await fetch(endpoint+'?check=1',{headers:{authorization:'Bearer '+key},signal:AbortSignal.timeout(60000)});const data=await r.json();console.log('[Contrôle publication minuit]',JSON.stringify(data));if(!r.ok)throw Error('Contrôle en échec.');
 // Vérifie que le déclenchement anticipé est refusé sans publier.
 const hour=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Paris',hour:'2-digit',hourCycle:'h23'}).format(new Date());
 if(hour!=='00'){const gate=await fetch(endpoint,{headers:{authorization:'Bearer '+key}});const result=await gate.json();if(result.skipped!=='publication-at-paris-midnight')throw Error('Barrière horaire incorrecte.');console.log('[Barrière minuit] OK');}
}finally{server.kill('SIGTERM');}
