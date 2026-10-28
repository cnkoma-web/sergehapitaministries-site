import { fingerprint } from "./checks";
import type { EditorialDraft } from "./types";

type Run = { textRun?: { content?: string; textStyle?: { bold?: boolean; italic?: boolean; backgroundColor?: { color?: { rgbColor?: { red?: number; green?: number; blue?: number } } } } } };
type Paragraph = { text: string; html: string };
export type DriveApproval = { draft: EditorialDraft; asset: { id: string; sha256: string } | null; hash: string; approved: boolean };
const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Native Docs and connector readback have the same content, with different tab wrappers.
export function docParagraphs(doc: any): Paragraph[] {
  const result: Paragraph[] = [];
  function content(items: any[]) {
    for (const item of items ?? []) {
      if (!item.paragraph) continue;
      const runs: Run[] = item.paragraph.elements ?? [];
      const text = runs.map(r => r.textRun?.content ?? "").join("").trim();
      if (!text) continue;
      const html = runs.map(r => {
        const value = r.textRun; if (!value) return "";
        let text = escape((value.content ?? "").replace(/\n/g, ""));
        if (!text) return "";
        if (value.textStyle?.italic) text = "<em>" + text + "</em>";
        // Bold is used for titles/chapeaux; retain it inside the development too.
        if (value.textStyle?.bold) text = "<strong>" + text + "</strong>";
        const rgb = value.textStyle?.backgroundColor?.color?.rgbColor;
        if (rgb && (rgb.red ?? 0) > .8 && (rgb.green ?? 0) > .8 && (rgb.blue ?? 0) < .4) text = "<mark>" + text + "</mark>";
        return text;
      }).join("").trim();
      result.push({text, html});
    }
  }
  function tab(t: any) { content((t.documentTab ?? t).body?.content); for (const c of t.childTabs ?? []) tab(c); }
  if (doc.tabs?.length) doc.tabs.forEach(tab); else content(doc.body?.content);
  return result;
}
export function readDriveApproval(doc: any, filename: string): DriveApproval {
  const match = /^Publication-(jc|rm|qdlb)-(\d{4}-\d{2}-\d{2})$/.exec(filename);
  if (!match) throw Error("Nom de publication invalide.");
  const type = match[1] as "jc" | "rm" | "qdlb";
  const rows = docParagraphs(doc);
  const boundary = rows.findIndex(p => p.text === "Préparation éditoriale");
  if (boundary < 1) throw Error("Préparation éditoriale absente.");
  const main = rows.slice(0, boundary), metadata = rows.slice(boundary + 1).map(p=>p.text);
  const meta = metadata.join("\n");
  const keywords = metadata.find(t=>t.startsWith("Mots-clés : "))?.slice(12).replace(/\.\s*$/, "").split(/,\s*/).map(s=>s.trim()).filter(Boolean) ?? [];
  const alt = metadata.find(t=>t.startsWith("Texte alternatif : "))?.slice(19).trim() ?? null;
  const image = /(?:^|\n)Image validée Drive : ([\w-]+) SHA-256 ([a-f0-9]{64})(?:\n|$)/.exec(meta);
  const asset = image ? { id: image[1], sha256: image[2] } : null;
  const draft: EditorialDraft = {type, article_date:match[2], title:main[0].text, body:"", verse_text:null, verse_reference:null, excerpt:null, prayer:null, author_name:type === "qdlb" ? "Serge Hapita" : null, further_verses:[], seo_keywords:keywords, cover_url:null, cover_alt:asset ? alt : null, image_prompt:"Image après validation du texte final."};
  const para = (rows: Paragraph[]) => rows.map(p=>"<p>"+p.html+"</p>").join("");
  function opening(p: Paragraph) {
    const m = /^«\s*([\s\S]+?)\s*»\s*—\s*(.+?)(?:\s*\(LSG\))?$/.exec(p.text);
    if (!m) throw Error("Verset d’ouverture et référence non reconnus.");
    draft.verse_text=m[1]; draft.verse_reference=m[2];
  }
  if (type === "rm") { draft.verse_text=main[1].text; draft.body=para(main.slice(2)); }
  if (type === "jc") { opening(main[1]); draft.body=para(main.slice(2)); }
  if (type === "qdlb") {
    draft.excerpt=main[1].text; opening(main[2]);
    const further=main.findIndex(p=>p.text === "Pour aller plus loin");
    if (further < 5) throw Error("Développement, prière ou passages manquants.");
    draft.body=para(main.slice(3,further-1)); draft.prayer=main[further-1].text;
    const verses=main.slice(further+1).filter(p=>p.text!=="Serge Hapita");
    for (let n=0;n<verses.length;n++) {
      const combined=/^(.+?\d+:\d+(?:-\d+)?)\s*—\s*(.+)$/.exec(verses[n].text);
      if (combined) { draft.further_verses!.push({reference:combined[1],text:combined[2]});continue; }
      const reference=verses[n].text; const text=verses[++n]?.text;
      if (!/^.+\d+:\d+(?:-\d+)?$/.test(reference)||!text) throw Error("Passage complémentaire invalide.");
      draft.further_verses!.push({reference,text:text.replace(/^«\s*/, "").replace(/\s*»$/, "")});
    }
  }
  const hash=fingerprint({draft,asset});
  const seal=metadata.find(t=>t.startsWith("Validation publication : "))?.slice(25).trim();
  return {draft,asset,hash,approved:seal===hash};
}
