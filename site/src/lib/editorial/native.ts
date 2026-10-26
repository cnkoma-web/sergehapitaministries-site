import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { withPublicationClient } from "./context";
import type { EditorialJob } from "./types";
import { createArticle, publishArticle, publishRosee, publishConfession, updateRoseeEntry, updateConfessionEntry } from "@/app/admin/(protected)/publications/actions";
import { computeReadingTime } from "@/lib/readingTime";

async function invoke(action: (form: FormData) => Promise<unknown>, form: FormData) {
  try { await action(form); }
  catch (error) {
    const digest = (error as { digest?: string }).digest;
    if (!digest?.startsWith("NEXT_REDIRECT;")) throw error;
    const destination = digest.split(";")[2];
    if (destination?.includes("error=")) throw new Error("Le CMS a refusé la publication : " + destination);
    return destination;
  }
}
export async function publishThroughCms(db: SupabaseClient, job: EditorialJob) {
  const draft = job.draft!;
  const { data: rows, error } = await db.from("articles").select("*").eq("article_date", job.article_date).eq("type", job.type);
  if (error) throw error;
  if ((rows?.length ?? 0) > 1) throw new Error("Plusieurs articles correspondent à cette date et cette rubrique.");
  let existing = rows?.[0];
  if (job.article_id && existing?.id !== job.article_id) throw new Error("L'identité de l'article a changé.");
  const previousSlug = existing?.slug;
  const form = new FormData();
  for (const key of ["title", "article_date", "type", "body", "verse_text", "verse_reference", "excerpt", "prayer", "cover_url", "cover_alt", "author_name"] as const) form.set(key, String(draft[key] ?? ""));
  form.set("seo_keywords", draft.seo_keywords.join(", "));
  form.set("status", "published");
  form.set("access", existing?.access ?? "free");
  form.set("podcast_episode_id", existing?.podcast_episode_id ?? "");
  form.set("toc_keywords", (existing?.toc_keywords ?? []).join("\n"));
  for (const id of existing?.related_article_ids ?? []) form.append("related_article_ids", id);
  for (const verse of draft.further_verses ?? []) {
    form.append("further_verse_reference", verse.reference);
    form.append("further_verse_text", verse.text);
  }
  await withPublicationClient(db, async () => {
    if (!existing && job.type === "qdlb") {
      const destination = await invoke(createArticle, form);
      const id = destination?.match(/\/admin\/publications\/([0-9a-f-]{36})/)?.[1];
      if (!id) throw new Error("Le CMS n'a pas confirmé la création du brouillon.");
      const result = await db.from("articles").select("*").eq("id", id).single();
      if (result.error) throw result.error;
      existing = result.data;
    }
    if (existing) {
      form.set("id", existing.id);
      form.set("was_published", existing.status === "published" ? "1" : "0");
      const categories = await db.from("article_categories").select("category_id").eq("article_id", existing.id);
      if (categories.error) throw categories.error;
      for (const row of categories.data ?? []) form.append("category_ids", row.category_id);
      await invoke(job.type === "rm" ? updateRoseeEntry : job.type === "jc" ? updateConfessionEntry : publishArticle, form);
    } else {
      await invoke(job.type === "rm" ? publishRosee : publishConfession, form);
    }
  });
  const result = await db.from("articles").select("*").eq("article_date", job.article_date).eq("type", job.type).single();
  if (result.error) throw result.error;
  const article = result.data;
  if (article.status !== "published" || article.body !== draft.body || article.title !== draft.title || article.reading_time_minutes !== computeReadingTime(draft.body) || article.cover_url !== draft.cover_url || article.cover_alt !== draft.cover_alt || JSON.stringify(article.seo_keywords) !== JSON.stringify(draft.seo_keywords)) throw new Error("La relecture CMS ne correspond pas à la publication attendue.");
  if (existing && (article.id !== existing.id || (previousSlug && article.slug !== previousSlug))) throw new Error("Identifiant ou URL modifié.");
  return { id: article.id, path: job.type === "rm" ? "/rosee-matinale/" + job.article_date : job.type === "jc" ? "/publications/je-confesse-et-declare/" + job.article_date : "/publications/" + article.slug };
}
