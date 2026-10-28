"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/serviceRole";
import { getCartItems, cartSubtotalCents } from "@/lib/cart/cart";
import {
  computeDomesticShippingCents,
  internationalShippingCents,
  DOMESTIC_COUNTRY,
  INTERNATIONAL_COUNTRIES,
} from "@/lib/stripe/shipping";

async function getSiteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "sergehapitaministries.org";
  const proto = host.startsWith("localhost") ? "http" : h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquante.");
  return new Stripe(key);
}

/** Crée une commande "pending" + une session Stripe Checkout pour le panier
 * courant, puis redirige vers Stripe. La commande passera à "paid" uniquement
 * via le webhook Stripe (source de vérité — voir migration cart_and_orders). */
export async function createCartCheckoutSession(): Promise<{ error: string } | never> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/compte?tab=login");

  // Le paiement n'exige pas de "vrai" compte — une session anonyme suffit
  // (cahier : rien n'impose la création d'un compte pour acheter). Si le
  // visiteur crée un compte plus tard, cette commande apparaîtra dans son
  // historique puisque l'upgrade anonyme conserve le même identifiant.
  const items = await getCartItems();
  if (items.length === 0) return { error: "empty-cart" };

  const missingPrice = items.find((i) => (i.book?.price_cents ?? i.goodie?.price_cents ?? null) == null);
  if (missingPrice) return { error: "missing-price" };

  const subtotalCents = cartSubtotalCents(items);

  // Les données de commande sont écrites avec le client serveur privilégié.
  // Le panier et l'identité restent, eux, lus depuis la session vérifiée ci-
  // dessus. Cette séparation permet de fermer définitivement les INSERT RLS
  // directs sans faire confiance à des montants transmis par le navigateur.
  const orderWriter = createServiceRoleClient();
  const orderItems = items.map((item) => ({
      source_cart_item_id: item.id,
      book_id: item.book?.id ?? null,
      goodie_id: item.goodie?.id ?? null,
      title_snapshot: item.book?.title ?? item.goodie?.title ?? "Produit",
      unit_price_cents: item.book?.price_cents ?? item.goodie?.price_cents ?? 0,
      quantity: item.quantity,
      variant_size: item.variant_size,
      variant_color: item.variant_color,
    }));
  const { data: orderId, error: orderError } = await orderWriter.rpc("create_checkout_order", {
    p_user_id: user.id,
    p_customer_email: user.email ?? "",
    p_items: orderItems,
  });

  if (orderError || typeof orderId !== "string") {
    console.error("createCartCheckoutSession order:", orderError);
    return { error: "order-failed" };
  }

  const siteUrl = await getSiteUrl();
  const stripe = getStripe();

  // Stripe exige des URLs absolues et publiquement accessibles pour l'image
  // affichée sur sa page de paiement — les couvertures/photos locales
  // (/covers/...) doivent être préfixées par le domaine du site.
  const toAbsoluteUrl = (url: string) => (url.startsWith("http") ? url : `${siteUrl}${url}`);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const domesticShipping = computeDomesticShippingCents(subtotalCents, totalQuantity);
  const internationalShipping = internationalShippingCents();

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        payment_method_types: ["card"],
        client_reference_id: orderId,
        // "?? undefined" ne suffit pas : un utilisateur en session anonyme a
        // un email vide ("", pas null), que Stripe rejette explicitement.
        customer_email: user.email || undefined,
        line_items: items.map((item) => {
          const title = item.book?.title ?? item.goodie?.title ?? "Produit";
          const variantBits = [item.variant_size, item.variant_color].filter(Boolean);
          const imageUrl = item.book?.cover_url ?? item.goodie?.image_url ?? null;
          return {
            price_data: {
              currency: "eur",
              product_data: {
                name: variantBits.length ? `${title} (${variantBits.join(", ")})` : title,
                images: imageUrl ? [toAbsoluteUrl(imageUrl)] : undefined,
              },
              unit_amount: item.book?.price_cents ?? item.goodie?.price_cents ?? 0,
            },
            quantity: item.quantity,
          };
        }),
        // Deux options nommées plutôt qu'un calcul auto par pays (non supporté
        // nativement par Checkout dans une même session).
        shipping_address_collection: { allowed_countries: [DOMESTIC_COUNTRY, ...INTERNATIONAL_COUNTRIES] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: domesticShipping, currency: "eur" },
              display_name: domesticShipping === 0 ? "France métropolitaine — offerte" : "France métropolitaine",
              delivery_estimate: { minimum: { unit: "business_day", value: 2 }, maximum: { unit: "business_day", value: 5 } },
            },
          },
          {
            shipping_rate_data: {
              type: "fixed_amount",
              fixed_amount: { amount: internationalShipping, currency: "eur" },
              display_name: "International (hors France métropolitaine)",
              delivery_estimate: { minimum: { unit: "business_day", value: 5 }, maximum: { unit: "business_day", value: 12 } },
            },
          },
        ],
        success_url: `${siteUrl}/confirmation?type=paiement&order=${orderId}`,
        cancel_url: `${siteUrl}/panier`,
        metadata: { order_id: orderId },
        payment_intent_data: { metadata: { order_id: orderId } },
      },
      { idempotencyKey: `order-checkout-${orderId}` }
    );
  } catch (error) {
    console.error("createCartCheckoutSession Stripe:", error);
    await orderWriter.from("orders").update({ status: "failed", payment_failed_at: new Date().toISOString() }).eq("id", orderId);
    return { error: "stripe-failed" };
  }

  if (!session.url) {
    await orderWriter.from("orders").update({ status: "failed", payment_failed_at: new Date().toISOString() }).eq("id", orderId);
    return { error: "stripe-failed" };
  }

  const { data: persistedOrder, error: sessionIdError } = await orderWriter
    .from("orders")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("status", "pending")
    .is("stripe_checkout_session_id", null)
    .select("id")
    .maybeSingle();

  if (sessionIdError || !persistedOrder) {
    console.error("createCartCheckoutSession session id:", sessionIdError);
    try {
      await stripe.checkout.sessions.expire(session.id);
    } catch (expireError) {
      console.error("createCartCheckoutSession expire:", expireError);
    }
    await orderWriter.from("orders").update({ status: "failed", payment_failed_at: new Date().toISOString() }).eq("id", orderId);
    return { error: "order-failed" };
  }

  redirect(session.url);
}
