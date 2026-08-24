import { createClient } from "@/lib/supabase/server";

export type TickerMessage = { id?: string; text: string; href?: string | null };

// Valeurs de repli : utilisées si la table `ticker_messages` n'existe pas encore
// (migration Supabase pas encore exécutée) ou en cas d'erreur réseau, pour que le
// site ne casse jamais. Une fois la migration appliquée, ces valeurs ne servent
// plus qu'en dernier recours.
const FALLBACK: TickerMessage[] = [
  { text: "✝ Dernier livre — Ton Corps T'Écoute, disponible maintenant", href: "/livres#ton-corps" },
  { text: "Recevez « ParoleDeViePourVous » chaque semaine — S'inscrire", href: "/#newsletter" },
  { text: "Un ministère depuis Levallois-Perret, France" },
];

export async function getTickerMessages(): Promise<TickerMessage[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("ticker_messages")
      .select("id, text, href")
      .eq("active", true)
      .order("position", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK;
    return data;
  } catch {
    return FALLBACK;
  }
}
