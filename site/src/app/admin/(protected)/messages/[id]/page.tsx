import { notFound } from "next/navigation";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// Ouvrir un message le marque automatiquement comme lu (retour du 06/09) —
// avant, la seule façon de "lire" un message était l'aperçu tronqué de la
// liste, sans jamais rien marquer comme lu (bouton "Marquer lu" séparé,
// facilement ignoré). Même principe qu'une boîte mail classique : consulter
// = lu. Le vrai bug empêchant même le bouton "Marquer lu" de fonctionner
// (permission manquante en base) est corrigé séparément, voir la migration
// 20260906010000_admin_todo_flags_update_grant.sql.
export default async function AdminMessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: message } = await supabase
    .from("contact_submissions")
    .select("id, nom, email, sujet, message, read, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!message) notFound();

  if (!message.read) {
    const { error } = await supabase.from("contact_submissions").update({ read: true }).eq("id", id);
    if (error) console.error("AdminMessageDetailPage mark read:", error);
    revalidatePath("/admin/messages");
    revalidatePath("/admin");
  }

  return (
    <>
      <div className="admin-header">
        <h2>Message de contact</h2>
      </div>
      <p className="admin-lede">
        <Link href="/admin/messages">← Retour à la liste</Link>
      </p>

      <div className="admin-card" style={{ maxWidth: 640 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{message.sujet}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {message.nom} · <a href={`mailto:${message.email}`} style={{ color: "var(--purple)" }}>{message.email}</a>
            </div>
          </div>
          <span className="status-badge actif">Lu</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 18 }}>
          Reçu le {new Date(message.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
        </div>
        <div style={{ fontSize: 14.5, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{message.message}</div>
      </div>
    </>
  );
}
