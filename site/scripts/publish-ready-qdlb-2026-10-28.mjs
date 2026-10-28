import http from 'node:http';import{spawn}from'node:child_process';import{setTimeout as delay}from'node:timers/promises';
if(process.env.VERCEL_ENV!=='production')process.exit(0);const key=process.env.CRON_SECRET;if(!key)throw Error('Authentification absente');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
try{let ready=false;for(let n=0;n<100;n++){try{const r=await fetch('http://127.0.0.1:3217/api/cron/ready');if(r.status===401){ready=true;break;}}catch{}await delay(200);}if(!ready)throw Error('CMS indisponible');
const d=await new Promise((resolve,reject)=>{const req=http.request('http://127.0.0.1:3217/api/cron/ready',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'}},res=>{let text='';res.on('data',c=>text+=c);res.on('end',()=>{try{const d=JSON.parse(text);if(res.statusCode!==200)reject(Error(JSON.stringify(d)));else resolve(d);}catch(e){reject(e);}});});req.on('error',reject);req.setTimeout(300000,()=>req.destroy(Error('Délai dépassé')));req.end(JSON.stringify({date:'2026-10-28',type:'qdlb'}));});
if(!d.success||d.outcomes.length!==1||!d.outcomes[0].url)throw Error('Publication finale non confirmée : '+JSON.stringify(d));
const page=await fetch('http://127.0.0.1:3217'+new URL(d.outcomes[0].url).pathname,{cache:'no-store'});if(!page.ok)throw Error('Page publique locale indisponible');console.log('[Publication fidèle de Que dit la Bible]',JSON.stringify(d));
}finally{server.kill('SIGTERM');}
