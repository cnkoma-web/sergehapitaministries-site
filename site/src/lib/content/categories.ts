import { createClient } from "@/lib/supabase/server";

export type Category = { id: string; name: string; slug: string };

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name", { ascending: true });
  if (error || !data) return [];
  return data;
}

export async function getCategoryIdsForArticle(articleId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("article_categories").select("category_id").eq("article_id", articleId);
  if (error || !data) return [];
  return data.map((r) => r.category_id);
}

export async function getCategoriesForArticle(articleId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("article_categories")
    .select("categories(id, name, slug)")
    .eq("article_id", articleId);
  if (error || !data) return [];
  return data
    .map((r) => (Array.isArray(r.categories) ? r.categories[0] : r.categories))
    .filter((c): c is Category => Boolean(c));
}

/** Crée la catégorie si besoin (nom unique, insensible à la casse par la
 * contrainte unique sur `name`) et renvoie son id — utilisée par le
 * "+ Créer une catégorie" à la volée dans le formulaire d'article. */
export async function findOrCreateCategory(name: string): Promise<Category | null> {
  const trimmed = name.trim();
  if (!trimmed) return null;
  const supabase = await createClient();

  const { data: existing } = await supabase.from("categories").select("id, name, slug").ilike("name", trimmed).maybeSingle();
  if (existing) return existing;

  const { data, error } = await supabase
    .from("categories")
    .insert({ name: trimmed, slug: slugify(trimmed) || crypto.randomUUID() })
    .select("id, name, slug")
    .single();
  if (error || !data) return null;
  return data;
}

export async function setArticleCategories(articleId: string, categoryIds: string[]): Promise<void> {
  const supabase = await createClient();
  await supabase.from("article_categories").delete().eq("article_id", articleId);
  if (categoryIds.length > 0) {
    await supabase.from("article_categories").insert(categoryIds.map((category_id) => ({ article_id: articleId, category_id })));
  }
}
