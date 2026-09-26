// Texte de partage des publications SHM.
// Le texte provient exclusivement des champs CMS déjà chargés par les pages.
// Aucune URL, métadonnée SEO/Open Graph ou donnée Supabase n'est construite ici.
export type ShareCategory = "qdlb" | "vs" | "rm" | "jc";

export const SHARE_BLOCK_INVITE: Record<ShareCategory, string> = {
  rm: "Bénis quelqu'un en partageant ce message.",
  qdlb: "Bénis quelqu'un en partageant cette réflexion.",
  vs: "Bénis quelqu'un en partageant cet enseignement.",
  jc: "Bénis quelqu'un en partageant ce message.",
};

export type PublicationShareContent = {
  intro?: string | null;
  scriptureReference?: string | null;
  scriptureText?: string | null;
  body?: string | null;
};

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

function htmlToParagraphs(html?: string | null): string[] {
  if (!html) return [];
  const normalized = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|blockquote|li|h[1-6])\s*>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(normalized)
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/[ \t\r\f\v]+/g, " ").replace(/\n+/g, " ").trim())
    .filter(Boolean);
}

function plainParagraphs(text?: string | null): string[] {
  if (!text) return [];
  return decodeEntities(text)
    .split(/\n\s*\n+/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function cleanParagraphs(body?: string | null): string[] {
  if (!body) return [];
  return /<[^>]+>/.test(body) ? htmlToParagraphs(body) : plainParagraphs(body);
}

function cutAtWord(text: string, max: number): string {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  const candidate = clean.slice(0, max + 1);
  const boundary = Math.max(candidate.lastIndexOf(". "), candidate.lastIndexOf("; "), candidate.lastIndexOf(", "), candidate.lastIndexOf(" "));
  const cut = (boundary >= Math.floor(max * 0.6) ? candidate.slice(0, boundary + (candidate[boundary] === " " ? 0 : 1)) : candidate.slice(0, max)).trim();
  return cut.replace(/[,:;.!?]+$/u, "").trimEnd();
}

const SECOND_PARAGRAPH_MAX = 260;
// Rosée Matinale : environ trois lignes de lecture du deuxième paragraphe.
const RM_SECOND_PARAGRAPH_MAX = 170;
const TOTAL_BODY_SAFETY_MAX = 900;

function developmentExcerpt(body?: string | null, secondParagraphMax = SECOND_PARAGRAPH_MAX): string | null {
  const paragraphs = cleanParagraphs(body);
  if (!paragraphs.length) return null;

  const first = paragraphs[0];
  const second = paragraphs[1];

  // Cas normal demandé : premier paragraphe complet + début du suivant.
  if (second) {
    const firstSafe = first.length > TOTAL_BODY_SAFETY_MAX
      ? cutAtWord(first, TOTAL_BODY_SAFETY_MAX)
      : first;
    const remaining = Math.max(90, TOTAL_BODY_SAFETY_MAX - firstSafe.length - 2);
    const secondPart = cutAtWord(second, Math.min(secondParagraphMax, remaining));
    return `${firstSafe}\n\n${secondPart}…`;
  }

  // Repli : un seul paragraphe disponible. On n'invente rien et on signale
  // tout de même explicitement la continuité si une coupure de sécurité est possible.
  if (first.length > SECOND_PARAGRAPH_MAX) return `${cutAtWord(first, Math.min(TOTAL_BODY_SAFETY_MAX, SECOND_PARAGRAPH_MAX * 2))}…`;
  return first;
}

const CATEGORY_INVITE: Record<ShareCategory, string> = {
  rm: "Poursuis la lecture sur SergeHapitaMinistries.org",
  qdlb: "Poursuis la réflexion sur SergeHapitaMinistries.org",
  vs: "Poursuis l’enseignement sur SergeHapitaMinistries.org",
  jc: "Poursuis la confession sur SergeHapitaMinistries.org",
};

function scriptureLine(reference?: string | null, text?: string | null): string | null {
  const ref = reference?.trim();
  const verse = text?.trim();
  if (ref && verse) return `${ref}\n« ${verse} »`;
  return verse || ref || null;
}

function buildMessage({
  category,
  title,
  content,
  url,
  formatted,
}: {
  category: ShareCategory;
  title: string;
  content?: PublicationShareContent;
  url: string;
  formatted: boolean;
}): string {
  const blocks: string[] = [formatted ? "*SHM* partage avec toi" : "SHM partage avec toi", formatted ? `*${title}*` : title];
  if (content?.intro?.trim()) blocks.push(content.intro.trim());
  const development = developmentExcerpt(content?.body, category === "rm" ? RM_SECOND_PARAGRAPH_MAX : SECOND_PARAGRAPH_MAX);
  if (development) blocks.push(development);
  blocks.push(`${CATEGORY_INVITE[category]} :\n${url}`);
  return blocks.join("\n\n");
}

export function buildShareMessage({
  category,
  title,
  content,
  url,
}: {
  category: ShareCategory;
  title: string;
  content?: PublicationShareContent;
  url: string;
}): string {
  return buildMessage({ category, title, content, url, formatted: true });
}

export function buildPlainShareMessage({
  category,
  title,
  content,
  url,
}: {
  category: ShareCategory;
  title: string;
  content?: PublicationShareContent;
  url: string;
}): string {
  return buildMessage({ category, title, content, url, formatted: false });
}

// Partage des livres : hors périmètre du chantier, conservé à l'identique.
function truncateAtWord(text: string, maxLength: number): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return { text: trimmed, truncated: false };
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return { text: (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd(), truncated: true };
}

const BOOK_HOOK_MAX_LENGTH = 260;

function buildBookMessage({
  title,
  description,
  url,
  formatted,
}: {
  title: string;
  description: string;
  url: string;
  formatted: boolean;
}): string {
  const titlePart = formatted ? `*« ${title} »*` : `« ${title} »`;
  const { text } = truncateAtWord(description, BOOK_HOOK_MAX_LENGTH);
  const hookText = `${text}…`;
  const hookBlock = formatted ? `_${hookText}_` : hookText;
  const blessing = formatted ? "_*demeure abondamment béni.*_" : "demeure abondamment béni.";
  return `Bonjour,\n\nSerge t'invite à découvrir son livre : ${titlePart}\n\n${hookBlock}\n\n👉 Découvre le livre ici :\n${url}\n\nBonne lecture et ${blessing}`;
}

export function buildBookShareMessage({ title, description, url }: { title: string; description: string; url: string }): string {
  return buildBookMessage({ title, description, url, formatted: true });
}

export function buildPlainBookShareMessage({ title, description, url }: { title: string; description: string; url: string }): string {
  return buildBookMessage({ title, description, url, formatted: false });
}
