"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getCartItems, cartSubtotalCents } from "@/lib/cart/cart";

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

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ user_id: user.id, status: "pending", subtotal_cents: subtotalCents, total_cents: subtotalCents, customer_email: user.email })
    .select("id")
    .single();

  if (orderError || !order) return { error: "order-failed" };

  await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      book_id: item.book?.id ?? null,
      goodie_id: item.goodie?.id ?? null,
      title_snapshot: item.book?.title ?? item.goodie?.title ?? "Produit",
      unit_price_cents: item.book?.price_cents ?? item.goodie?.price_cents ?? 0,
      quantity: item.quantity,
      variant_size: item.variant_size,
      variant_color: item.variant_color,
    }))
  );

  const siteUrl = await getSiteUrl();
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email ?? undefined,
    line_items: items.map((item) => {
      const title = item.book?.title ?? item.goodie?.title ?? "Produit";
      const variantBits = [item.variant_size, item.variant_color].filter(Boolean);
      return {
        price_data: {
          currency: "eur",
          product_data: { name: variantBits.length ? `${title} (${variantBits.join(", ")})` : title },
          unit_amount: item.book?.price_cents ?? item.goodie?.price_cents ?? 0,
        },
        quantity: item.quantity,
      };
    }),
    success_url: `${siteUrl}/confirmation?type=paiement&order=${order.id}`,
    cancel_url: `${siteUrl}/panier`,
    metadata: { order_id: order.id },
  });

  if (!session.url) return { error: "stripe-failed" };

  await supabase.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);

  redirect(session.url);
}
