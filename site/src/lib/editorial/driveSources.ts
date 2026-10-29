import { isEditorialDate } from "../content/dailySourceParser";
import { docParagraphs } from "./driveDocument";
import { fingerprint } from "./checks";
type File={id:string;name:string;mimeType:string};
type Reader={list:(parent:string)=>Promise<File[]>;read:(id:string)=>Promise<any>};
export const SOURCE_FOLDER_ID="1K28hMeY46VFOvgtcNEn-JgvZG68_69NA";
/** Date et nom exacts ; les sources restent dans leur dossier d’origine. */
export async function collectDatedFolder(date:string,reader:Reader) {
  if(!isEditorialDate(date))throw Error("Date de collecte invalide.");
  const dates=(await reader.list(SOURCE_FOLDER_ID)).filter(f=>f.name===date&&f.mimeType==="application/vnd.google-apps.folder");
  if(dates.length>1)throw Error("Plusieurs dossiers sources portent la date "+date);
  if(!dates.length)return null;
  const direct=await reader.list(dates[0].id),files=[...direct];
  for(const folder of direct.filter(f=>f.mimeType==="application/vnd.google-apps.folder"))files.push(...await reader.list(folder.id));
  const sections:{type:string;text:string;revision:string}[]=[];
  for(const type of ["qdlb","rm","jc"]) {
    const matches=files.filter(f=>f.name==="Source-"+type+"-"+date&&f.mimeType==="application/vnd.google-apps.document");
    if(matches.length!==1)throw Error("Source "+type+" du "+date+" : "+(matches.length?"doublon":"absente"));
    const doc=await reader.read(matches[0].id);
    const text=docParagraphs(doc).map(p=>p.text).join("\n").replace(/^\uFEFF/, "").trim();
    if(!text)throw Error("Source vide : "+matches[0].name);
    sections.push({type,text,revision:matches[0].id+":"+String(doc.revisionId??"")});
  }
  const heading=new Intl.DateTimeFormat("fr-FR",{timeZone:"Europe/Paris",weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date(date+"T12:00:00Z")).toUpperCase();
  const labels=["1/ QUE DIT LA BIBLE?","2/ ROSEE MATINALE","3/ JE CONFESSE"];
  return {text:heading+"\n\n"+sections.map((s,i)=>labels[i]+"\n"+s.text).join("\n\n"),revision:fingerprint(sections.map(s=>s.revision))};
}
