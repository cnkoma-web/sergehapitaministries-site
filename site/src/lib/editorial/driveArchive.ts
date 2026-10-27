import "server-only";
import { googleReadToken,googleJson,googleResponse } from "./driveGoogle";
import type { EditorialJob } from "./types";
const PUBLISHED_FOLDER="1LxnH_dpGPFGRZ3upwDpaCh1k15euRfL9";
const plain=(s:string)=>s.replace(/<[^>]*>/g,"").replace(/&nbsp;|&#160;/g," ").replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").trim();
export async function archivePublishedDraft(job:EditorialJob, overwrite=false){
  if(job.status!=="published"||!job.draft)throw Error("L’archive attend la publication effective.");
  const token=await googleReadToken(true),name="Publication-"+job.type+"-"+job.article_date;
  const q=new URLSearchParams({q:"'"+PUBLISHED_FOLDER+"' in parents and trashed = false and name = '"+name+"'",fields:"files(id,name)",pageSize:"10"});
  const found=await googleJson("https://www.googleapis.com/drive/v3/files?"+q,token);
  if(found.files?.length>1)throw Error("Archive Drive en double : "+name);
  let id=found.files?.[0]?.id;
  let previousEnd=1;
  if(id){
    // Une archive existante est préservée, y compris les corrections ultérieures.
    const existing=await googleJson("https://docs.googleapis.com/v1/documents/"+id,token);
    previousEnd=Math.max(1,...(existing.body?.content??[]).map((p:any)=>(p.endIndex??1)-1));
    if(!overwrite&&(existing.body?.content??[]).some((p:any)=>(p.paragraph?.elements??[]).some((e:any)=>e.textRun?.content?.trim())))return id;
  }else{
    const params=new URLSearchParams({q:"trashed = false and name = 'PréparationPublication-"+job.type+"-"+job.article_date+"' and mimeType = 'application/vnd.google-apps.document'",fields:"files(id,parents)",pageSize:"10"});
    const reserved=await googleJson("https://www.googleapis.com/drive/v3/files?"+params,token);
    if(reserved.files?.length!==1)throw Error("Document d’archive utilisateur attendu pour "+job.type+" "+job.article_date);
    id=reserved.files[0].id;
  }
  const d=job.draft,rows:{text:string;html?:string;style?:string;bold?:boolean;italic?:boolean}[]=[{text:d.title,style:"TITLE"}];
  if(d.type==="rm")rows.push({text:d.verse_text??"",bold:true});
  if(d.type==="qdlb")rows.push({text:d.excerpt??"",bold:true});
  if(d.type!=="rm")rows.push({text:"« "+d.verse_text+" » — "+d.verse_reference,italic:true});
  const paragraphs=[...d.body.matchAll(/<p>([\s\S]*?)<\/p>/g)].map(m=>m[1]);
  for(const html of paragraphs.length?paragraphs:[d.body])rows.push({text:plain(html),html});
  if(d.prayer)rows.push({text:plain(d.prayer)});
  if(d.further_verses?.length){rows.push({text:"Pour aller plus loin",style:"HEADING_1"});for(const v of d.further_verses)rows.push({text:v.reference+" — "+v.text});}
  if(d.author_name)rows.push({text:d.author_name});
  rows.push({text:"Préparation éditoriale",style:"HEADING_1"},{text:"Date : "+d.article_date+". Rubrique : "+d.type+"."},{text:"État : publié automatiquement à la date prévue. URL : "+job.public_url},{text:"Mots-clés : "+d.seo_keywords.join(", ")},{text:"Publication automatique : ordre permanent de Serge Hapita du 27 octobre 2026."});
  if(d.image_drive_file_id)rows.push({text:"Image : https://drive.google.com/file/d/"+d.image_drive_file_id+"/view"},{text:"Texte alternatif : "+d.cover_alt},{text:"Poids image : "+d.image_bytes+" octets."});
  const text=rows.map(r=>r.text+"\n").join("");
  const requests:any[]=[...(previousEnd>1?[{deleteContentRange:{range:{startIndex:1,endIndex:previousEnd}}}]:[]),{insertText:{location:{index:1},text}},{updateParagraphStyle:{range:{startIndex:1,endIndex:1+text.length},paragraphStyle:{spaceBelow:{magnitude:6,unit:"PT"}},fields:"spaceBelow"}}];
  let start=1;
  for(const row of rows){
    const range={startIndex:start,endIndex:start+row.text.length};
    if(row.style)requests.push({updateParagraphStyle:{range,paragraphStyle:{namedStyleType:row.style},fields:"namedStyleType"}});
    if(row.bold||row.italic)requests.push({updateTextStyle:{range,textStyle:{...(row.bold?{bold:true}:{}),...(row.italic?{italic:true}:{})},fields:[row.bold?"bold":"",row.italic?"italic":""].filter(Boolean).join(",")}});
    if(row.html)for(const match of row.html.matchAll(/<(em|mark|strong)>([\s\S]*?)<\/\1>/g)){
      const segment=plain(match[2]),index=row.text.indexOf(segment);if(index<0)continue;
      const style=match[1]==="em"?{italic:true}:match[1]==="strong"?{bold:true}:{backgroundColor:{color:{rgbColor:{red:1,green:1}}}};
      requests.push({updateTextStyle:{range:{startIndex:start+index,endIndex:start+index+segment.length},textStyle:style,fields:Object.keys(style).join(",")}});
    }
    start+=row.text.length+1;
  }
  await googleResponse("https://docs.googleapis.com/v1/documents/"+id+":batchUpdate",{method:"POST",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({requests})});
  const metadata=await googleJson("https://www.googleapis.com/drive/v3/files/"+id+"?fields=parents,name",token);
  if(metadata.name!==name||!metadata.parents?.includes(PUBLISHED_FOLDER)){
    const params=new URLSearchParams({addParents:PUBLISHED_FOLDER});
    const previous=(metadata.parents??[]).filter((p:string)=>p!==PUBLISHED_FOLDER);if(previous.length)params.set("removeParents",previous.join(","));
    await googleResponse("https://www.googleapis.com/drive/v3/files/"+id+"?"+params,{method:"PATCH",headers:{authorization:"Bearer "+token,"content-type":"application/json"},body:JSON.stringify({name})});
  }
  return id as string;
}
