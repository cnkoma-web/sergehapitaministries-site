"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeReadingTime } from "@/lib/readingTime";
import { paragraphsToHtml } from "@/lib/richtext";
import { setArticleCategories } from "@/lib/content/categories";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Lit les paires de champs Référence/Texte répétables (FurtherVersesEditor),
// envoyées comme deux listes parallèles further_verse_reference[] /
// further_verse_text[] — remplace l'ancienne syntaxe "Référence | Texte" à
// mémoriser dans une zone de texte, source d'oublis silencieux.
function readFurtherVerses(formData: FormData): { reference: string; text: string }[] {
  const refs = formData.getAll("further_verse_reference").map(String);
  const texts = formData.getAll("further_verse_text").map(String);
  const verses: { reference: string; text: string }[] = [];
  for (let i = 0; i < Math.max(refs.length, texts.length); i++) {
    const reference = (refs[i] ?? "").trim();
    const text = (texts[i] ?? "").trim();
    if (reference && text) verses.push({ reference, text });
  }
  return verses;
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const title = String(formData.get("title") ?? "Nouvel article").trim() || "Nouvel article";
  const type = String(formData.get("type") ?? "qdlb");
  if (!["qdlb", "vs", "rm"].includes(type)) return;

  const { data, error } = await supabase
    .from("articles")
    .insert({
      type,
      title,
      slug: slugify(title) + "-" + Math.random().toString(36).slice(2, 7),
      article_date: new Date().toISOString().slice(0, 10),
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) return;
  revalidatePath("/admin/publications");
  redirect(`/admin/publications/${data.id}`);
}

async function saveArticle(formData: FormData, status?: "draft" | "published") {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const title = String(formData.get("title") ?? "").trim();
  if (!id || !title) return;

  const body = String(formData.get("body") ?? "").trim();
  const type = String(formData.get("type") ?? "qdlb");

  const update: Record<string, unknown> = {
    title,
    article_date: String(formData.get("article_date") ?? "") || undefined,
    excerpt: String(formData.get("excerpt") ?? "").trim() || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    cover_alt: String(formData.get("cover_alt") ?? "").trim() || null,
    author_name: String(formData.get("author_name") ?? "").trim() || null,
    seo_keywords: parseTags(String(formData.get("seo_keywords") ?? "")),
    related_article_ids: formData.getAll("related_article_ids").map(String).filter(Boolean),
    body: body || null,
    reading_time_minutes: body ? computeReadingTime(body) : null,
  };

  if (type === "qdlb") {
    update.verse_reference = String(formData.get("verse_reference") ?? "").trim() || null;
    update.verse_text = String(formData.get("verse_text") ?? "").trim() || null;
    update.prayer = String(formData.get("prayer") ?? "").trim() || null;
    update.further_verses = readFurtherVerses(formData);
  }
  if (type === "vs") {
    update.access = String(formData.get("access") ?? "free");
  }
  if (type === "rm") {
    update.verse_text = String(formData.get("verse_text") ?? "").trim() || null;
  }

  if (status) update.status = status;

  await supabase.from("articles").update(update).eq("id", id);
  await setArticleCategories(id, formData.getAll("category_ids").map(String).filter(Boolean));

  revalidatePath(`/admin/publications/${id}`);
  revalidatePath("/admin/publications");
  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/publications");
  revalidatePath("/rosee-matinale");
  revalidatePath("/");
  revalidatePath(`/publications/${slugify(title)}`, "page");
}

/** "Enregistrer" — sauvegarde sans changer le statut (reste en brouillon si
 * c'en était un, reste publié si c'en était un). */
export async function updateArticle(formData: FormData) {
  await saveArticle(formData);
  redirect("/admin/publications");
}

/** "Publier" — sauvegarde et passe (ou repasse) l'article en publié. */
export async function publishArticle(formData: FormData) {
  await saveArticle(formData, "published");
  redirect("/admin/publications");
}

export async function unpublishArticle(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("articles").update({ status: "draft" }).eq("id", id);
  revalidatePath("/admin/publications");
  revalidatePath("/publications");
}

export async function deleteArticle(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  if (!id) return;
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin/publications");
  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/publications");
  revalidatePath("/rosee-matinale");
  revalidatePath("/");
  // Reste sur la liste d'où l'appel vient (Publications ou Rosée Matinale) —
  // évite d'être renvoyé ailleurs après une suppression depuis la liste.
  const redirectTo = String(formData.get("redirectTo") ?? "/admin/publications");
  redirect(redirectTo);
}

// ===== Rosée Matinale — publication rapide de l'entrée du jour =====

export async function publishRosee(formData: FormData) {
  const supabase = await createClient();
  const article_date = String(formData.get("article_date") ?? "") || new Date().toISOString().slice(0, 10);
  const verse_text = String(formData.get("verse_text") ?? "").trim();
  const bodyRaw = String(formData.get("body") ?? "").trim();
  const body = bodyRaw ? paragraphsToHtml(bodyRaw) : "";
  if (!verse_text) return;

  await supabase.from("articles").insert({
    type: "rm",
    slug: `rm-${article_date}`,
    title: `Rosée Matinale — ${new Date(article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`,
    article_date,
    verse_text,
    body: body || null,
    cover_url: String(formData.get("cover_url") ?? "").trim() || null,
    cover_alt: String(formData.get("cover_alt") ?? "").trim() || null,
    seo_keywords: parseTags(String(formData.get("seo_keywords") ?? "")),
    access: "free",
    status: "published",
    reading_time_minutes: body ? computeReadingTime(body) : null,
  });

  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/rosee-matinale");
  revalidatePath("/");
  revalidatePath("/publications");
}

/** Édition d'une entrée Rosée Matinale existante — écran dédié, séparé de
 * l'éditeur d'article générique (Que Dit la Bible / La Vie Supérieure) qui a
 * des champs sans rapport pour ce format (thèmes, articles similaires...) —
 * mais garde couverture + mots-clés SEO, utiles ici aussi (cahier §3.2 + §1.5). */
export async function updateRoseeEntry(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const verse_text = String(formData.get("verse_text") ?? "").trim();
  if (!id || !verse_text) return;

  const body = String(formData.get("body") ?? "").trim();
  const article_date = String(formData.get("article_date") ?? "") || undefined;

  await supabase
    .from("articles")
    .update({
      article_date,
      title: article_date
        ? `Rosée Matinale — ${new Date(article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
        : undefined,
      verse_text,
      body: body || null,
      cover_url: String(formData.get("cover_url") ?? "").trim() || null,
      cover_alt: String(formData.get("cover_alt") ?? "").trim() || null,
      seo_keywords: parseTags(String(formData.get("seo_keywords") ?? "")),
      status: String(formData.get("status") ?? "published"),
      reading_time_minutes: body ? computeReadingTime(body) : null,
    })
    .eq("id", id);

  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/rosee-matinale");
  revalidatePath("/");
  revalidatePath("/publications");
  redirect("/admin/rosee-matinale");
}
