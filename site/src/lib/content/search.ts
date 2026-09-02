import { createClient } from "@/lib/supabase/server";
import { stripHtml } from "@/lib/richtext";
import { ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/content/articles";

// Recherche du site (retour du 05/09) — l'icône loupe de l'en-tête était
// purement décorative jusqu'ici, sans page de destination. Couvre les
// publications (hors Rosée Matinale, qui n'a pas de fiche par slug
// indépendante d'une date), les livres et les goodies — "articles, livres,
// etc." au sens large du cahier.
export type SearchResult = {
  type: "article" | "book" | "goodie";
  label: string;
  title: string;
  href: string;
  snippet: string;
};

const MAX_PER_TYPE = 8;

// Les virgules/parenthèses cassent la syntaxe du filtre .or() de PostgREST
// (elles y servent de séparateurs) — neutralisées plutôt que de planter la
// recherche sur une requête qui en contiendrait.
function sanitizeForOrFilter(q: string): string {
  return q.replace(/[(),]/g, " ").trim();
}

export async function searchSite(query: string): Promise<SearchResult[]> {
  const q = sanitizeForOrFilter(query);
  if (q.length < 2) return [];
  const supabase = await createClient();
  const like = `%${q}%`;

  const [articlesRes, booksRes, goodiesRes] = await Promise.all([
    supabase
      .from("articles")
      .select("type, slug, title, excerpt")
      .eq("status", "published")
      .or(`title.ilike.${like},excerpt.ilike.${like}`)
      .order("article_date", { ascending: false })
      .limit(MAX_PER_TYPE),
    supabase
      .from("books")
      .select("slug, title, author, description")
      .neq("status", "hidden")
      .or(`title.ilike.${like},author.ilike.${like},description.ilike.${like}`)
      .limit(MAX_PER_TYPE),
    supabase
      .from("goodies")
      .select("slug, title, description")
      .eq("active", true)
      .or(`title.ilike.${like},description.ilike.${like}`)
      .limit(MAX_PER_TYPE),
  ]);

  const results: SearchResult[] = [];

  for (const a of articlesRes.data ?? []) {
    if (a.type === "rm") continue;
    results.push({
      type: "article",
      label: ARTICLE_TYPE_LABEL[a.type as ArticleType],
      title: a.title,
      href: `/publications/${a.slug}`,
      snippet: a.excerpt ?? "",
    });
  }
  for (const b of booksRes.data ?? []) {
    results.push({
      type: "book",
      label: "Livre",
      title: b.title,
      href: `/livres/${b.slug}`,
      snippet: b.description ? stripHtml(b.description).slice(0, 140) : "",
    });
  }
  for (const g of goodiesRes.data ?? []) {
    results.push({
      type: "goodie",
      label: "Boutique",
      title: g.title,
      href: `/boutique/${g.slug}`,
      snippet: g.description ? stripHtml(g.description).slice(0, 140) : "",
    });
  }
  return results;
}
