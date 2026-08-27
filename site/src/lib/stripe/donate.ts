"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export type DonationFrequency = "unique" | "mensuel" | "annuel";

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

const FREQUENCY_LABEL: Record<DonationFrequency, string> = {
  unique: "Don unique",
  mensuel: "Don mensuel",
  annuel: "Don annuel",
};

/** Crée un don "pending" + une session Stripe Checkout (paiement simple pour
 * un don unique, abonnement pour mensuel/annuel), puis redirige vers Stripe.
 * Le don passe à "paid"/"active" uniquement via le webhook Stripe. */
export async function createDonationCheckoutSession(
  frequency: DonationFrequency,
  amountCents: number,
  comment: string
): Promise<{ error: string } | never> {
  if (!Number.isInteger(amountCents) || amountCents < 100) {
    return { error: "invalid-amount" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Une session (anonyme ou réelle) est requise pour la RLS de `donations` —
  // en pratique toujours présente grâce à CartSessionBootstrap, ce cas ne
  // couvre que l'échec de ce bootstrap (JS bloqué, etc.).
  if (!user) redirect("/compte?tab=login");

  const { data: donation, error: insertError } = await supabase
    .from("donations")
    .insert({
      user_id: user.id,
      frequency,
      amount_cents: amountCents,
      comment: comment || null,
      email: user.email || null,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertError || !donation) return { error: "donation-failed" };

  const siteUrl = await getSiteUrl();
  const stripe = getStripe();

  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "eur",
    product_data: { name: FREQUENCY_LABEL[frequency] },
    unit_amount: amountCents,
    ...(frequency !== "unique" && {
      recurring: { interval: frequency === "mensuel" ? "month" : "year" },
    }),
  };

  const session = await stripe.checkout.sessions.create({
    mode: frequency === "unique" ? "payment" : "subscription",
    payment_method_types: ["card"],
    customer_email: user?.email || undefined,
    line_items: [{ price_data: priceData, quantity: 1 }],
    success_url: `${siteUrl}/confirmation?type=don`,
    cancel_url: `${siteUrl}/partenariat`,
    metadata: { donation_id: donation.id },
    ...(frequency !== "unique" && { subscription_data: { metadata: { donation_id: donation.id } } }),
  });

  if (!session.url) return { error: "stripe-failed" };

  await supabase.from("donations").update({ stripe_checkout_session_id: session.id }).eq("id", donation.id);

  redirect(session.url);
}
