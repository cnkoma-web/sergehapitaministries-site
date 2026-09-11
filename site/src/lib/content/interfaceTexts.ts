import { createClient } from "@/lib/supabase/server";

// Lit toutes les paires clé/valeur de `interface_texts` en une seule requête
// (utilisé par nav/footer/brand-split pour éviter une requête par libellé).
// Retourne un objet vide en cas d'erreur — chaque appelant applique alors sa
// propre valeur par défaut, le site ne casse jamais si la table n'existe pas
// encore ou si une clé n'a pas été saisie.
export async function getInterfaceTexts(): Promise<Record<string, string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("interface_texts").select("key, value");
    if (error || !data) return {};
    return Object.fromEntries(data.map((row) => [row.key, row.value]));
  } catch {
    return {};
  }
}

// Je Confesse (Lot 4, corrigé le 11/09) — le verset d'en-tête et la
// signature de clôture sont fixes pour toute la rubrique (réglages
// globaux, éditables dans /admin/textes, clés "je_confesse.*"), jamais un
// champ par proclamation. Valeurs par défaut ci-dessous = celles de la
// maquette, insérées par la migration 20260911020000 — ce repli ne sert
// que si ces lignes ont été supprimées d'interface_texts entre-temps.
export type JeConfesseSettings = {
  verseText: string;
  verseReference: string;
  signatureText: string;
  signatureReference: string;
};

const JE_CONFESSE_DEFAULTS: JeConfesseSettings = {
  verseText:
    "C'est du fruit de sa bouche que l'homme rassasie son ventre, c'est du produit de ses lèvres qu'il se rassasie.",
  verseReference: "Proverbes 18:20",
  signatureText:
    "Ayez l'audace de dire les mêmes choses que Dieu a dites à votre sujet dans sa Parole. C'est ce qui vous fait jouir des bienfaits du salut. C'est en confessant de la bouche ce que l'on croit du cœur que l'on parvient au salut.",
  signatureReference: "Romains 10:10",
};

export async function getJeConfesseSettings(): Promise<JeConfesseSettings> {
  const texts = await getInterfaceTexts();
  return {
    verseText: texts["je_confesse.verse_text"] || JE_CONFESSE_DEFAULTS.verseText,
    verseReference: texts["je_confesse.verse_reference"] || JE_CONFESSE_DEFAULTS.verseReference,
    signatureText: texts["je_confesse.signature_text"] || JE_CONFESSE_DEFAULTS.signatureText,
    signatureReference: texts["je_confesse.signature_reference"] || JE_CONFESSE_DEFAULTS.signatureReference,
  };
}
