import { validBearer } from "@/lib/editorial/access";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { editorialClock } from "@/lib/content/editorialClock";
import { collectSources, prepareJob } from "@/lib/editorial/workflow";
import { prepareImages } from "@/lib/editorial/prepareImages";
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
    const prepared:string[]=[];
    for (const job of result.data??[]) {
      const attempt = await db.from("editorial_jobs").update({ attempts: job.attempts + 1 }).eq("id", job.id).eq("attempts", job.attempts).select("id");
      if (attempt.error) throw attempt.error;
      if (attempt.data?.length) { await prepareJob(db, job.id); prepared.push(job.id); }
    }
    const images=await prepareImages(db,clock.targetDate);
    await db.from("editorial_runs").insert({ started_at: started, target_date: clock.targetDate, status: images.success?"ok":"failed", detail: JSON.stringify({prepared,images}) });
    return Response.json({ success: images.success, date: clock.targetDate, prepared, images },{status:images.success?200:503});
  } catch (error) {
    const message = error instanceof Error ? error.message : "Collecte interrompue.";
    await db.from("editorial_runs").insert({ started_at: started, target_date: clock.targetDate, status: "failed", detail: message });
    return Response.json({ success: false, error: message }, { status: 503 });
  }
}

