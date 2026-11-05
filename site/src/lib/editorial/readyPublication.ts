import 'server-only';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
import type {SupabaseClient} from '@supabase/supabase-js';
import {revalidatePath} from 'next/cache';
import {googleReadToken,googleJson,googleResponse} from './driveGoogle';
import {readReadyPublication} from './readyDocument';
import {docParagraphs} from './driveDocument';
import {fingerprint} from './checks';
import {validatePublicationDraft} from '@/lib/content/publicationValidation';
import {publicationJpeg} from './imageEncoding';
import {publishThroughCms} from './native';
import type {EditorialJob} from './types';
const ROOT='1LxnH_dpGPFGRZ3upwDpaCh1k15euRfL9';
const stem=(s:string)=>s.replace(/\.(jpg|jpeg|png|webp)$/i,'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export async function publishReadyDrive(db:SupabaseClient,date:string,dryRun=false){
 const token=await googleReadToken(),started=new Date().toISOString();
 const list=async(parent:string)=>{const files:any[]=[];let page='';do{const q=new URLSearchParams({q:"'"+parent+"' in parents and trashed = false",fields:'files(id,name,mimeType,size,description),nextPageToken',pageSize:'100'});if(page)q.set('pageToken',page);const r=await googleJson('https://www.googleapis.com/drive/v3/files?'+q,token);files.push(...(r.files??[]));page=r.nextPageToken??'';}while(page);return files;};
 const candidates:{file:any;siblings:any[]}[]=[];
 const walk=async(parent:string,depth:number)=>{const siblings=await list(parent);for(const f of siblings){if(f.mimeType==='application/vnd.google-apps.folder'&&depth<3)await walk(f.id,depth+1);else if(f.mimeType==='application/vnd.google-apps.document'&&new RegExp('^Publication-(jc|rm|qdlb)-'+date+'$').test(f.name))candidates.push({file:f,siblings});}};
 await walk(ROOT,0);
 const outcomes:any[]=[];
 for(const {file,siblings}of candidates){let lease:string|null=null,job:EditorialJob|null=null;
 try{
  const duplicate=candidates.filter(c=>c.file.name===file.name);if(duplicate.length!==1)throw Error('Plusieurs documents finaux portent ce nom.');
  const doc=await googleJson('https://docs.googleapis.com/v1/documents/'+file.id+'?includeTabsContent=true',token),draft=readReadyPublication(doc,file.name);
  const issues=validatePublicationDraft(draft);if(issues.length)throw Error(issues.map(x=>x.message).join('\n'));
  const images=siblings.filter(f=>/^image\/(jpeg|png|webp)$/.test(f.mimeType));
  const exact=images.filter(f=>stem(f.name)===stem(draft.title)||stem(f.name)===stem(file.name));
  let image=exact.length===1?exact[0]:null;
  if(exact.length>1)throw Error('Plusieurs images correspondent au titre final.');
  if(!image&&images.length===1&&siblings.filter(f=>/^Publication-/.test(f.name)).length===1)image=images[0];
  if(!image){outcomes.push({document:file.name,type:draft.type,title:draft.title,status:'image finale attendue dans le même dossier',error:'Image finale absente ou ambiguë.'});continue;}
  if(Number(image.size)>20000000)throw Error('Image source supérieure à 20 Mo.');
  const response=await googleResponse('https://www.googleapis.com/drive/v3/files/'+image.id+'?alt=media',{headers:{authorization:'Bearer '+token}});
  const raw=Buffer.from(await response.arrayBuffer());if(!raw.length||raw.length>20000000)throw Error('Image source vide ou trop volumineuse.');
  let bytes=raw,info=await sharp(raw).metadata();
  if(bytes.length>800000){const converted=await publicationJpeg(raw);bytes=converted.bytes;info=await sharp(bytes).metadata();}
  if(!['jpeg','png','webp'].includes(info.format??''))throw Error('Format d’image non pris en charge.');
  const assetHash=createHash('sha256').update(bytes).digest('hex'),contentHash=fingerprint({draft,image:image.id,assetHash});
  const found=await db.from('editorial_jobs').select('*').eq('type',draft.type).eq('article_date',date).maybeSingle();if(found.error)throw found.error;job=found.data;
  const actor='drive-ready:'+file.id+':'+contentHash;
  if(job?.status==='published'&&job.approved_by===actor){outcomes.push({document:file.name,status:'déjà publié, version conservée',url:job.public_url});continue;}
  if(dryRun){outcomes.push({document:file.name,type:draft.type,title:draft.title,status:'texte final et image prêts',image:image.name,bytes:bytes.length,paragraphs:docParagraphs(doc).length});continue;}
  const previous=await db.from('articles').select('*').eq('type',draft.type).eq('article_date',date).maybeSingle();if(previous.error)throw previous.error;
  if(!job){const inserted=await db.from('editorial_jobs').insert({type:draft.type,article_date:date,source:'Contenu final Drive : '+file.id,source_hash:contentHash,source_revision:String(doc.revisionId??''),article_id:previous.data?.id??null,status:'review'}).select('*').single();if(inserted.error)throw inserted.error;job=inserted.data;}
  if(!job)throw Error('Travail de publication absent.');
  lease=crypto.randomUUID();const lock=await db.from('editorial_jobs').update({status:'publishing',lease_token:lease,lease_until:new Date(Date.now()+600000).toISOString()}).eq('id',job.id).eq('status',job.status).or('lease_until.is.null,lease_until.lt.'+started).select('id').single();if(lock.error)throw Error('Publication déjà en cours.');
  const ext=info.format==='jpeg'?'jpg':info.format,path='ready/'+date+'/'+draft.type+'/'+assetHash+'.'+ext,bucket=db.storage.from('article-covers');
  const upload=await bucket.upload(path,bytes,{contentType:info.format==='jpeg'?'image/jpeg':'image/'+info.format,upsert:true});if(upload.error)throw upload.error;
  draft.cover_url=bucket.getPublicUrl(path).data.publicUrl;draft.cover_alt=draft.cover_alt||image.description||previous.data?.cover_alt||draft.title;
  draft.image_bytes=bytes.length;draft.image_width=info.width;draft.image_height=info.height;draft.image_drive_file_id=image.id;
  if(!draft.seo_keywords.length)draft.seo_keywords=previous.data?.seo_keywords??[];
  if(!draft.seo_keywords.length){const words=docParagraphs(doc).flatMap(p=>p.text.match(/[\p{L}][\p{L}’'-]{4,}/gu)??[]);draft.seo_keywords=[...new Set([draft.title,...words.map(w=>w.toLocaleLowerCase('fr'))])].slice(0,25);}
  const reread=await googleJson('https://docs.googleapis.com/v1/documents/'+file.id+'?includeTabsContent=true',token);
  if(fingerprint(readReadyPublication(reread,file.name))!==fingerprint(readReadyPublication(doc,file.name)))throw Error('Le document final a changé pendant sa récupération.');
  const article=await publishThroughCms(db,{...job,draft});const url='https://sergehapitaministries.org'+article.path;
  const hash=fingerprint({source_hash:contentHash,draft});const saved=await db.from('editorial_jobs').update({source:'Contenu final Drive : '+file.id,source_hash:contentHash,source_revision:String(doc.revisionId??''),draft,draft_hash:hash,approved_hash:hash,approved_by:actor,approved_at:started,article_id:article.id,public_url:url,status:'published',last_error:null,lease_token:null,lease_until:null,updated_at:new Date().toISOString()}).eq('id',job.id).eq('lease_token',lease);if(saved.error)throw saved.error;
  for(const p of [article.path,'/','/publications','/rosee-matinale','/publications/que-dit-la-bible','/publications/je-confesse-et-declare','/sitemap.xml'])revalidatePath(p);
  outcomes.push({document:file.name,type:draft.type,status:'publié fidèlement avec son image',url});
 }catch(e){const error=e instanceof Error?e.message:String(e);if(job&&lease)await db.from('editorial_jobs').update({status:job.status,last_error:error,lease_token:null,lease_until:null}).eq('id',job.id).eq('lease_token',lease);outcomes.push({document:file.name,status:'erreur',error});}
 }
 const result={success:!outcomes.some(o=>o.error),date,dryRun,outcomes,status:candidates.length?'traitement terminé':'contenus finaux attendus dans Publiées'};
 if(!dryRun){const log=await db.from('editorial_runs').insert({started_at:started,target_date:date,status:result.success?'ok':'failed',detail:JSON.stringify({mode:'publication directe depuis Publiées',...result})});if(log.error)throw log.error;}
 return result;
}
