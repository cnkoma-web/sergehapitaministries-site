import { createClient } from "@/lib/supabase/server";
import { moderateReview, deleteReview } from "./actions";

const STATUS_LABEL: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };

export default async function AdminAvisPage() {
  const supabase = await createClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, author_name, rating, body, status, created_at, book_id, goodie_id, books(title), goodies(title)")
    .order("created_at", { ascending: false });

  return (
    <>
      <h1>Modération des avis</h1>
      <p className="admin-lede">
        Les avis envoyés depuis les fiches livres et goodies. Rien n&apos;est visible
        publiquement tant qu&apos;il n&apos;est pas approuvé ici.
      </p>

      {error && <div className="admin-error">Impossible de charger les avis : {error.message}</div>}

      <div className="admin-card">
        {reviews?.length === 0 && <div className="admin-row-empty">Aucun avis pour le moment.</div>}
        {reviews?.map((r) => {
          // Le client Supabase typée en JS renvoie une relation en tableau ou en objet
          // selon la contrainte FK détectée — on gère les deux formes sans faire planter le rendu.
          const bookTitle = Array.isArray(r.books) ? r.books[0]?.title : (r.books as { title: string } | null)?.title;
          const goodieTitle = Array.isArray(r.goodies) ? r.goodies[0]?.title : (r.goodies as { title: string } | null)?.title;
          return (
            <div className="admin-row" key={r.id} style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                  {bookTitle || goodieTitle || "Produit supprimé"}
                  <span className={`admin-badge ${r.status === "approved" ? "active" : "inactive"}`} style={{ marginLeft: 10 }}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", margin: "4px 0" }}>
                  {r.author_name || "Anonyme"} {r.rating ? `— ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}` : ""}
                </div>
                {r.body && <p style={{ fontSize: 14, margin: 0 }}>{r.body}</p>}
              </div>
              <form action={moderateReview} style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" name="status" value="approved" className="admin-btn-sm">Approuver</button>
                <button type="submit" name="status" value="rejected" className="admin-btn-sm danger">Rejeter</button>
              </form>
              <form action={deleteReview}>
                <input type="hidden" name="id" value={r.id} />
                <button type="submit" className="admin-btn-sm danger">Suppr.</button>
              </form>
            </div>
          );
        })}
      </div>
    </>
  );
}
