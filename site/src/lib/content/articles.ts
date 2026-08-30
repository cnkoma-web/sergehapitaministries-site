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
  cover_url: string | null;
  cover_alt: string | null;
  author_name: string | null;
  related_article_ids: string[];
  seo_keywords: string[];
  // Horodatage réel de création — sert uniquement à afficher l'heure de
  // publication (cahier §6.5 : "JJ/MM/AAAA · HHhMM") à côté de la date
  // éditoriale (article_date), qui elle n'a pas de composante horaire.
  created_at: string;
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
  "id, type, slug, title, article_date, excerpt, verse_reference, verse_text, body, further_verses, toc_keywords, access, view_count, reading_time_minutes, cover_url, cover_alt, author_name, related_article_ids, seo_keywords, created_at";
const ADMIN_COLUMNS =
  "id, type, slug, title, article_date, excerpt, verse_reference, verse_text, body, further_verses, toc_keywords, access, view_count, reading_time_minutes, cover_url, cover_alt, author_name, related_article_ids, seo_keywords, status, created_at";

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

/** Articles similaires liés manuellement par Serge (cahier §6.2) — si aucun
 * lien manuel n'a été fait, on retombe sur les plus récents du même type. */
export async function getArticlesByIds(ids: string[]): Promise<Article[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select(COLUMNS).in("id", ids).eq("status", "published");
  if (error || !data) return [];
  // Conserve l'ordre choisi par Serge, pas l'ordre renvoyé par la base.
  return ids.map((id) => data.find((a) => a.id === id)).filter((a): a is Article => Boolean(a));
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

// ===== Admin (voit aussi les brouillons) =====

export type AdminArticle = Article & { status: "draft" | "published" };

export async function getArticlesAdmin(
  types: ArticleType[],
  page: number,
  perPage: number
): Promise<{ articles: AdminArticle[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("articles")
    .select(ADMIN_COLUMNS, { count: "exact" })
    .in("type", types)
    .order("article_date", { ascending: false })
    .range(from, from + perPage - 1);
  if (error || !data) return { articles: [], total: 0 };
  return { articles: data, total: count ?? 0 };
}

/** Flux unifié du hub Publications (cahier §6.5) : toutes catégories
 * mélangées (QDLB/VS/RM), triées de la plus récente à la plus ancienne,
 * paginées — plus de blocs séparés par catégorie. */
export async function getPublicationsFeed(page: number, perPage: number): Promise<{ articles: Article[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("articles")
    .select(COLUMNS, { count: "exact" })
    .in("type", ["qdlb", "vs", "rm"])
    .eq("status", "published")
    .order("article_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);
  if (error || !data) return { articles: [], total: 0 };
  return { articles: data, total: count ?? 0 };
}

/** Dernières entrées Rosée Matinale, pour le rappel affiché sous le flux
 * unifié (cahier v3 §6.10 point 2) — Rosée Matinale reste dans le flux
 * mélangé aussi, ceci est un rappel supplémentaire, pas un remplacement. */
export async function getLatestRosee(limit: number): Promise<Article[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(COLUMNS)
    .eq("type", "rm")
    .eq("status", "published")
    .order("article_date", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data;
}

export async function getArticleByIdAdmin(id: string): Promise<AdminArticle | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("articles").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  return data;
}

/** Pour le sélecteur "Articles similaires" — tous les articles publiés sauf
 * celui en cours d'édition, tous types confondus. */
export async function getArticleOptionsForLinking(excludeId?: string): Promise<{ id: string; title: string }[]> {
  const supabase = await createClient();
  let query = supabase.from("articles").select("id, title").eq("status", "published").order("article_date", { ascending: false });
  if (excludeId) query = query.neq("id", excludeId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}
