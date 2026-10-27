import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { parseDailySources } from "@/lib/content/dailySourceParser";
import { validatePublicationDraft } from "@/lib/content/publicationValidation";
import { fingerprint, editorialChecks, plainText, assertDraftShape } from "./checks";
import { collectGoogleDocument, writeDraft, illustrate } from "./providers";
import { publishThroughCms } from "./native";
import type { EditorialJob, EditorialDraft } from "./types";

const ORIGIN = "https://sergehapitaministries.org";
export function allChecks(draft: EditorialDraft, source?: string): string[] {
  return [...validatePublicationDraft(draft).map(issue => issue.message), ...editorialChecks(draft, source)];
}
async function getJob(db: SupabaseClient, id: string) {
  const result = await db.from("editorial_jobs").select("*").eq("id", id).single();
  if (result.error) throw result.error;
  return result.data as EditorialJob;
}
async function save(db: SupabaseClient, id: string, values: Record<string, unknown>, lease?: string) {
  let query = db.from("editorial_jobs").update({ ...values, updated_at: new Date().toISOString() }).eq("id", id);
  if (lease) query = query.eq("lease_token", lease);
  const result = await query.select("id").single();
  if (result.error) throw result.error;
}
async function compareSave(db: SupabaseClient, job: EditorialJob, values: Record<string, unknown>) {
  let query = db.from("editorial_jobs").update({ ...values, updated_at: new Date().toISOString() })
    .eq("id", job.id).eq("status", job.status).eq("source_hash", job.source_hash).is("lease_token", null);
  query = job.draft_hash ? query.eq("draft_hash", job.draft_hash) : query.is("draft_hash", null);
  const result = await query.select("id").single();
  if (result.error) throw new Error("Le contenu est en cours de modification. Recharge la page.");
}
export async function collectSources(db: SupabaseClient, targetDate: string, documentText?: string) {
  const doc = documentText === undefined ? await collectGoogleDocument() : { text: documentText, revision: "manual-import" };
  const sources = parseDailySources(doc.text, targetDate);
  if (sources.missing.length) throw new Error("Sources manquantes pour " + targetDate + " : " + sources.missing.join(", "));
  for (const type of ["qdlb", "rm", "jc"] as const) {
    const source = sources.sections[type]!;
    const source_hash = fingerprint(source);
    const result = await db.from("editorial_jobs").select("*").eq("article_date", targetDate).eq("type", type).maybeSingle();
    if (result.error) throw result.error;
    if (result.data) {
      if (result.data.source_hash !== source_hash) {
        if (["publishing", "published", "writing"].includes(result.data.status)) throw new Error("La source a changé pendant ou après traitement : révision manuelle requise.");
        await compareSave(db, result.data as EditorialJob, { source, source_hash, source_revision: doc.revision, draft: null, draft_hash: null, approved_hash: null, approved_by: null, approved_at: null, status: "collected", last_error: null });
      }
      continue;
    }
    const article = await db.from("articles").select("id").eq("type", type).eq("article_date", targetDate);
    if (article.error) throw article.error;
    if ((article.data?.length ?? 0) > 1) throw new Error("Doublons CMS : " + type);
    const inserted = await db.from("editorial_jobs").insert({ type, article_date: targetDate, source, source_hash, source_revision: doc.revision, article_id: article.data?.[0]?.id ?? null, status: "collected" });
    if (inserted.error) throw inserted.error;
  }
  return sources;
}
export async function prepareJob(db: SupabaseClient, id: string) {
  const job = await getJob(db, id);
  if (!["collected", "failed"].includes(job.status)) return job;
  const lease = crypto.randomUUID();
  const locked = await db.from("editorial_jobs").update({ lease_token: lease, lease_until: new Date(Date.now() + 10 * 60_000).toISOString(), status: "writing" })
    .eq("id", id).in("status", ["collected", "failed"]).or("lease_until.is.null,lease_until.lt." + new Date().toISOString()).select("id");
  if (locked.error) throw locked.error;
  if (!locked.data?.length) return job;
  try {
    let draft = job.draft ?? await writeDraft(job);
    await save(db, id, { draft, last_error: null }, lease);
    if (!draft.cover_url) draft = await illustrate(db, job, draft);
    const issues = allChecks(draft, job.source);
    await save(db, id, { draft, draft_hash: fingerprint({ source_hash: job.source_hash, draft }), approved_hash: null, approved_by: null, approved_at: null, status: issues.length ? "blocked" : "review", last_error: issues.join("\n") || null, lease_token: null, lease_until: null }, lease);
  } catch (error) {
    await save(db, id, { status: "failed", last_error: error instanceof Error ? error.message : "Préparation interrompue", lease_token: null, lease_until: null }, lease);
    throw error;
  }
  return getJob(db, id);
}
export async function replaceDraft(db: SupabaseClient, id: string, draft: EditorialDraft) {
  assertDraftShape(draft);
  const job = await getJob(db, id);
  if (["publishing", "writing"].includes(job.status)) throw new Error("Ce contenu est en cours de traitement.");
  if (draft.type !== job.type || draft.article_date !== job.article_date) throw new Error("Date et rubrique doivent être conservées.");
  const issues = allChecks(draft, job.source);
  await compareSave(db, job, { draft, draft_hash: fingerprint({ source_hash: job.source_hash, draft }), approved_hash: null, approved_by: null, approved_at: null, status: issues.length ? "blocked" : "review", last_error: issues.join("\n") || null });
}
export async function approveJob(db: SupabaseClient, id: string, expectedHash: string, actor: string) {
  const job = await getJob(db, id);
  if (!job.draft || !["review", "approved"].includes(job.status)) throw new Error("Brouillon non prêt à valider.");
  const issues = allChecks(job.draft, job.source);
  if (issues.length) throw new Error(issues.join("\n"));
  const hash = fingerprint({ source_hash: job.source_hash, draft: job.draft });
  if (hash !== expectedHash || hash !== job.draft_hash) throw new Error("Le contenu a changé : relis la dernière version.");
  const result = await db.from("editorial_jobs").update({ status: "approved", approved_hash: hash, approved_by: actor, approved_at: new Date().toISOString() }).eq("id", id).eq("source_hash", job.source_hash).eq("draft_hash", hash).is("lease_token", null).in("status", ["review", "approved"]).select("id").single();
  if (result.error) throw result.error;
}
export async function publishJob(db: SupabaseClient, id: string) {
  const job = await getJob(db, id);
  if (job.status === "published") return job;
  if (!job.draft || job.status !== "approved" || !job.approved_by || job.approved_hash !== job.draft_hash || fingerprint({ source_hash: job.source_hash, draft: job.draft }) !== job.approved_hash) throw new Error("Validation explicite de cette version requise.");
  const issues = allChecks(job.draft, job.source);
  if (issues.length) throw new Error(issues.join("\n"));
  const lease = crypto.randomUUID();
  const result = await db.from("editorial_jobs").update({ status: "publishing", lease_token: lease, lease_until: new Date(Date.now() + 5 * 60_000).toISOString() }).eq("id", id).eq("status", "approved").eq("approved_hash", job.approved_hash).select("id").single();
  if (result.error) throw new Error("Une autre publication est en cours.");
  try {
    const article = await publishThroughCms(db, job);
    const public_url = ORIGIN + article.path;
    await save(db, id, { article_id: article.id, public_url }, lease);
    for (const path of [article.path, "/", "/publications", "/rosee-matinale", "/publications/que-dit-la-bible", "/publications/je-confesse-et-declare", "/sitemap.xml"]) revalidatePath(path);
    await save(db, id, { status: "published", last_error: null, lease_token: null, lease_until: null }, lease);
    return getJob(db, id);
  } catch (error) {
    await save(db, id, { status: "approved", last_error: error instanceof Error ? error.message : "Publication interrompue", lease_token: null, lease_until: null }, lease);
    throw error;
  }
}
export async function verifyJob(db: SupabaseClient, id: string) {
  const job = await getJob(db, id);
  if (!job.public_url || job.status !== "published" || new URL(job.public_url).origin !== ORIGIN) throw new Error("Publication publique absente.");
  const response = await fetch(job.public_url, { cache: "no-store", signal: AbortSignal.timeout(30_000) });
  const html = await response.text();
  const text = plainText(html).replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;/g, '"');
  const expected = plainText(job.draft!.body).slice(0, 100);
  const imagePresent = Boolean(job.draft?.cover_url && (html.includes(job.draft.cover_url) || html.includes(encodeURIComponent(job.draft.cover_url))));
  if (!response.ok || !text.includes(expected) || !imagePresent || !html.includes('property="og:image"') || !html.includes('rel="canonical"')) {
    await save(db, id, { last_error: "Vérification publique en échec (HTTP, texte, image ou métadonnées).", verified_at: null });
    throw new Error("Vérification publique en échec.");
  }
  await save(db, id, { verified_at: new Date().toISOString(), last_error: null });
  return { url: job.public_url, status: response.status, verified: true };
}

