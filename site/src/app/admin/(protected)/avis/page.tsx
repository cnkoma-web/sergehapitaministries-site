import { createClient } from "@/lib/supabase/server";
import { moderateReview, deleteReview } from "./actions";
import Pagination from "@/components/admin/Pagination";

const STATUS_LABEL: Record<string, string> = { pending: "En attente", approved: "Approuvé", rejected: "Rejeté" };
const STATUS_CLASS: Record<string, string> = { pending: "precommande", approved: "actif", rejected: "masque" };

export default async function AdminAvisPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;
  const from = (page - 1) * perPage;

  const supabase = await createClient();
  const {
    data: reviews,
    error,
    count,
  } = await supabase
    .from("reviews")
    .select("id, author_name, rating, body, status, created_at, book_id, goodie_id, books(title), goodies(title)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  return (
    <>
      <h1>Modération des avis</h1>
      <p className="admin-lede">
        Les avis envoyés depuis les fiches livres et goodies. Rien n&apos;est visible
        publiquement tant qu&apos;il n&apos;est pas approuvé ici.
      </p>

      {error && <div className="admin-error">Impossible de charger les avis : {error.message}</div>}

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 110px 190px" }}>
          <div>Avis</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {reviews?.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucun avis pour le moment.</div>
          </div>
        )}
        {reviews?.map((r) => {
          // Le client Supabase typée en JS renvoie une relation en tableau ou en objet
          // selon la contrainte FK détectée — on gère les deux formes sans faire planter le rendu.
          const bookTitle = Array.isArray(r.books) ? r.books[0]?.title : (r.books as { title: string } | null)?.title;
          const goodieTitle = Array.isArray(r.goodies) ? r.goodies[0]?.title : (r.goodies as { title: string } | null)?.title;
          return (
            <div className="item-row" key={r.id} style={{ gridTemplateColumns: "1fr 110px 190px", alignItems: "flex-start" }}>
              <div>
                <div className="item-title">
                  {bookTitle || goodieTitle || "Produit supprimé"}
                  <span>
                    {r.author_name || "Anonyme"} {r.rating ? `— ${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}` : ""}
                  </span>
                </div>
                {r.body && <p style={{ fontSize: 13, margin: "6px 0 0", color: "var(--ink-soft)" }}>{r.body}</p>}
              </div>
              <div>
                <span className={`status-badge ${STATUS_CLASS[r.status]}`}>{STATUS_LABEL[r.status]}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <form action={moderateReview} style={{ display: "flex", gap: 6 }}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" name="status" value="approved" className="admin-btn-sm">
                    Approuver
                  </button>
                  <button type="submit" name="status" value="rejected" className="admin-btn-sm danger">
                    Rejeter
                  </button>
                </form>
                <form action={deleteReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <button type="submit" className="admin-btn-sm danger">
                    Suppr.
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {(count ?? 0) > 0 && <Pagination page={page} perPage={perPage} total={count ?? 0} basePath="/admin/avis" />}
    </>
  );
}
