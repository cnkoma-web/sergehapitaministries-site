import { createClient } from "@/lib/supabase/server";
import { ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/content/articles";

// Recherche du site (retour du 05/09) — l'icône loupe de l'en-tête était
// purement décorative jusqu'ici, sans page de destination. Périmètre
// précisé explicitement par Serge (2e passage) : pour les publications
// (toutes catégories confondues, hors Rosée Matinale qui n'a pas de fiche
// par slug indépendante d'une date) — titre, chapeau, corps du texte et
// tags (thématiques/catégories). Pour les livres — uniquement le titre.
// Les goodies ne font plus partie du périmètre (n'étaient pas dans la
// liste explicite).
export type SearchResult = {
  type: "article" | "book";
  label: string;
  title: string;
  href: string;
  snippet: string;
};

const MAX_RESULTS = 12;

// Les virgules/parenthèses cassent la syntaxe du filtre .or() de PostgREST
// (elles y servent de séparateurs) — neutralisées plutôt que de planter la
// recherche sur une requête qui en contiendrait.
function sanitizeForOrFilter(q: string): string {
  return q.replace(/[(),]/g, " ").trim();
}

type ArticleRow = { id: string; type: ArticleType; slug: string; title: string; excerpt: string | null };

export async function searchSite(query: string): Promise<SearchResult[]> {
  const q = sanitizeForOrFilter(query);
  if (q.length < 2) return [];
  const supabase = await createClient();
  const like = `%${q}%`;

  const [directRes, catMatchRes, booksRes] = await Promise.all([
    // Titre, chapeau, corps du texte.
    supabase
      .from("articles")
      .select("id, type, slug, title, excerpt")
      .eq("status", "published")
      .or(`title.ilike.${like},excerpt.ilike.${like},body.ilike.${like}`)
      .order("article_date", { ascending: false })
      .limit(MAX_RESULTS),
    // Tags (thématiques) — recherchés séparément : un article rattaché à
    // une catégorie dont le NOM correspond, même si son propre texte ne
    // contient pas le terme recherché.
    supabase.from("categories").select("id").ilike("name", like),
    // Livres — uniquement le titre.
    supabase.from("books").select("slug, title").neq("status", "hidden").ilike("title", like).limit(MAX_RESULTS),
  ]);

  const articleRows = new Map<string, ArticleRow>();
  for (const a of (directRes.data ?? []) as ArticleRow[]) {
    articleRows.set(a.id, a);
  }

  const matchingCategoryIds = (catMatchRes.data ?? []).map((c) => c.id as string);
  if (matchingCategoryIds.length > 0) {
    const { data: links } = await supabase
      .from("article_categories")
      .select("article_id")
      .in("category_id", matchingCategoryIds);
    const linkedIds = [...new Set((links ?? []).map((l) => l.article_id as string))].filter((id) => !articleRows.has(id));
    if (linkedIds.length > 0) {
      const { data: linkedArticles } = await supabase
        .from("articles")
        .select("id, type, slug, title, excerpt")
        .eq("status", "published")
        .in("id", linkedIds);
      for (const a of (linkedArticles ?? []) as ArticleRow[]) {
        articleRows.set(a.id, a);
      }
    }
  }

  const results: SearchResult[] = [];
  for (const a of articleRows.values()) {
    if (a.type === "rm") continue;
    results.push({
      type: "article",
      label: ARTICLE_TYPE_LABEL[a.type],
      title: a.title,
      href: `/publications/${a.slug}`,
      snippet: a.excerpt ?? "",
    });
  }
  for (const b of booksRes.data ?? []) {
    results.push({ type: "book", label: "Livre", title: b.title, href: `/livres/${b.slug}`, snippet: "" });
  }
  return results;
}
