import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { toggleShipped } from "./actions";
import Pagination from "@/components/admin/Pagination";

// Libellés explicites plutôt que "En attente" seul (retour du 06/09) — Serge
// ne savait pas si "en attente" voulait dire en attente de paiement, de
// préparation ou d'expédition. Chaque statut correspond à une étape précise
// du paiement Stripe (jamais de la préparation/expédition, qui est suivie à
// part via la colonne "Expédition" ci-dessous) :
// - pending : commande créée, paiement pas encore confirmé par Stripe.
// - paid : paiement confirmé (webhook Stripe) — c'est là que la commande
//   devient concrète pour Serge, à préparer et expédier.
// - failed : le paiement a échoué (carte refusée, session Stripe abandonnée…).
// - refunded : commande remboursée.
const STATUS_LABEL: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  failed: "Paiement échoué",
  refunded: "Remboursée",
};
const STATUS_CLASS: Record<string, string> = { pending: "precommande", paid: "actif", failed: "masque", refunded: "masque" };

export default async function AdminCommandesPage({ searchParams }: { searchParams: Promise<{ page?: string; perPage?: string }> }) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data: orders, count } = await supabase
    .from("orders")
    .select("id, status, total_cents, customer_email, shipped, created_at, order_items(title_snapshot, quantity)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);

  return (
    <>
      <div className="admin-header">
        <h2>Commandes</h2>
      </div>
      <p className="admin-lede">Les commandes de livres et goodies passées sur le site.</p>

      {/* Légende des statuts (retour du 06/09) — demandée explicitement par
          Serge, qui ne savait pas ce que "En attente" signifiait concrètement. */}
      <div className="admin-note" style={{ marginTop: 0, marginBottom: 24 }}>
        <strong>Statut</strong> = étape du paiement Stripe, jamais de la préparation/expédition :
        <br />« En attente de paiement » = commande créée, paiement pas encore confirmé — rien à faire.
        <br />« Payée » = paiement confirmé, c&apos;est à partir de là qu&apos;une commande est à préparer.
        <br />« Paiement échoué » / « Remboursée » = rien à expédier.
        <br />
        <strong>Expédition</strong> — bouton « Marquer expédiée » visible uniquement sur les commandes payées : à cliquer une fois le colis envoyé.
      </div>

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 1fr 100px 90px 110px 120px" }}>
          <div>Client</div>
          <div>Articles</div>
          <div>Total</div>
          <div>Statut</div>
          <div>Expédition</div>
          <div>Date</div>
        </div>
        {orders?.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucune commande pour le moment.</div>
          </div>
        )}
        {orders?.map((o) => (
          <div className="item-row" key={o.id} style={{ gridTemplateColumns: "1fr 1fr 100px 90px 110px 120px" }}>
            <div style={{ fontSize: 13 }}>{o.customer_email || "—"}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
              {(Array.isArray(o.order_items) ? o.order_items : []).map((i) => `${i.title_snapshot} ×${i.quantity}`).join(", ")}
            </div>
            <div style={{ fontWeight: 700 }}>{formatPrice(o.total_cents)}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[o.status]}`}>{STATUS_LABEL[o.status] ?? o.status}</span>
            </div>
            <div>
              {o.status === "paid" ? (
                <form action={toggleShipped}>
                  <input type="hidden" name="id" value={o.id} />
                  <input type="hidden" name="shipped" value={String(o.shipped)} />
                  <button type="submit" className="admin-btn-sm">
                    {o.shipped ? "Expédiée ✓" : "Marquer expédiée"}
                  </button>
                </form>
              ) : (
                <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>—</span>
              )}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{new Date(o.created_at).toLocaleDateString("fr-FR")}</div>
          </div>
        ))}
      </div>

      {(count ?? 0) > 0 && <Pagination page={page} perPage={perPage} total={count ?? 0} basePath="/admin/commandes" />}
    </>
  );
}
