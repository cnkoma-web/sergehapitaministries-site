import {docParagraphs} from './driveDocument';
import type {EditorialDraft} from './types';
const key=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const html=(p:{html:string}[])=>p.map(r=>'<p>'+r.html+'</p>').join('\n');
export function readReadyPublication(doc:any,name:string):EditorialDraft{
 const file=/^Publication-(jc|rm|qdlb)-(\d{4}-\d{2}-\d{2})$/.exec(name);if(!file)throw Error('Nom de publication attendu : Publication-[code]-[AAAA-MM-JJ].');
 const rows=docParagraphs(doc),boundary=rows.findIndex(r=>key(r.text)==='preparation editoriale');
 const main=boundary<0?rows:rows.slice(0,boundary),meta=boundary<0?[]:rows.slice(boundary+1);
 if(main.length<3)throw Error('Document final incomplet.');
 const type=file[1] as 'jc'|'rm'|'qdlb';
 const draft:EditorialDraft={type,article_date:file[2],title:main[0].text,body:'',verse_text:null,verse_reference:null,excerpt:null,prayer:null,further_verses:[],author_name:type==='qdlb'?'Serge Hapita':null,seo_keywords:[],cover_alt:null,image_prompt:'Image finale fournie dans Publiées.'};
 const keywords=meta.find(r=>/^Mots-clés\s*:/i.test(r.text));if(keywords)draft.seo_keywords=keywords.text.replace(/^[^:]+:\s*/,'').split(/,\s*/).filter(Boolean);
 const alt=meta.find(r=>/^Texte alternatif\s*:/i.test(r.text));if(alt)draft.cover_alt=alt.text.replace(/^[^:]+:\s*/,'');
 const opening=(text:string)=>{const m=/^«\s*([\s\S]+?)\s*»\s*[—–-]\s*(.+)$/.exec(text);if(!m)throw Error('Verset d’ouverture et référence non reconnus.');draft.verse_text=m[1];draft.verse_reference=m[2];};
 if(type==='rm'){draft.verse_text=main[1].text;draft.body=html(main.slice(2));return draft;}
 if(type==='jc'){opening(main[1].text);draft.body=html(main.slice(2));return draft;}
 draft.excerpt=main[1].text;opening(main[2].text);
 const prayer=main.findIndex(r=>/^(priere|affirmation|declaration)$/.test(key(r.text)));
 const further=main.findIndex(r=>key(r.text)==='pour aller plus loin');
 let bodyEnd=prayer>=0?prayer:further>=0?further:main.length;
 if(prayer>=0)draft.prayer=main.slice(prayer+1,further>=0?further:main.length).filter(r=>r.text!=='Serge Hapita').map(r=>r.text).join('\n\n');
 else if(further>3&&/^(Cher |Père|Seigneur|Je confesse)/i.test(main[further-1].text)){bodyEnd=further-1;draft.prayer=main[further-1].text;}
 draft.body=html(main.slice(3,bodyEnd).filter(r=>r.text!=='Serge Hapita'));
 if(further>=0){const verses=main.slice(further+1).filter(r=>r.text!=='Serge Hapita');for(let i=0;i<verses.length;i++){
  const combined=/^(.+?\d+:\d+(?:-\d+)?)\s*[—–]\s*(.+)$/.exec(verses[i].text);
  if(combined){draft.further_verses!.push({reference:combined[1],text:combined[2].replace(/^«\s*|\s*»$/g,'')});continue;}
  const reference=verses[i].text,text=verses[++i]?.text;
  if(!/^.+\d+:\d+(?:-\d+)?$/.test(reference)||!text)throw Error('Passage complémentaire incomplet.');
  draft.further_verses!.push({reference,text:text.replace(/^«\s*|\s*»$/g,'')});
 }}return draft;
}
export function readyWindow(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now),get=(k:string)=>parts.find(p=>p.type===k)!.value;
 const date=get('year')+'-'+get('month')+'-'+get('day');return{date,due:date>='2026-10-29'&&get('hour')==='00'};
}
