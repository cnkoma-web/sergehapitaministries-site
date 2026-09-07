// Message de partage personnalisé (retour du 05/09, 4e passage) — tutoiement,
// "Serge" plutôt que "Serge Hapita". Deux variantes du même modèle :
// - formatée (WhatsApp/Telegram) : *gras* et _italique_, ces deux
//   plateformes interprètent cette mise en forme.
// - brute (SMS/X) : mêmes mots, sans aucun symbole de mise en forme — ces
//   plateformes ne les interprètent pas, elles les afficheraient tels quels.
export type ShareCategory = "qdlb" | "vs" | "rm";

const CATEGORY_PHRASE: Record<ShareCategory, string> = {
  rm: "la Rosée matinale du jour",
  qdlb: "la réflexion biblique du jour",
  vs: "l'enseignement du jour",
};

// "Retrouve" plutôt que "Découvre" (retour du 07/09) — un texte propre à
// chaque catégorie, pas un simple mot remplacé partout à l'identique.
const CATEGORY_INVITE: Record<ShareCategory, string> = {
  rm: "Retrouve la pensée complète ici",
  qdlb: "Retrouve l'intégralité de la réflexion ici",
  vs: "Retrouve l'enseignement complet ici",
};

// Phrase au-dessus des icônes de partage, sur la page elle-même (retour du
// 05/09, 4e passage) — formulations fixées avec Serge, jamais sur les
// fiches livres (voir ShareCartouche : rendue uniquement quand `category`
// est fourni).
// "Bénis quelqu'un" plutôt que "Bénis quelqu'un que tu connais" (retour du
// 07/09) — seule cette partie change, la fin reste propre à chaque
// catégorie.
export const SHARE_BLOCK_INVITE: Record<ShareCategory, string> = {
  rm: "Bénis quelqu'un en partageant ce message.",
  qdlb: "Bénis quelqu'un en partageant cette réflexion.",
  vs: "Bénis quelqu'un en partageant cet enseignement.",
};

// Tronque au dernier mot complet, jamais en plein milieu d'un mot — ne
// décide pas elle-même d'ajouter "…", chaque appelant applique sa propre
// règle (conditionnelle pour les articles, systématique pour les livres).
function truncateAtWord(text: string, maxLength: number): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return { text: trimmed, truncated: false };
  const cut = trimmed.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return { text: (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd(), truncated: true };
}

// Équivalent de 2 lignes dans le message de partage (retour du 05/09, 4e
// passage) — le chapeau déjà enregistré pour la publication, jamais un
// nouveau champ. "…" ajouté seulement si effectivement tronqué.
const ARTICLE_EXCERPT_MAX_LENGTH = 200;

function buildMessage({
  category,
  title,
  excerpt,
  url,
  formatted,
}: {
  category: ShareCategory;
  title: string;
  excerpt?: string;
  url: string;
  formatted: boolean;
}): string {
  const titlePart = formatted ? `*« ${title} »*` : `« ${title} »`;
  let excerptBlock = "";
  if (excerpt) {
    const { text, truncated } = truncateAtWord(excerpt, ARTICLE_EXCERPT_MAX_LENGTH);
    const ellipsis = truncated ? "…" : "";
    const excerptText = `${text}${ellipsis}`;
    excerptBlock = `\n\n${formatted ? `_${excerptText}_` : excerptText}`;
  }
  const blessing = formatted ? "_*demeure abondamment béni.*_" : "demeure abondamment béni.";
  return `Bonjour,\n\nSerge partage avec toi ${CATEGORY_PHRASE[category]} : ${titlePart}${excerptBlock}\n\n👉 ${CATEGORY_INVITE[category]} :\n${url}\n\nBonne lecture et ${blessing}`;
}

/** WhatsApp/Telegram — supportent le gras et l'italique façon markdown. */
export function buildShareMessage({
  category,
  title,
  excerpt,
  url,
}: {
  category: ShareCategory;
  title: string;
  excerpt?: string;
  url: string;
}): string {
  return buildMessage({ category, title, excerpt, url, formatted: true });
}

/** SMS/X — aucun symbole de mise en forme, ces plateformes ne les interprètent pas. */
export function buildPlainShareMessage({
  category,
  title,
  excerpt,
  url,
}: {
  category: ShareCategory;
  title: string;
  excerpt?: string;
  url: string;
}): string {
  return buildMessage({ category, title, excerpt, url, formatted: false });
}

// Fiche livre (retour du 05/09, 4e passage) — tutoiement comme les
// articles, mais garde volontairement une accroche (le partage d'un livre a
// une fonction de découverte/promotion, contrairement à un article). Se
// termine toujours par "…", tronqué ou non (contrairement aux articles :
// règle volontairement différente, une accroche promotionnelle plutôt
// qu'un simple extrait).
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
  // Italique, jamais gras (retour du 06/09) — `_..._` est l'italique en
  // markdown WhatsApp/Telegram, `*...*` (utilisé par erreur ici) est le gras.
  const hookBlock = formatted ? `_${hookText}_` : hookText;
  const blessing = formatted ? "_*demeure abondamment béni.*_" : "demeure abondamment béni.";
  return `Bonjour,\n\nSerge t'invite à découvrir son livre : ${titlePart}\n\n${hookBlock}\n\n👉 Découvre le livre ici :\n${url}\n\nBonne lecture et ${blessing}`;
}

/** WhatsApp/Telegram — supportent le gras et l'italique façon markdown. */
export function buildBookShareMessage({ title, description, url }: { title: string; description: string; url: string }): string {
  return buildBookMessage({ title, description, url, formatted: true });
}

/** SMS/X — aucun symbole de mise en forme, ces plateformes ne les interprètent pas. */
export function buildPlainBookShareMessage({ title, description, url }: { title: string; description: string; url: string }): string {
  return buildBookMessage({ title, description, url, formatted: false });
}
