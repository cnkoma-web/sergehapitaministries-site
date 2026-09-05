// Message de partage personnalisé (retour du 05/09, 3e passage) — tutoiement,
// "Serge" plutôt que "Serge Hapita". Deux variantes du même modèle :
// - formatée (WhatsApp/Telegram) : *gras* et _italique_, ces deux
//   plateformes interprètent cette mise en forme.
// - brute (SMS/X) : mêmes mots, sans aucun symbole de mise en forme — ces
//   plateformes ne les interprètent pas, elles les afficheraient tels quels.
// Ne reprend plus la première phrase du chapeau (retiré à la demande de
// Serge) — le chapeau reste visible via l'aperçu Open Graph uniquement,
// pas la peine de le répéter dans le message.
export type ShareCategory = "qdlb" | "vs" | "rm";

const CATEGORY_PHRASE: Record<ShareCategory, string> = {
  rm: "la Rosée matinale du jour",
  qdlb: "la réflexion biblique du jour",
  vs: "l'enseignement du jour",
};

const CATEGORY_INVITE: Record<ShareCategory, string> = {
  rm: "Découvre la pensée complète ici",
  qdlb: "Découvre la pensée complète ici",
  vs: "Découvre l'enseignement complet ici",
};

function buildMessage({
  category,
  title,
  url,
  formatted,
}: {
  category: ShareCategory;
  title: string;
  url: string;
  formatted: boolean;
}): string {
  const titlePart = formatted ? `*« ${title} »*` : `« ${title} »`;
  const blessing = formatted ? "_*demeure abondamment béni.*_" : "demeure abondamment béni.";
  return `Bonjour,\n\nSerge partage avec toi ${CATEGORY_PHRASE[category]} : ${titlePart}\n\n👉 ${CATEGORY_INVITE[category]} :\n${url}\n\nBonne lecture et ${blessing}`;
}

/** WhatsApp/Telegram — supportent le gras et l'italique façon markdown. */
export function buildShareMessage({ category, title, url }: { category: ShareCategory; title: string; url: string }): string {
  return buildMessage({ category, title, url, formatted: true });
}

/** SMS/X — aucun symbole de mise en forme, ces plateformes ne les interprètent pas. */
export function buildPlainShareMessage({ category, title, url }: { category: ShareCategory; title: string; url: string }): string {
  return buildMessage({ category, title, url, formatted: false });
}

const MAX_HOOK_LENGTH = 120;

// Première phrase du chapeau (jusqu'au premier point inclus) — jamais le
// chapeau entier. Tronque proprement au dernier mot complet si cette phrase
// dépasse la limite, jamais en plein milieu d'un mot.
// Utilisé uniquement par buildBookShareMessage ci-dessous (fiche livre, hors
// périmètre du changement de règle du 05/09 sur les articles).
function buildHook(excerpt: string): string {
  const trimmed = excerpt.trim();
  const dotIndex = trimmed.indexOf(".");
  let sentence = dotIndex === -1 ? trimmed : trimmed.slice(0, dotIndex + 1);
  if (sentence.length > MAX_HOOK_LENGTH) {
    const cut = sentence.slice(0, MAX_HOOK_LENGTH);
    const lastSpace = cut.lastIndexOf(" ");
    sentence = `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
  }
  return sentence;
}

// Fiche livre — même principe que l'ancien modèle des articles (accroche =
// titre, extrait court, puis lien) ; pas concerné par le nouveau modèle
// tutoiement/formatage du 05/09 (demande limitée aux 3 catégories
// d'articles), laissé tel quel.
export function buildBookShareMessage({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}): string {
  const hook = buildHook(description);
  return `Bonjour,\n\nSerge Hapita partage avec vous son livre : « ${title} »\n\n${hook}\n\n👉 Découvrez le livre ici :\n${url}`;
}
