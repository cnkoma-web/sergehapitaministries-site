import Stripe from "stripe";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { sendCustomerEmail } from "@/lib/email/resend";
import { formatPrice } from "@/lib/format";

// Webhook Stripe — seule source de vérité pour confirmer un paiement (jamais le
// navigateur, cf. commentaire de la policy RLS sur `orders`). La signature est
// vérifiée cryptographiquement avant toute écriture ; c'est uniquement après
// cette vérification que le service_role Supabase est utilisé pour passer la
// commande à "paid", sans dépendre d'une session utilisateur (impossible ici,
// c'est un appel serveur-à-serveur de Stripe).
export async function POST(request: Request) {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secretKey || !webhookSecret) {
    return new Response("Stripe non configuré.", { status: 500 });
  }

  const stripe = new Stripe(secretKey);
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature ?? "", webhookSecret);
  } catch (err) {
    return new Response(`Signature invalide : ${(err as Error).message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const donationId = session.metadata?.donation_id;

    if (orderId) {
      const supabase = createServiceRoleClient();
      const customerEmail = session.customer_details?.email ?? undefined;
      await supabase
        .from("orders")
        .update({
          status: "paid",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
          customer_email: customerEmail,
          // Montant réellement facturé par Stripe (frais de port selon l'option
          // choisie par le client inclus) — source de vérité, pas un recalcul local.
          shipping_cents: session.shipping_cost?.amount_total ?? 0,
          total_cents: session.amount_total ?? undefined,
        })
        .eq("id", orderId);

      // Panier vidé une fois la commande confirmée payée.
      const { data: order } = await supabase.from("orders").select("user_id").eq("id", orderId).single();
      if (order?.user_id) {
        const { data: cart } = await supabase.from("carts").select("id").eq("user_id", order.user_id).maybeSingle();
        if (cart) await supabase.from("cart_items").delete().eq("cart_id", cart.id);
      }

      const { data: items } = await supabase
        .from("order_items")
        .select("title_snapshot, quantity, unit_price_cents")
        .eq("order_id", orderId);
      const shippingCents = session.shipping_cost?.amount_total ?? 0;
      const totalCents = session.amount_total ?? 0;
      const itemsHtml = (items ?? [])
        .map((i) => `<tr><td>${i.title_snapshot} × ${i.quantity}</td><td style="text-align:right">${formatPrice(i.unit_price_cents * i.quantity)}</td></tr>`)
        .join("");
      await sendCustomerEmail(
        customerEmail,
        "Confirmation de votre commande — Serge Hapita Ministries",
        `<p>Merci pour votre commande !</p>
         <table style="width:100%;border-collapse:collapse;margin:16px 0;">${itemsHtml}
           <tr><td>Livraison</td><td style="text-align:right">${shippingCents === 0 ? "Offerte" : formatPrice(shippingCents)}</td></tr>
           <tr style="font-weight:bold"><td>Total</td><td style="text-align:right">${formatPrice(totalCents)}</td></tr>
         </table>
         <p>Vous pouvez suivre votre commande dans votre espace « Mon compte ».</p>`
      );
    }

    if (donationId) {
      const supabase = createServiceRoleClient();
      // "paid" pour un don unique (mode payment), "active" pour un abonnement
      // (mode subscription) — la souscription elle-même est gérée par Stripe,
      // seul son identifiant est conservé pour référence côté admin.
      const donationEmail = session.customer_details?.email ?? undefined;
      await supabase
        .from("donations")
        .update({
          status: session.mode === "subscription" ? "active" : "paid",
          stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
          email: donationEmail,
        })
        .eq("id", donationId);

      const isRecurring = session.mode === "subscription";
      await sendCustomerEmail(
        donationEmail,
        "Merci pour votre don — Serge Hapita Ministries",
        `<p>Merci pour votre don${isRecurring ? " récurrent" : ""} de ${formatPrice(session.amount_total ?? 0)}.</p>
         <p>Votre générosité soutient concrètement ce ministère.</p>`
      );
    }
  }

  if (event.type === "checkout.session.expired" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;
    const donationId = session.metadata?.donation_id;
    const supabase = createServiceRoleClient();
    if (orderId) await supabase.from("orders").update({ status: "failed" }).eq("id", orderId);
    if (donationId) await supabase.from("donations").update({ status: "failed" }).eq("id", donationId);
  }

  // Un abonnement de don annulé (résiliation, échec de paiement récurrent
  // definitif) — Stripe envoie cet événement indépendamment du checkout initial.
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const donationId = subscription.metadata?.donation_id;
    if (donationId) {
      const supabase = createServiceRoleClient();
      await supabase.from("donations").update({ status: "canceled" }).eq("id", donationId);
    }
  }

  return new Response("ok", { status: 200 });
}
