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
