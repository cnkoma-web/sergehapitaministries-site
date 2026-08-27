import { createClient } from "@/lib/supabase/server";
import { getBooks } from "@/lib/content/books";
import { countPublishedArticles } from "@/lib/content/articles";

export type DisplayStat = { key: string; label: string; value: string };

// Bandeau de chiffres clés de l'accueil — piloté par la bibliothèque
// `stat_definitions` (admin /admin/stats). "auto_*" se recalcule seul depuis
// les vraies données ; "manual" affiche la valeur saisie par Serge, ou un
// tiret honnête tant qu'elle n'a jamais été renseignée (jamais de nombre inventé).
export async function getActiveStats(): Promise<DisplayStat[]> {
  const supabase = await createClient();
  const { data: defs } = await supabase
    .from("stat_definitions")
    .select("key, label, calc_type, manual_value")
    .eq("active", true)
    .order("position", { ascending: true });

  if (!defs || defs.length === 0) return [];

  const needsBooks = defs.some((d) => d.calc_type === "auto_books");
  const needsArticles = defs.some((d) => d.calc_type === "auto_articles");
  const [books, articleCount] = await Promise.all([
    needsBooks ? getBooks() : Promise.resolve([]),
    needsArticles ? countPublishedArticles() : Promise.resolve(0),
  ]);

  return defs.map((d) => {
    let value = "—";
    if (d.calc_type === "auto_books") value = String(books.length);
    else if (d.calc_type === "auto_articles") value = String(articleCount);
    else if (d.manual_value) value = d.manual_value;
    return { key: d.key, label: d.label, value };
  });
}
