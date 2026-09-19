"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/supabase/auth";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { sendCustomerEmail } from "@/lib/email/resend";
import { renderOrderConfirmationEmail, renderOrderProgressEmail } from "@/lib/orders/emails";
import { isFulfillmentStatus, NEXT_FULFILLMENT_STATUS } from "@/lib/orders/fulfillment";

function clean(value: FormDataEntryValue | null): string | null {
  const result = String(value ?? "").trim();
  return result || null;
}

function validTrackingUrl(value: string | null): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Accès administrateur requis.");
  return createServiceRoleClient();
}

export async function updateOrderTracking(formData: FormData) {
  const id = clean(formData.get("id"));
  const trackingCarrier = clean(formData.get("tracking_carrier"));
  const trackingNumber = clean(formData.get("tracking_number"));
  const trackingUrl = clean(formData.get("tracking_url"));
  if (!id || !validTrackingUrl(trackingUrl)) return;

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("orders")
    .update({
      tracking_carrier: trackingCarrier,
      tracking_number: trackingNumber,
      tracking_url: trackingUrl,
    })
    .eq("id", id);
  if (error) throw new Error(`Mise à jour du suivi impossible : ${error.message}`);

  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/mon-compte");
}

export async function advanceOrderFulfillment(formData: FormData) {
  const id = clean(formData.get("id"));
  const expectedStatus = clean(formData.get("expected_status"));
  const trackingCarrier = clean(formData.get("tracking_carrier"));
  const trackingNumber = clean(formData.get("tracking_number"));
  const trackingUrl = clean(formData.get("tracking_url"));
  if (!id || !isFulfillmentStatus(expectedStatus) || !validTrackingUrl(trackingUrl)) return;

  const nextStatus = NEXT_FULFILLMENT_STATUS[expectedStatus];
  if (!nextStatus) return;

  const supabase = await requireAdmin();
  const { data: current, error: readError } = await supabase
    .from("orders")
    .select("id, status, fulfillment_status, customer_email, tracking_carrier, tracking_number, tracking_url, shipping_email_sent_at, delivery_email_sent_at")
    .eq("id", id)
    .single();
  if (readError || !current) throw new Error(`Commande introuvable : ${readError?.message ?? id}`);
  if (current.status !== "paid" || current.fulfillment_status !== expectedStatus) return;

  const carrier = trackingCarrier ?? current.tracking_carrier;
  const number = trackingNumber ?? current.tracking_number;
  const url = trackingUrl ?? current.tracking_url;
  if (nextStatus === "shipped" && (!carrier || !number)) return;
  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      fulfillment_status: nextStatus,
      tracking_carrier: carrier,
      tracking_number: number,
      tracking_url: url,
    })
    .eq("id", id)
    .eq("status", "paid")
    .eq("fulfillment_status", expectedStatus)
    .select("id")
    .maybeSingle();
  if (updateError) throw new Error(`Transition logistique impossible : ${updateError.message}`);
  if (!updated) return;

  const shouldEmail =
    (nextStatus === "shipped" && !current.shipping_email_sent_at) ||
    (nextStatus === "delivered" && !current.delivery_email_sent_at);
  if (shouldEmail) {
    const sent = await sendCustomerEmail(
      current.customer_email,
      nextStatus === "shipped"
        ? "Votre commande a été expédiée — Serge Hapita Ministries"
        : "Votre commande a été livrée — Serge Hapita Ministries",
      renderOrderProgressEmail({
        orderId: id,
        delivered: nextStatus === "delivered",
        carrier,
        trackingNumber: number,
        trackingUrl: url,
      }),
      { idempotencyKey: `order-${nextStatus}-${id}` }
    );
    if (sent) {
      const marker = nextStatus === "shipped" ? { shipping_email_sent_at: new Date().toISOString() } : { delivery_email_sent_at: new Date().toISOString() };
      const { error: markerError } = await supabase.from("orders").update(marker).eq("id", id);
      if (markerError) console.error("Marqueur e-mail logistique :", markerError);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/commandes");
  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/mon-compte");
}

export async function resendOrderNotification(formData: FormData) {
  const id = clean(formData.get("id"));
  const kind = clean(formData.get("kind"));
  if (!id || !["confirmation", "shipped", "delivered"].includes(kind ?? "")) return;

  const supabase = await requireAdmin();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, status, fulfillment_status, customer_email, shipping_cents, total_cents, tracking_carrier, tracking_number, tracking_url, confirmation_email_sent_at, shipping_email_sent_at, delivery_email_sent_at, order_items(title_snapshot, quantity, unit_price_cents)")
    .eq("id", id)
    .single();
  if (error || !order?.customer_email) return;

  let subject: string;
  let html: string;
  let marker: Record<string, string>;
  if (kind === "confirmation") {
    if (!["paid", "refunded"].includes(order.status) || order.confirmation_email_sent_at) return;
    subject = "Confirmation de votre commande — Serge Hapita Ministries";
    html = renderOrderConfirmationEmail({
      orderId: id,
      items: Array.isArray(order.order_items) ? order.order_items : [],
      shippingCents: order.shipping_cents,
      totalCents: order.total_cents,
    });
    marker = { confirmation_email_sent_at: new Date().toISOString() };
  } else {
    const delivered = kind === "delivered";
    if (delivered) {
      if (order.fulfillment_status !== "delivered" || order.delivery_email_sent_at) return;
    } else if (
      !["shipped", "delivered"].includes(order.fulfillment_status ?? "") ||
      order.shipping_email_sent_at
    ) return;
    subject = delivered
      ? "Votre commande a été livrée — Serge Hapita Ministries"
      : "Votre commande a été expédiée — Serge Hapita Ministries";
    html = renderOrderProgressEmail({
      orderId: id,
      delivered,
      carrier: order.tracking_carrier,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
    });
    marker = delivered
      ? { delivery_email_sent_at: new Date().toISOString() }
      : { shipping_email_sent_at: new Date().toISOString() };
  }

  const sent = await sendCustomerEmail(order.customer_email, subject, html, {
    idempotencyKey: `order-${kind}-${id}`,
  });
  if (sent) {
    const { error: markerError } = await supabase.from("orders").update(marker).eq("id", id);
    if (markerError) throw new Error(`Marqueur e-mail impossible : ${markerError.message}`);
  }

  revalidatePath(`/admin/commandes/${id}`);
}
