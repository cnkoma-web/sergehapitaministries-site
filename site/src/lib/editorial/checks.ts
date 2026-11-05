import { createHash } from "node:crypto";
import type { EditorialDraft } from "./types";

export function fingerprint(value: unknown): string {
  function canonical(input: unknown): unknown {
    if (Array.isArray(input)) return input.map(canonical);
    if (input && typeof input === "object") return Object.fromEntries(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, canonical(v)]));
    return input;
  }
  return createHash("sha256").update(JSON.stringify(canonical(value))).digest("hex");
}
export function plainText(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
}
export function editorialChecks(draft: EditorialDraft, source?: string): string[] {
  const issues: string[] = [];
  const body = plainText(draft.body ?? "");
  const words = body.split(/\s+/).filter(Boolean).length;
  const narration=body.replace(/«[^»]*»|“[^”]*”|"[^"]*"/g,"");
  const detour=narration.match(/\bne [^.!?;:]{0,80}\b(?:pas|plus)\b|\bn['’][^.!?;:]{0,80}\b(?:pas|plus)\b|\bnon seulement\b|\bn['’]est pas\b|\bne (?:s['’]agit|signifie|désigne|décrit|se limite|se résume|constitue)[^.!?]{0,50}\bpas\b|\bne[^.!?;]{0,80}\bpas[^.!?;]{0,80}\bmais\b|\bnon[^.!?;]{0,60}\bmais\b/i);
  if(detour)issues.push("Écriture affirmative obligatoire : réécrire le détour négatif « "+detour[0]+" ». Affirmer directement la pensée utile.");
  if(/\bcroyants?\b/i.test(narration))issues.push("Employer chrétien à la place de croyant hors citations bibliques exactes.");
  if(/\\+["\']/.test(draft.body??""))issues.push("Retirer les antislashs ajoutés devant les guillemets du texte.");
  if (!body) issues.push("Le corps ne contient aucun texte lisible.");
  // Les brouillons générés utilisent volontairement un sous-ensemble du CMS.
  const tags = (draft.body ?? "").match(/<[^>]*(?:>|$)/g) ?? [];
  if (tags.some(tag => !/^<\/?(?:p|strong|em|mark|h2|blockquote)>$|^<br\s*\/?>$/i.test(tag))) issues.push("Balise ou attribut HTML non autorisé.");
  if (draft.type === "rm") {
    if (words < 230 || words > 260) issues.push("Rosée Matinale exige 230 à 260 mots.");
    if (!/<mark>[^<]+<\/mark>/.test(draft.body)) issues.push("La phrase clé doit être surlignée.");
    if ((draft.verse_text?.match(/[.!?](?:\s|$)/g) ?? []).length !== 2) issues.push("Le chapeau Rosée Matinale comporte deux phrases.");
  }
  if (draft.type === "qdlb") {
    if (/<h[1-6]\b/i.test(draft.body)) issues.push("Que dit la Bible ? ne comporte pas de titres de sections.");
    const normalize=(s:string)=>plainText(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
    if(draft.verse_text && normalize(body).includes(normalize(draft.verse_text)))issues.push("Le verset d’ouverture doit figurer uniquement dans son champ dédié.");
    if(draft.prayer && normalize(body).includes(normalize(draft.prayer)))issues.push("La prière doit figurer uniquement dans son champ dédié.");
  }
  if (draft.type === "qdlb" && !(draft.further_verses?.length)) issues.push("Les passages pour aller plus loin sont obligatoires.");
  if (draft.type === "jc" && (draft.excerpt || draft.author_name)) issues.push("Je Confesse ne comporte ni chapeau ni auteur.");
  const keywords = Array.isArray(draft.seo_keywords) ? draft.seo_keywords.filter(v => typeof v === "string" && v.trim()) : [];
  if (new Set(keywords.map(v => v.toLowerCase().trim())).size < 20 || keywords.length > 25) issues.push("Prévoir 20 à 25 mots-clés distincts.");
  // Le texte peut être publié avant la conception du visuel (décision du 27/10).
  if (draft.cover_url) {
    if (!draft.cover_alt?.trim()) issues.push("Texte alternatif obligatoire.");
    if (!(draft.image_bytes && draft.image_bytes <= 800_000)) issues.push("Le fichier image ne doit pas dépasser 800 Ko.");
    if ((draft.image_width ?? 0) < 1200 || (draft.image_height ?? 0) < 675 || Math.abs((draft.image_width ?? 0) / (draft.image_height || 1) - 16 / 9) > 0.02) issues.push("Image paysage 16:9, au minimum 1200 × 675.");
  }
  return issues;
}

export function assertDraftShape(value: unknown): asserts value is EditorialDraft {
  if (!value || typeof value !== "object") throw new Error("Brouillon invalide.");
  const draft = value as Record<string, unknown>;
  for (const field of ["title","article_date","body","image_prompt","type"]) {
    if (typeof draft[field] !== "string" || String(draft[field]).length > 100_000) throw new Error("Champ de brouillon invalide : " + field);
  }
  if (!["rm","jc","qdlb","vs"].includes(String(draft.type))) throw new Error("Rubrique invalide.");
  for (const field of ["verse_text","verse_reference","excerpt","prayer","cover_url","cover_alt","author_name"]) {
    if (draft[field] != null && typeof draft[field] !== "string") throw new Error("Champ texte invalide : " + field);
  }
  if (!Array.isArray(draft.seo_keywords) || draft.seo_keywords.length > 30 || !draft.seo_keywords.every(v => typeof v === "string")) throw new Error("Mots-clés invalides.");
  if (draft.further_verses != null && (!Array.isArray(draft.further_verses) || draft.further_verses.length > 20 || !draft.further_verses.every(v => v && typeof v.reference === "string" && typeof v.text === "string"))) throw new Error("Passages complémentaires invalides.");
}


