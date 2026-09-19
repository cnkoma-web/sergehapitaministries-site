import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import {
  FULFILLMENT_STATUS_LABEL,
  FULFILLMENT_STEPS,
  NEXT_FULFILLMENT_STATUS,
  PAYMENT_STATUS_LABEL,
  isFulfillmentStatus,
  shortOrderReference,
  type OrderPaymentStatus,
} from "@/lib/orders/fulfillment";
import { advanceOrderFulfillment, resendOrderNotification, updateOrderTracking } from "../actions";

type Address = {
  line1?: string | null;
  line2?: string | null;
  postal_code?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
};

function asAddress(value: unknown): Address | null {
  return value && typeof value === "object" ? (value as Address) : null;
}

function displayDate(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
    : "À venir";
}

export default async function AdminCommandeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, status, subtotal_cents, shipping_cents, total_cents, customer_email, created_at, paid_at, refunded_at, refunded_cents, fulfillment_status, confirmed_at, preparing_at, shipped_at, delivered_at, tracking_carrier, tracking_number, tracking_url, shipping_recipient_name, shipping_phone, shipping_address, confirmation_email_sent_at, shipping_email_sent_at, delivery_email_sent_at, order_items(title_snapshot, quantity, unit_price_cents, variant_size, variant_color)"
    )
    .eq("id", id)
    .maybeSingle();

  if (orderError) throw new Error(`Lecture de la commande impossible : ${orderError.message}`);
  if (!order) notFound();

  const address = asAddress(order.shipping_address);
  const fulfillment = isFulfillmentStatus(order.fulfillment_status) ? order.fulfillment_status : null;
  const nextStatus = fulfillment ? NEXT_FULFILLMENT_STATUS[fulfillment] : null;
  const timelineDates = {
    confirmedAt: order.confirmed_at,
    preparingAt: order.preparing_at,
    shippedAt: order.shipped_at,
    deliveredAt: order.delivered_at,
  };

  return (
    <>
      <Link href="/admin/commandes" className="admin-back-link">← Retour aux commandes</Link>
      <div className="admin-header order-detail-header">
        <div>
          <p className="admin-kicker">Commande</p>
          <h2>#{shortOrderReference(order.id)}</h2>
        </div>
        <span className={`status-badge ${order.status === "paid" ? "actif" : order.status === "pending" ? "precommande" : "masque"}`}>
          {PAYMENT_STATUS_LABEL[order.status as OrderPaymentStatus] ?? order.status}
        </span>
      </div>

      <div className="order-detail-grid">
        <section className="order-detail-card">
          <h3>Traitement</h3>
          {fulfillment ? (
            <>
              <ol className="fulfillment-timeline">
                {FULFILLMENT_STEPS.map((step, index) => {
                  const currentIndex = FULFILLMENT_STEPS.findIndex((candidate) => candidate.id === fulfillment);
                  const completed = index <= currentIndex;
                  const current = step.id === fulfillment;
                  return (
                    <li key={step.id} className={completed ? "is-complete" : undefined} aria-current={current ? "step" : undefined}>
                      <span className="fulfillment-dot" />
                      <div>
                        <strong>{step.label}</strong>
                        <small>{displayDate(timelineDates[step.dateKey])}</small>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {order.status === "paid" && nextStatus && (
                <form action={advanceOrderFulfillment} className="order-advance-form">
                  <input type="hidden" name="id" value={order.id} />
                  <input type="hidden" name="expected_status" value={fulfillment} />
                  {nextStatus === "shipped" ? (
                    <div className="order-shipping-fields">
                      <label>
                        Transporteur
                        <input name="tracking_carrier" defaultValue={order.tracking_carrier ?? ""} required />
                      </label>
                      <label>
                        Numéro de suivi
                        <input name="tracking_number" defaultValue={order.tracking_number ?? ""} required />
                      </label>
                      <label>
                        Lien de suivi
                        <input name="tracking_url" type="url" defaultValue={order.tracking_url ?? ""} placeholder="https://…" />
                      </label>
                    </div>
                  ) : (
                    <>
                      <input type="hidden" name="tracking_carrier" value={order.tracking_carrier ?? ""} />
                      <input type="hidden" name="tracking_number" value={order.tracking_number ?? ""} />
                      <input type="hidden" name="tracking_url" value={order.tracking_url ?? ""} />
                    </>
                  )}
                  <p>Prochaine étape : <strong>{FULFILLMENT_STATUS_LABEL[nextStatus]}</strong></p>
                  <button type="submit" className="admin-btn-primary">Valider cette étape →</button>
                </form>
              )}
              {fulfillment === "delivered" && <p className="order-complete-message">Le traitement de cette commande est terminé.</p>}
            </>
          ) : (
            <p>Le traitement commencera automatiquement lorsque Stripe aura confirmé le paiement.</p>
          )}
        </section>

        <section className="order-detail-card">
          <h3>Suivi du colis</h3>
          {nextStatus === "shipped" ? (
            <p className="order-detail-help">Renseignez le suivi dans le bloc « Traitement » au moment de marquer la commande comme expédiée.</p>
          ) : (
            <form action={updateOrderTracking} className="order-tracking-form">
              <input type="hidden" name="id" value={order.id} />
              <label>
                Transporteur
                <input name="tracking_carrier" defaultValue={order.tracking_carrier ?? ""} placeholder="Ex. Colissimo" />
              </label>
              <label>
                Numéro de suivi
                <input name="tracking_number" defaultValue={order.tracking_number ?? ""} />
              </label>
              <label>
                Lien de suivi
                <input name="tracking_url" type="url" defaultValue={order.tracking_url ?? ""} placeholder="https://…" />
              </label>
              <button type="submit" className="admin-btn-sm">Enregistrer le suivi</button>
            </form>
          )}
          <div className="order-email-actions">
            {!order.confirmation_email_sent_at && ["paid", "refunded"].includes(order.status) && (
              <form action={resendOrderNotification}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="kind" value="confirmation" />
                <button type="submit" className="admin-btn-sm">Renvoyer la confirmation</button>
              </form>
            )}
            {!order.shipping_email_sent_at && ["shipped", "delivered"].includes(order.fulfillment_status ?? "") && (
              <form action={resendOrderNotification}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="kind" value="shipped" />
                <button type="submit" className="admin-btn-sm">Renvoyer l’avis d’expédition</button>
              </form>
            )}
            {!order.delivery_email_sent_at && order.fulfillment_status === "delivered" && (
              <form action={resendOrderNotification}>
                <input type="hidden" name="id" value={order.id} />
                <input type="hidden" name="kind" value="delivered" />
                <button type="submit" className="admin-btn-sm">Renvoyer l’avis de livraison</button>
              </form>
            )}
          </div>
        </section>

        <section className="order-detail-card">
          <h3>Client et livraison</h3>
          <dl className="order-detail-list">
            <div><dt>E-mail</dt><dd>{order.customer_email || "Non renseigné"}</dd></div>
            <div><dt>Destinataire</dt><dd>{order.shipping_recipient_name || "Non renseigné"}</dd></div>
            <div><dt>Téléphone</dt><dd>{order.shipping_phone || "Non renseigné"}</dd></div>
            <div>
              <dt>Adresse</dt>
              <dd>
                {address ? (
                  <>
                    {address.line1}<br />
                    {address.line2 && <>{address.line2}<br /></>}
                    {[address.postal_code, address.city].filter(Boolean).join(" ")}<br />
                    {[address.state, address.country].filter(Boolean).join(" · ")}
                  </>
                ) : "Non renseignée"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="order-detail-card">
          <h3>Récapitulatif</h3>
          <div className="order-detail-items">
            {(Array.isArray(order.order_items) ? order.order_items : []).map((item, index) => (
              <div key={index}>
                <span>
                  {item.title_snapshot} ×{item.quantity}
                  {[item.variant_size, item.variant_color].filter(Boolean).length > 0 && (
                    <small>{[item.variant_size, item.variant_color].filter(Boolean).join(" · ")}</small>
                  )}
                </span>
                <strong>{formatPrice(item.unit_price_cents * item.quantity)}</strong>
              </div>
            ))}
            <div className="muted"><span>Sous-total</span><span>{formatPrice(order.subtotal_cents)}</span></div>
            <div className="muted"><span>Livraison</span><span>{order.shipping_cents === 0 ? "Offerte" : formatPrice(order.shipping_cents)}</span></div>
            <div className="total"><span>Total</span><strong>{formatPrice(order.total_cents)}</strong></div>
          </div>
          <p className="order-detail-meta">
            Créée le {displayDate(order.created_at)}
            {order.paid_at ? <> · payée le {displayDate(order.paid_at)}</> : null}
            {order.refunded_at ? <> · remboursée le {displayDate(order.refunded_at)} ({formatPrice(order.refunded_cents ?? 0)})</> : null}
          </p>
        </section>
      </div>
    </>
  );
}
