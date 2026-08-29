import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { toggleShipped } from "./actions";
import Pagination from "@/components/admin/Pagination";

const STATUS_LABEL: Record<string, string> = { pending: "En attente", paid: "Payée", failed: "Échouée", refunded: "Remboursée" };
const STATUS_CLASS: Record<string, string> = { pending: "masque", paid: "actif", failed: "masque", refunded: "masque" };

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
