"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const MEDIA_CONTENT_TYPES: Record<string, string> = {
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  mp4: "video/mp4",
  aac: "audio/aac",
  wav: "audio/wav",
  ogg: "audio/ogg",
  opus: "audio/opus",
  flac: "audio/flac",
  webm: "audio/webm",
  mov: "video/quicktime",
};

const ACCEPTED_MEDIA_EXTENSIONS = new Set(Object.keys(MEDIA_CONTENT_TYPES));

export default function PodcastMediaField({currentUrl}:{currentUrl:string}) {
 const [url,setUrl]=useState(currentUrl); const [busy,setBusy]=useState(false); const [error,setError]=useState<string|null>(null);
 async function upload(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0]; if(!file)return; setError(null);
  if(file.size>200*1024*1024){setError("Le fichier dépasse 200 Mo.");e.target.value="";return;}
  const ext=file.name.split(".").pop()?.toLowerCase()||"";
  const contentType =
    file.type.startsWith("audio/") || file.type.startsWith("video/")
      ? file.type
      : MEDIA_CONTENT_TYPES[ext];
  if(!ACCEPTED_MEDIA_EXTENSIONS.has(ext)||!contentType){
   setError("Format non reconnu. Utilisez AAC, MP3, M4A, WAV, OGG, OPUS, FLAC, MP4, WEBM ou MOV.");
   e.target.value="";
   return;
  }
  setBusy(true);
  const path=`${crypto.randomUUID()}.${ext}`; const supabase=createClient();
  const {error:uploadError}=await supabase.storage.from("podcast-media").upload(path,file,{cacheControl:"31536000",upsert:false,contentType});
  if(uploadError){setError(`Échec de l'envoi : ${uploadError.message}`);setBusy(false);return;}
  setUrl(supabase.storage.from("podcast-media").getPublicUrl(path).data.publicUrl); setBusy(false);
 }
 return <div className="podcast-media-field">
  <input type="url" name="audio_url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Lien de la publication Substack ou URL audio directe" required/>
  <label className="admin-file-picker"><span>{busy?"Envoi en cours…":"Importer un audio ou une vidéo"}</span><input type="file" accept=".aac,.mp3,.m4a,.wav,.ogg,.opus,.flac,.mp4,.webm,.mov,audio/*,video/*" onChange={upload} disabled={busy}/></label>
  <small>Formats acceptés : AAC, MP3, M4A, WAV, OGG, OPUS, FLAC, MP4, WEBM et MOV (200 Mo maximum). Vous pouvez également coller un lien Substack ou une URL directe.</small>
  {error&&<div className="admin-feedback error" role="alert">{error}</div>}
 </div>;
}
