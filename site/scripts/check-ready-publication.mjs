import {spawn}from'node:child_process';import{setTimeout as delay}from'node:timers/promises';
if(process.env.VERCEL_ENV!=='production')process.exit(0);const key=process.env.CRON_SECRET;if(!key)throw Error('Authentification absente');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
try{let ready=false;for(let n=0;n<100;n++){try{const r=await fetch('http://127.0.0.1:3217/api/cron/ready');if(r.status===401){ready=true;break;}}catch{}await delay(200);}if(!ready)throw Error('CMS indisponible');
const headers={authorization:'Bearer '+key};
for(const name of ['editorial','publish','images','drive']){const r=await fetch('http://127.0.0.1:3217/api/cron/'+name,{headers});const d=await r.json();if(!r.ok||d.retired!==true)throw Error('Ancien circuit encore actif : '+name);}
const scheduled=await fetch('http://127.0.0.1:3217/api/cron/ready',{headers});const status=await scheduled.json();if(!scheduled.ok||!status.skipped)throw Error('Publication hors créneau interdite');console.log('[Ancien circuit retiré, nouveau créneau protégé]',JSON.stringify(status));
for(const date of ['2026-10-28','2026-10-29']){const r=await fetch('http://127.0.0.1:3217/api/cron/ready?check=1&date='+date,{headers,signal:AbortSignal.timeout(300000)});const d=await r.json();if(d.error||d.dryRun!==true)throw Error('Contrôle Drive en échec : '+JSON.stringify(d));console.log('[Lecture seule des contenus finaux]',JSON.stringify(d));}
}finally{server.kill('SIGTERM');}
