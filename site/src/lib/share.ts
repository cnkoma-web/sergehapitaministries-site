// Message de partage personnalisé (retour du 05/09) — même formulation que
// celle validée pour les images de partage (og.tsx) : une catégorie de
// publication, un titre, une accroche courte. Utilisé pour les plateformes
// qui acceptent un message personnalisé (WhatsApp, Telegram, X, SMS) —
// Facebook et LinkedIn ignorent tout texte personnalisé par conception de
// leur propre bouton de partage, ce n'est pas une limitation de ce fichier.
export type ShareCategory = "qdlb" | "vs" | "rm";

const CATEGORY_PHRASE: Record<ShareCategory, string> = {
  rm: "la pensée du jour",
  qdlb: "une réflexion biblique",
  vs: "un enseignement",
};

const MAX_HOOK_LENGTH = 120;

// Première phrase du chapeau (jusqu'au premier point inclus) — jamais le
// chapeau entier : l'aperçu de la plateforme (image + description Open
// Graph) l'affiche déjà, pas la peine de répéter la même chose deux fois.
// Tronque proprement au dernier mot complet si cette phrase dépasse la
// limite, jamais en plein milieu d'un mot.
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

export function buildShareMessage({
  category,
  title,
  excerpt,
  url,
}: {
  category: ShareCategory;
  title: string;
  excerpt: string;
  url: string;
}): string {
  const hook = buildHook(excerpt);
  return `Bonjour,\n\nSerge Hapita partage avec vous ${CATEGORY_PHRASE[category]} : « ${title} »\n\n${hook}\n\n👉 Découvrez la pensée complète ici :\n${url}`;
}
