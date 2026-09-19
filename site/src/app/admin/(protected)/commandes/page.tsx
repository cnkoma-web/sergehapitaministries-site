import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import {
  FULFILLMENT_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  shortOrderReference,
  type FulfillmentStatus,
  type OrderPaymentStatus,
} from "@/lib/orders/fulfillment";
import Pagination from "@/components/admin/Pagination";

const STATUS_CLASS: Record<string, string> = { pending: "precommande", paid: "actif", failed: "masque", refunded: "masque" };

export default async function AdminCommandesPage({ searchParams }: { searchParams: Promise<{ page?: string; perPage?: string }> }) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const requestedPerPage = Number(perPageParam);
  const perPage = [20, 50, 100].includes(requestedPerPage) ? requestedPerPage : 20;

  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data: orders, count, error } = await supabase
    .from("orders")
    .select("id, status, fulfillment_status, total_cents, customer_email, created_at, order_items(title_snapshot, quantity)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);
  if (error) throw new Error(`Lecture des commandes impossible : ${error.message}`);

  return (
    <>
      <div className="admin-header">
        <h2>Commandes</h2>
      </div>
      <p className="admin-lede">Paiement et traitement logistique sont suivis séparément, de la confirmation à la livraison.</p>

      <div className="admin-note" style={{ marginTop: 0, marginBottom: 24 }}>
        Une commande devient à traiter uniquement après confirmation du paiement par Stripe. Ouvrez-la ensuite pour la faire avancer :
        <strong> confirmée → en préparation → expédiée → livrée</strong>.
      </div>

      <div className="items-table order-admin-table" role="table" aria-label="Liste des commandes" tabIndex={0}>
        <div className="item-row head order-admin-row" role="row">
          <div role="columnheader">Commande</div>
          <div role="columnheader">Client et articles</div>
          <div role="columnheader">Total</div>
          <div role="columnheader">Paiement</div>
          <div role="columnheader">Traitement</div>
          <div role="columnheader">Date</div>
          <div role="columnheader">Action</div>
        </div>
        {orders?.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucune commande pour le moment.</div>
          </div>
        )}
        {orders?.map((order) => {
          const paymentLabel = PAYMENT_STATUS_LABEL[order.status as OrderPaymentStatus] ?? order.status;
          const fulfillmentLabel = order.fulfillment_status
            ? FULFILLMENT_STATUS_LABEL[order.fulfillment_status as FulfillmentStatus] ?? order.fulfillment_status
            : "Non commencé";
          return (
            <div className="item-row order-admin-row" key={order.id} role="row">
              <div className="order-admin-reference" role="cell">#{shortOrderReference(order.id)}</div>
              <div role="cell">
                <div style={{ fontSize: 13, fontWeight: 650 }}>{order.customer_email || "Adresse non renseignée"}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 4 }}>
                  {(Array.isArray(order.order_items) ? order.order_items : []).map((item) => `${item.title_snapshot} ×${item.quantity}`).join(", ")}
                </div>
              </div>
              <div style={{ fontWeight: 700 }} role="cell">{formatPrice(order.total_cents)}</div>
              <div role="cell"><span className={`status-badge ${STATUS_CLASS[order.status] ?? "precommande"}`}>{paymentLabel}</span></div>
              <div role="cell">
                <span className={`fulfillment-badge fulfillment-${order.fulfillment_status ?? "none"}`}>{fulfillmentLabel}</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }} role="cell">{new Date(order.created_at).toLocaleDateString("fr-FR")}</div>
              <div role="cell"><Link className="admin-btn-sm order-admin-open" href={`/admin/commandes/${order.id}`} aria-label={`Ouvrir la commande ${shortOrderReference(order.id)}`}>Ouvrir</Link></div>
            </div>
          );
        })}
      </div>

      {(count ?? 0) > 0 && <Pagination page={page} perPage={perPage} total={count ?? 0} basePath="/admin/commandes" />}
    </>
  );
}
