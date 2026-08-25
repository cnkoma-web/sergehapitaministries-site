import { createClient } from "@/lib/supabase/server";

export type ArticleType = "qdlb" | "vs" | "rm";

export type Article = {
  id: string;
  type: ArticleType;
  slug: string;
  title: string;
  article_date: string;
  excerpt: string | null;
  verse_reference: string | null;
  verse_text: string | null;
  body: string | null;
  further_verses: { reference: string; text: string }[];
  toc_keywords: string[];
  access: "free" | "paid";
  view_count: number;
  reading_time_minutes: number | null;
};

// Libellés/initiales dérivés du type plutôt que stockés en base (une seule
// source de vérité — cahier §1.1 : pastille avec initiales QB/VS/RM).
export const ARTICLE_TYPE_LABEL: Record<ArticleType, string> = {
  qdlb: "Que Dit la Bible ?",
  vs: "La Vie Supérieure",
  rm: "Rosée Matinale",
};
export const ARTICLE_TYPE_INITIALS: Record<ArticleType, string> = { qdlb: "QB", vs: "VS", rm: "RM" };

const COLUMNS =
  "id, type, slug, title, article_date, excerpt, verse_reference, verse_text, body, further_verses, toc_keywords, access, view_count, reading_time_minutes";

export async function getPublishedArticles(type: ArticleType): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(COLUMNS)
    .eq("type", type)
    .eq("status", "published")
    .order("article_date", { ascending: false });
  if (error || !data) return [];
  return data;
}

/** Cherche un article publié par slug, tous types confondus sauf Rosée Matinale
 * (qui a sa propre page dédiée, cahier §3.2) — utilisé par /publications/[slug],
 * partagée entre les gabarits Que Dit la Bible et La Vie Supérieure. */
export async function getArticleBySlugAnyType(slug: string): Promise<Article | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(COLUMNS)
    .eq("slug", slug)
    .eq("status", "published")
    .in("type", ["qdlb", "vs"])
    .single();
  if (error || !data) return null;
  return data;
}

export async function getRelatedArticles(type: ArticleType, excludeId: string, limit = 3): Promise<Article[]> {
  const all = await getPublishedArticles(type);
  return all.filter((a) => a.id !== excludeId).slice(0, limit);
}

/** L'entrée du jour = la plus récente entrée Rosée Matinale publiée. Pas de champ
 * "is_current" séparé à synchroniser : la bascule en archive est automatique dès
 * qu'une entrée plus récente est publiée (cahier §3.2). */
export async function getRoseeDuJour(): Promise<Article | null> {
  const articles = await getPublishedArticles("rm");
  return articles[0] ?? null;
}

export async function getRoseeArchive(): Promise<Article[]> {
  const articles = await getPublishedArticles("rm");
  return articles.slice(1);
}

export async function countPublishedArticles(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase.from("articles").select("id", { count: "exact", head: true }).eq("status", "published");
  return count ?? 0;
}

export async function incrementViewCount(id: string) {
  const supabase = await createClient();
  await supabase.rpc("increment_article_views", { article_id: id });
}
