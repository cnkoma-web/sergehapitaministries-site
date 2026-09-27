"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PodcastMediaField({currentUrl}:{currentUrl:string}) {
 const [url,setUrl]=useState(currentUrl); const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null);
 async function upload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0]; if(!file)return; setError(null);
  if(file.size>200*1024*1024){setError("Le fichier dépasse 200 Mo.");e.target.value="";return;}
  if(!file.type.startsWith("audio/")&&!file.type.startsWith("video/")){setError("Choisissez un fichier audio ou vidéo.");return;}
  setBusy(true);
  const ext=file.name.split(".").pop()?.toLowerCase()||"bin"; const path=`${crypto.randomUUID()}.${ext}`; const supabase=createClient();
  const {error:uploadError}=await supabase.storage.from("podcast-media").upload(path,file,{cacheControl:"31536000",upsert:false,contentType:file.type});
  if(uploadError){setError(`Échec de l'envoi : ${uploadError.message}`);setBusy(false);return;}
  setUrl(supabase.storage.from("podcast-media").getPublicUrl(path).data.publicUrl); setBusy(false);
 }
 return <div className="podcast-media-field">
  <input type="url" name="audio_url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://…" required/>
  <label className="admin-file-picker"><span>{busy?"Envoi en cours…":"Importer un audio ou une vidéo"}</span><input type="file" accept="audio/*,video/*" onChange={upload} disabled={busy}/></label>
  <small>Vous pouvez coller un lien externe ou importer un fichier audio/vidéo (200 Mo maximum).</small>
  {error&&<div className="admin-feedback error" role="alert">{error}</div>}
 </div>;
}
