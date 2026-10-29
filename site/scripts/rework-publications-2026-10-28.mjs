import http from 'node:http';
import {spawn} from 'node:child_process';import{setTimeout as delay}from'node:timers/promises';
if(process.env.VERCEL_ENV!=='production')process.exit(0);
const key=process.env.CRON_SECRET;if(!key)throw Error('Authentification absente');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-H','127.0.0.1','-p','3217'],{env:process.env,stdio:'inherit'});
try{
 let ready=false;for(let n=0;n<100;n++){try{const r=await fetch('http://127.0.0.1:3217/api/cron/editorial');if(r.status===401){ready=true;break;}}catch{}await delay(200);}if(!ready)throw Error('CMS indisponible');
 for(const type of ['qdlb','rm','jc']){
 const {r,d}=await new Promise((resolve,reject)=>{const req=http.request('http://127.0.0.1:3217/api/cron/rework',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json'}},res=>{let text='';res.on('data',c=>text+=c);res.on('end',()=>{try{resolve({r:{ok:res.statusCode===200},d:JSON.parse(text)});}catch(e){reject(e);}});});req.on('error',reject);req.setTimeout(900000,()=>req.destroy(Error('Délai de reprise dépassé')));req.end(JSON.stringify({type}));});console.log('[Reprise éditoriale 28]',JSON.stringify(d));if(!r.ok)throw Error('Reprise interrompue : '+JSON.stringify(d));
 }
}finally{server.kill('SIGTERM');}
