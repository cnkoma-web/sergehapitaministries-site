import { validBearer } from "@/lib/editorial/access";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { editorialClock } from "@/lib/content/editorialClock";
import { collectSources, prepareJob, verifyJob } from "@/lib/editorial/workflow";
export const runtime = "nodejs";
export const maxDuration = 600;
export async function GET(request: Request) {
  if (!validBearer(request, process.env.CRON_SECRET)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (process.env.VERCEL_ENV !== "production") return Response.json({ skipped: "preview" });
  const clock = editorialClock();
  if (!clock.collectionDue) return Response.json({ skipped: "outside-paris-23h" });
  const db = createServiceRoleClient();
  const started = new Date().toISOString();
  try {
    // Une relance ne réécrit jamais un brouillon revu ou approuvé.
    await db.from("editorial_jobs").update({ status: "failed", last_error: "Préparation interrompue ; reprise possible.", lease_token: null, lease_until: null }).eq("status", "writing").lt("lease_until", started);
    await collectSources(db, clock.targetDate);
    const result = await db.from("editorial_jobs").select("id,attempts").eq("article_date", clock.targetDate).in("status", ["collected", "failed"]).lt("attempts", 3).order("type").limit(1);
    if (result.error) throw result.error;
    const job = result.data?.[0];
    if (job) {
      const attempt = await db.from("editorial_jobs").update({ attempts: job.attempts + 1 }).eq("id", job.id).eq("attempts", job.attempts).select("id");
      if (attempt.error) throw attempt.error;
      if (attempt.data?.length) await prepareJob(db, job.id);
    }
    const unverified = await db.from("editorial_jobs").select("id").eq("status", "published").is("verified_at", null).limit(3);
    // Une vérification d’archive reste indépendante de la préparation du lendemain.
    const verificationErrors: string[] = [];
    for (const row of unverified.data ?? []) {
      try { await verifyJob(db, row.id); }
      catch(error) { verificationErrors.push(row.id+": "+(error instanceof Error ? error.message : "Vérification interrompue")); }
    }
    await db.from("editorial_runs").insert({ started_at: started, target_date: clock.targetDate, status: "ok", detail: job ? "Préparation " + job.id : "File déjà traitée" });
    return Response.json({ success: true, date: clock.targetDate, prepared: job?.id ?? null, verificationErrors });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Collecte interrompue.";
    await db.from("editorial_runs").insert({ started_at: started, target_date: clock.targetDate, status: "failed", detail: message });
    return Response.json({ success: false, error: message }, { status: 503 });
  }
}

