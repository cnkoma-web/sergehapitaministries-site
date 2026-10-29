import { createSign,createHash } from 'node:crypto';
import {mkdir,writeFile} from 'node:fs/promises';
const account=JSON.parse(process.env.EDITORIAL_GOOGLE_SERVICE_ACCOUNT_JSON??process.env.GA_SERVICE_ACCOUNT_JSON??'{}');
if(!account.client_email||!account.private_key)throw Error('Compte de collecte absent');
const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url'),now=Math.floor(Date.now()/1000);
const claim=enc({alg:'RS256',typ:'JWT'})+'.'+enc({iss:account.client_email,scope:'https://www.googleapis.com/auth/drive.readonly',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:claim+'.'+createSign('RSA-SHA256').update(claim).sign(account.private_key,'base64url')})});
if(!r.ok)throw Error('Authentification Google HTTP '+r.status);
const {access_token}=await r.json();
await mkdir('public/editorial/2026-10-27',{recursive:true});
for(const [type,id,sha] of [['jc','1c4QGVjaZejV5CvlPJecMLb2JBII6aMQH','bba29fc069523c0bcce12cc4e8d3abddd8045b257e16e6907b925368056be440'],['qdlb','15FD11vS04Yh2FASKK77OCIP7U9IhyNYe','a63c83f5b814f267aafdcd1e4c3c659fabb1f5c012164abde93e2674d6ec5063']]){
 const image=await fetch('https://www.googleapis.com/drive/v3/files/'+id+'?alt=media',{headers:{authorization:'Bearer '+access_token},signal:AbortSignal.timeout(60000)});
 if(!image.ok)throw Error('Image '+type+' HTTP '+image.status);
 const bytes=Buffer.from(await image.arrayBuffer());
 if(createHash('sha256').update(bytes).digest('hex')!==sha)throw Error('Image validée modifiée : '+type);
 await writeFile('public/editorial/2026-10-27/'+type+'.png',bytes);
 console.log('[publication27] Image validée récupérée : '+type);
}
