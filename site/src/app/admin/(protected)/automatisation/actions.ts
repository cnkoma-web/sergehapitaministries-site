"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { collectSources, prepareJob, replaceDraft, approveJob, publishJob, verifyJob } from "@/lib/editorial/workflow";
import { editorialClock } from "@/lib/content/editorialClock";
import type { EditorialDraft } from "@/lib/editorial/types";
function escape(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
export async function editorialAction(form: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Accès administrateur requis.");
  const db = await createClient();
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action"));
  let message = "Enregistré.";
  try {
    if (action === "collect") await collectSources(db, String(form.get("date") ?? editorialClock().targetDate));
    else {
      const result = await db.from("editorial_jobs").select("*").eq("id", id).single();
      if (result.error) throw result.error;
      if (action === "prepare") await prepareJob(db, id);
      else if (action === "save") {
        const draft: EditorialDraft = { ...result.data.draft };
        for (const key of ["title","verse_text","verse_reference","excerpt","prayer","cover_alt"] as const) {
          draft[key] = String(form.get(key) ?? "").trim();
        }
        let body = String(form.get("body_text") ?? "").split(/\n\s*\n/).filter(p => p.trim()).map(p => "<p>" + escape(p.trim()) + "</p>").join("");
        const highlight = String(form.get("highlight") ?? "").trim();
        if (highlight && draft.type === "rm") body = body.replace(escape(highlight), "<mark>" + escape(highlight) + "</mark>");
        draft.body = body;
        draft.seo_keywords = String(form.get("seo_keywords") ?? "").split(",").map(s => s.trim()).filter(Boolean);
        draft.further_verses = form.getAll("further_reference").map((reference,i) => ({ reference: String(reference).trim(), text: String(form.getAll("further_text")[i] ?? "").trim() })).filter(v => v.reference || v.text);
        await replaceDraft(db, id, draft);
        message = "Brouillon enregistré. La validation précédente a été annulée.";
      } else if (action === "approve") {
        if (form.get("source_ok") !== "on" || form.get("bible_ok") !== "on" || form.get("image_ok") !== "on") throw new Error("Les trois contrôles de relecture sont obligatoires.");
        await approveJob(db, id, String(form.get("hash")), admin.user.id);
        message = "Contenu validé. Tu peux le publier.";
      } else if (action === "publish") {
        if (process.env.VERCEL_ENV !== "production") throw new Error("La publication est réservée à la production.");
        await publishJob(db, id);
        await verifyJob(db, id);
        message = "Publié et vérifié sur le site.";
      } else if (action === "verify") { await verifyJob(db, id); message = "Publication publique vérifiée."; }
      else throw new Error("Action inconnue.");
    }
  } catch (error) {
    message = error instanceof Error ? error.message : "Traitement impossible.";
  }
  revalidatePath("/admin/automatisation");
  redirect("/admin/automatisation?message=" + encodeURIComponent(message) + (id ? "#" + id : ""));
}
