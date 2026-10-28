import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
if(process.env.VERCEL_ENV!=='production'){console.log('Synchronisation réservée à la production.');process.exit(0);}
const key=process.env.CRON_SECRET;if(!key||key.length<32)throw Error('Authentification du traitement absente.');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
const endpoint='http://127.0.0.1:3217/api/cron/drive';
try {
 let ready=false;for(let i=0;i<100;i++){if(server.exitCode!==null)throw Error('CMS arrêté.');try{const r=await fetch(endpoint);if(r.status===401){ready=true;break;}}catch{}await delay(200);}
 if(!ready)throw Error('CMS indisponible.');
 const check=await fetch(endpoint+'?check=1',{headers:{authorization:'Bearer '+key},signal:AbortSignal.timeout(180000)});
 const checked=await check.json();console.log('[Drive contrôle]',JSON.stringify(checked));if(!check.ok)throw Error('Contrôle Drive en échec.');
 const response=await fetch(endpoint,{headers:{authorization:'Bearer '+key},signal:AbortSignal.timeout(500000)});
 const result=await response.json();console.log('[Drive publication]',JSON.stringify(result));if(!response.ok)throw Error('Synchronisation Drive en échec.');
}finally{server.kill('SIGTERM');}
