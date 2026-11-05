import { configuration } from "@/lib/editorial/providers";
import { validBearer, editorialAccess } from "@/lib/editorial/access";
import { collectSources, prepareJob, replaceDraft, approveJob, publishJob, verifyJob } from "@/lib/editorial/workflow";
import { isEditorialDate } from "@/lib/content/dailySourceParser";
import { stageRoseeThroughCms } from "@/lib/editorial/native";
export const runtime = "nodejs";
export const maxDuration = 600;

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > 2_000_000) return Response.json({ error: "Requête trop volumineuse." }, { status: 413 });
  try {
    if (!validBearer(request, process.env.EDITORIAL_OPERATOR_SECRET) && request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Origine non autorisée." }, { status: 403 });
    const raw = await request.text();
    if (raw.length > 2_000_000) return Response.json({ error: "Requête trop volumineuse." }, { status: 413 });
    const input = JSON.parse(raw);
    if (!isEditorialDate(input.date ?? "")) return Response.json({ error: "Date invalide." }, { status: 400 });
    const { db, actor } = await editorialAccess(request, input.date);
    if (input.action === "configuration") return Response.json(configuration());
    if (input.action === "collect") {
      await collectSources(db, input.date, input.documentText);
      return Response.json({ collected: true });
    }
    if (input.action === "list") {
      const result = await db.from("editorial_jobs").select("*").eq("article_date", input.date).order("type");
      if (result.error) throw result.error;
      return Response.json({ jobs: result.data });
    }
    const result = await db.from("editorial_jobs").select("id").eq("id", String(input.id)).eq("article_date", input.date).single();
    if (result.error) return Response.json({ error: "Travail introuvable." }, { status: 404 });
    if (input.action === "prepare") return Response.json({ job: await prepareJob(db, input.id) });
    if (input.action === "replace") { await replaceDraft(db, input.id, input.draft); return Response.json({ saved: true }); }
    if (input.action === "stage") {
      if (process.env.VERCEL_ENV !== "production") throw new Error("Préparation CMS autorisée uniquement en production.");
      const job = await db.from("editorial_jobs").select("*").eq("id", input.id).eq("article_date", input.date).single();
      if (job.error) throw job.error;
      const article = await stageRoseeThroughCms(db, job.data);
      const linked = await db.from("editorial_jobs").update({ article_id: article.id }).eq("id", input.id).eq("draft_hash", job.data.draft_hash).select("id").single();
      if (linked.error) throw linked.error;
      return Response.json({ article });
    }
    if (input.action === "approve") {
      const approvalJob = await db.from("editorial_jobs").select("draft").eq("id", input.id).single();
      if (approvalJob.error) throw approvalJob.error;
      if (input.confirmSource !== true || input.confirmBible !== true || (approvalJob.data.draft?.cover_url && input.confirmImage !== true)) throw new Error("Confirmer le texte et le visuel lorsqu’il est présent.");
      await approveJob(db, input.id, input.hash, actor); return Response.json({ approved: true });
    }
    if (input.action === "publish") {
      if (process.env.VERCEL_ENV !== "production") throw new Error("Publication autorisée uniquement en production.");
      return Response.json({ job: await publishJob(db, input.id) });
    }
    if (input.action === "verify") return Response.json(await verifyJob(db, input.id));
    return Response.json({ error: "Action inconnue." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Traitement impossible.";
    return Response.json({ error: message }, { status: /Accès|Opérateur/.test(message) ? 403 : 422 });
  }
}

