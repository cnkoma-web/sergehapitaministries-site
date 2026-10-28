import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { sendCustomerEmail } from "@/lib/email/resend";
import { renderEmail, EMAIL_INK } from "@/lib/email/template";
import { renderOrderConfirmationEmail } from "@/lib/orders/emails";
import { formatPrice } from "@/lib/format";

export const runtime = "nodejs";

type CheckoutSessionWithShipping = Stripe.Checkout.Session & {
  shipping_details?: {
    name?: string | null;
    phone?: string | null;
    address?: Stripe.Address | null;
  } | null;
};

function paymentIntentId(value: string | Stripe.PaymentIntent | null): string | null {
  if (typeof value === "string") return value;
  return value?.id ?? null;
}

async function markOrderPaid(session: CheckoutSessionWithShipping) {
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  if (!orderId || session.payment_status !== "paid") return;

  const supabase = createServiceRoleClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, status, subtotal_cents, total_cents, customer_email, paid_at, stripe_checkout_session_id, fulfillment_status, confirmation_email_sent_at")
    .eq("id", orderId)
    .single();

  if (orderError || !order) throw new Error(`Commande ${orderId} introuvable: ${orderError?.message ?? "sans résultat"}`);
  if (order.status === "refunded") return;
  if (order.stripe_checkout_session_id && order.stripe_checkout_session_id !== session.id) {
    throw new Error(`Session Stripe incohérente pour ${orderId}`);
  }
  if (session.currency !== "eur") throw new Error(`Devise Stripe inattendue pour ${orderId}: ${session.currency}`);
  if (session.amount_subtotal !== order.subtotal_cents) {
    throw new Error(`Sous-total Stripe incohérent pour ${orderId}: ${session.amount_subtotal} au lieu de ${order.subtotal_cents}`);
  }

  const shipping = session.shipping_details;
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status: "paid",
      paid_at: order.paid_at ?? now,
      payment_failed_at: null,
      stripe_checkout_session_id: session.id,
      stripe_payment_intent_id: paymentIntentId(session.payment_intent),
      customer_email: session.customer_details?.email ?? order.customer_email,
      shipping_cents: session.shipping_cost?.amount_total ?? 0,
      total_cents: session.amount_total ?? order.total_cents,
      fulfillment_status: order.fulfillment_status ?? "confirmed",
      shipping_recipient_name: shipping?.name ?? session.customer_details?.name ?? null,
      shipping_phone: shipping?.phone ?? session.customer_details?.phone ?? null,
      shipping_address: shipping?.address ?? session.customer_details?.address ?? null,
    })
    .eq("id", orderId)
    .in("status", ["pending", "failed", "paid"]);

  if (updateError) throw new Error(`Mise à jour commande ${orderId}: ${updateError.message}`);

  const { data: purchasedItems, error: purchasedItemsError } = await supabase
    .from("order_items")
    .select("source_cart_item_id")
    .eq("order_id", orderId)
    .not("source_cart_item_id", "is", null);
  if (purchasedItemsError) throw new Error(`Lecture panier de ${orderId}: ${purchasedItemsError.message}`);
  const purchasedCartItemIds = (purchasedItems ?? [])
    .map((item) => item.source_cart_item_id)
    .filter((id): id is string => typeof id === "string");
  if (purchasedCartItemIds.length > 0) {
    const { error: clearError } = await supabase.from("cart_items").delete().in("id", purchasedCartItemIds);
    if (clearError) throw new Error(`Vidage panier de ${orderId}: ${clearError.message}`);
  }

  if (!order.confirmation_email_sent_at) {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("title_snapshot, quantity, unit_price_cents")
      .eq("order_id", orderId);
    if (itemsError) throw new Error(`Lecture articles de ${orderId}: ${itemsError.message}`);

    const email = session.customer_details?.email ?? order.customer_email;
    const sent = await sendCustomerEmail(
      email,
      "Confirmation de votre commande — Serge Hapita Ministries",
      renderOrderConfirmationEmail({
        orderId,
        items: items ?? [],
        shippingCents: session.shipping_cost?.amount_total ?? 0,
        totalCents: session.amount_total ?? order.total_cents,
      }),
      { idempotencyKey: `order-confirmation-${orderId}` }
    );

    if (email && !sent) {
      throw new Error(`Envoi de la confirmation impossible pour ${orderId}`);
    }
    if (sent) {
      const { error: emailMarkerError } = await supabase
        .from("orders")
        .update({ confirmation_email_sent_at: now })
        .eq("id", orderId);
      if (emailMarkerError) throw new Error(`Marqueur e-mail de ${orderId}: ${emailMarkerError.message}`);
    }
  }
}

async function markDonationPaid(session: Stripe.Checkout.Session) {
  const donationId = session.metadata?.donation_id;
  if (!donationId || session.payment_status !== "paid") return;

  const supabase = createServiceRoleClient();
  const donationEmail = session.customer_details?.email ?? undefined;
  const { error } = await supabase
    .from("donations")
    .update({
      status: session.mode === "subscription" ? "active" : "paid",
      stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
      email: donationEmail,
    })
    .eq("id", donationId);
  if (error) throw new Error(`Mise à jour don ${donationId}: ${error.message}`);

  const isRecurring = session.mode === "subscription";
  await sendCustomerEmail(
    donationEmail,
    "Merci pour votre don — Serge Hapita Ministries",
    renderEmail(
      `<h1 style="margin:0 0 18px;font-size:20px;color:${EMAIL_INK};">Merci pour votre don${isRecurring ? " récurrent" : ""} de ${formatPrice(session.amount_total ?? 0)}</h1>
       <p style="margin:0 0 16px;">Votre générosité est un immense soutien à la propagation de la Parole de Dieu et au salut des hommes. Le Seigneur multiplie l'œuvre de vos mains.</p>`
    ),
    { idempotencyKey: `donation-confirmation-${donationId}` }
  );
}

async function markCheckoutFailed(session: Stripe.Checkout.Session) {
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();
  const orderId = session.metadata?.order_id ?? session.client_reference_id;
  const donationId = session.metadata?.donation_id;

  if (orderId) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "failed", payment_failed_at: now })
      .eq("id", orderId)
      .eq("status", "pending");
    if (error) throw new Error(`Échec commande ${orderId}: ${error.message}`);
  }
  if (donationId) {
    const { error } = await supabase.from("donations").update({ status: "failed" }).eq("id", donationId).eq("status", "pending");
    if (error) throw new Error(`Échec don ${donationId}: ${error.message}`);
  }
}

async function markPaymentIntentFailed(intent: Stripe.PaymentIntent) {
  const orderId = intent.metadata?.order_id;
  const donationId = intent.metadata?.donation_id;
  const supabase = createServiceRoleClient();
  const now = new Date().toISOString();

  if (orderId) {
    const { error } = await supabase
      .from("orders")
      .update({ status: "failed", payment_failed_at: now, stripe_payment_intent_id: intent.id })
      .eq("id", orderId)
      .eq("status", "pending");
    if (error) throw new Error(`Échec PaymentIntent commande ${orderId}: ${error.message}`);
  }
  if (donationId) {
    const { error } = await supabase.from("donations").update({ status: "failed" }).eq("id", donationId).eq("status", "pending");
    if (error) throw new Error(`Échec PaymentIntent don ${donationId}: ${error.message}`);
  }
}

async function markChargeRefunded(charge: Stripe.Charge, stripe: Stripe) {
  const intentId = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
  if (!intentId) return;

  const supabase = createServiceRoleClient();
  const { data: knownOrder, error: lookupError } = await supabase
    .from("orders")
    .select("id")
    .eq("stripe_payment_intent_id", intentId)
    .maybeSingle();
  if (lookupError) throw new Error(`Recherche remboursement ${intentId}: ${lookupError.message}`);

  let orderId = knownOrder?.id ?? null;
  if (!orderId) {
    const intent = await stripe.paymentIntents.retrieve(intentId);
    orderId = intent.metadata?.order_id ?? null;
  }
  if (!orderId) return;

  const fullyRefunded = charge.refunded || charge.amount_refunded >= charge.amount;
  const { data: updated, error } = await supabase
    .from("orders")
    .update({
      ...(fullyRefunded ? { status: "refunded", refunded_at: new Date().toISOString() } : {}),
      refunded_cents: charge.amount_refunded,
      stripe_payment_intent_id: intentId,
    })
    .eq("id", orderId)
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`Remboursement PaymentIntent ${intentId}: ${error.message}`);
  if (!updated) throw new Error(`Commande à rembourser introuvable pour ${intentId}`);
}

// Stripe est l'unique source de vérité financière. Toute erreur de traitement
// renvoie 500 pour que Stripe retente l'événement; les opérations et e-mails
// sont idempotents afin qu'une relivraison reste sans danger.
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) return new Response("Stripe non configuré.", { status: 500 });

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (error) {
    return new Response(`Signature invalide : ${(error as Error).message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as CheckoutSessionWithShipping;
        await markOrderPaid(session);
        await markDonationPaid(session);
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await markCheckoutFailed(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.payment_failed":
        await markPaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "charge.refunded":
        await markChargeRefunded(event.data.object as Stripe.Charge, stripe);
        break;
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const donationId = subscription.metadata?.donation_id;
        if (donationId) {
          const { error } = await createServiceRoleClient().from("donations").update({ status: "canceled" }).eq("id", donationId);
          if (error) throw new Error(`Annulation don ${donationId}: ${error.message}`);
        }
        break;
      }
    }
  } catch (error) {
    console.error(`[stripe webhook] ${event.id} (${event.type})`, error);
    return new Response("Traitement temporairement impossible.", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
