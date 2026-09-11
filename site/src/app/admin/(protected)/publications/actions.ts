"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { computeReadingTime } from "@/lib/readingTime";
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
  // Modifiable depuis l'éditeur (retour du 06/09) — avant, seule la création
  // fixait la catégorie ; un article créé par erreur dans la mauvaise
  // rubrique restait bloqué. "rm" n'est jamais une valeur possible ici : cet
  // écran redirige déjà vers l'éditeur Rosée Matinale dédié pour ce type
  // (voir publications/[id]/page.tsx), qui n'appelle jamais cette fonction.
  const typeRaw = String(formData.get("type") ?? "qdlb");
  const type = typeRaw === "vs" ? "vs" : "qdlb";

  const update: Record<string, unknown> = {
    type,
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
    // Prière & Déclaration (retour du 07/09) — champ commun aux deux types
    // depuis son extension à La Vie Supérieure, plus réservé à Que Dit la
    // Bible seul.
    prayer: String(formData.get("prayer") ?? "").trim() || null,
  };

  if (type === "qdlb") {
    update.verse_reference = String(formData.get("verse_reference") ?? "").trim() || null;
    update.verse_text = String(formData.get("verse_text") ?? "").trim() || null;
    update.further_verses = readFurtherVerses(formData);
  }
  if (type === "vs") {
    update.access = String(formData.get("access") ?? "free");
  }

  if (status) update.status = status;

  await supabase.from("articles").update(update).eq("id", id);
  await setArticleCategories(id, formData.getAll("category_ids").map(String).filter(Boolean));

  revalidatePath(`/admin/publications/${id}`);
  revalidatePath("/admin/publications");
  revalidatePath("/admin/rosee-matinale");
  revalidatePath("/publications");
  // Un changement de catégorie déplace l'article d'un hub à l'autre (retour
  // du 06/09) — les deux doivent être rafraîchis, pas seulement celui de la
  // catégorie actuelle.
  revalidatePath("/publications/que-dit-la-bible");
  revalidatePath("/publications/la-vie-superieure");
  revalidatePath("/rosee-matinale");
  revalidatePath("/");
  revalidatePath(`/publications/${slugify(title)}`, "page");
}

/** "Enregistrer" — sauvegarde sans changer le statut (reste en brouillon si
 * c'en était un, reste publié si c'en était un). Retour du 05/09 : reste sur
 * l'écran d'édition (avec confirmation, voir SavedToast) au lieu de
 * renvoyer vers la liste — le retour à la liste redevient un choix manuel
 * de Serge (lien "← Retour à la liste" déjà présent sur l'écran). */
export async function updateArticle(formData: FormData) {
  const id = String(formData.get("id"));
  await saveArticle(formData);
  redirect(`/admin/publications/${id}?saved=1`);
}

/** "Publier" / "Mettre à jour" — sauvegarde et passe (ou repasse) l'article
 * en publié. Retour du 06/09 (2e passage) : redirige vers la liste
 * seulement pour un VRAI premier "Publier" (brouillon → publié, un
 * événement qui mérite d'aller le voir apparaître dans la liste) — pas pour
 * "Mettre à jour" un article déjà publié, qui n'a pas plus de raison de
 * quitter l'écran que "Enregistrer". Avant ce correctif, les deux boutons
 * ("Enregistrer" et "Mettre à jour", tous deux visibles côte à côte une
 * fois l'article publié) redirigeaient différemment sans que leur libellé
 * ne le laisse deviner — source probable de la confusion signalée sur les
 * articles La Vie Supérieure ("Mettre à jour" pris pour le bouton de
 * sauvegarde silencieuse). */
export async function publishArticle(formData: FormData) {
  const id = String(formData.get("id"));
  const wasAlreadyPublished = String(formData.get("was_published")) === "1";
  await saveArticle(formData, "published");
  if (wasAlreadyPublished) redirect(`/admin/publications/${id}?saved=1`);
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
  revalidatePath("/admin/je-confesse");
  revalidatePath("/publications");
  revalidatePath("/rosee-matinale");
  revalidatePath("/publications/je-confesse-et-declare");
  revalidatePath("/");
  // Reste sur la liste d'où l'appel vient (Publications, Rosée Matinale ou
  // Je Confesse) — évite d'être renvoyé ailleurs après une suppression
  // depuis la liste.
  const redirectTo = String(formData.get("redirectTo") ?? "/admin/publications");
  redirect(redirectTo);
}

// ===== Rosée Matinale — publication rapide de l'entrée du jour =====

export async function publishRosee(formData: FormData) {
  const supabase = await createClient();
  const article_date = String(formData.get("article_date") ?? "") || new Date().toISOString().slice(0, 10);
  const verse_text = String(formData.get("verse_text") ?? "").trim();
  // Plus de paragraphsToHtml ici (retour du 07/09) — ce champ vient
  // désormais du même RichTextEditor que l'écran d'édition (retour du
  // 07/09, unification des deux éditeurs), qui produit déjà du HTML tout
  // fait via son propre champ caché, pas du texte brut à convertir en
  // paragraphes comme le faisait l'ancien <textarea> simple.
  const body = String(formData.get("body") ?? "").trim();
  if (!verse_text) return;

  // Champ "Titre" (retour du 07/09) — optionnel : laissé vide, on retombe
  // sur l'ancien comportement (titre reconstruit depuis la date), utilisé
  // ailleurs sur le site (liste "Articles similaires", message de partage)
  // tant que Serge n'a pas renseigné un vrai titre pour cette entrée.
  const submittedTitle = String(formData.get("title") ?? "").trim();
  const autoTitle = `Rosée Matinale — ${new Date(article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  await supabase.from("articles").insert({
    type: "rm",
    slug: `rm-${article_date}`,
    title: submittedTitle || autoTitle,
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

  // Champ "Titre" (retour du 07/09) — même règle qu'à la création : vide,
  // le titre continue de se reconstruire depuis la date (comportement
  // d'origine, avant ce champ) ; rempli, il prend le dessus et n'est plus
  // écrasé par un changement de date ultérieur.
  const submittedTitle = String(formData.get("title") ?? "").trim();
  const autoTitle = article_date
    ? `Rosée Matinale — ${new Date(article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    : undefined;

  await supabase
    .from("articles")
    .update({
      article_date,
      title: submittedTitle || autoTitle,
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
  // Reste sur l'écran d'édition (retour du 05/09) — voir le commentaire
  // équivalent sur updateArticle ci-dessus.
  redirect(`/admin/rosee-matinale/${id}?saved=1`);
}

// ===== Je Confesse (Lot 4, 11/09) — même principe exact que Rosée
// Matinale ci-dessus : publication rapide de l'entrée du jour + écran
// d'édition dédié. Différences volontaires avec Rosée Matinale (cahier) :
// pas de champ "Titre" du tout (jamais de titre éditorial, contrairement à
// Rosée Matinale — le titre reste toujours reconstruit depuis la date, y
// compris à l'usage interne : liste admin, message de partage, "Articles
// similaires"), une référence biblique distincte du texte de la
// proclamation (verse_reference + verse_text, comme Que Dit la Bible),
// pas d'image de couverture (le hero Je Confesse est un dégradé, jamais
// une photo — voir prototype-html/publications/je-confesse-et-declare),
// et un corps (déclaration développée) obligatoire, pas facultatif. =====

export async function publishConfession(formData: FormData) {
  const supabase = await createClient();
  const article_date = String(formData.get("article_date") ?? "") || new Date().toISOString().slice(0, 10);
  const verse_reference = String(formData.get("verse_reference") ?? "").trim();
  const verse_text = String(formData.get("verse_text") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!verse_text || !body) return;

  const title = `Je Confesse — ${new Date(article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  await supabase.from("articles").insert({
    type: "jc",
    slug: `jc-${article_date}`,
    title,
    article_date,
    verse_reference: verse_reference || null,
    verse_text,
    body,
    seo_keywords: parseTags(String(formData.get("seo_keywords") ?? "")),
    access: "free",
    status: "published",
    reading_time_minutes: computeReadingTime(body),
  });

  revalidatePath("/admin/je-confesse");
  revalidatePath("/publications/je-confesse-et-declare");
  revalidatePath("/");
  revalidatePath("/publications");
}

export async function updateConfessionEntry(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));
  const verse_text = String(formData.get("verse_text") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id || !verse_text || !body) return;

  const article_date = String(formData.get("article_date") ?? "") || undefined;
  const title = article_date
    ? `Je Confesse — ${new Date(article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`
    : undefined;

  await supabase
    .from("articles")
    .update({
      article_date,
      title,
      verse_reference: String(formData.get("verse_reference") ?? "").trim() || null,
      verse_text,
      body,
      seo_keywords: parseTags(String(formData.get("seo_keywords") ?? "")),
      status: String(formData.get("status") ?? "published"),
      reading_time_minutes: computeReadingTime(body),
    })
    .eq("id", id);

  revalidatePath("/admin/je-confesse");
  revalidatePath("/publications/je-confesse-et-declare");
  revalidatePath("/");
  revalidatePath("/publications");
  redirect(`/admin/je-confesse/${id}?saved=1`);
}
