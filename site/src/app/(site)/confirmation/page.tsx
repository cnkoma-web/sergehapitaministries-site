import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Confirmation | Serge Hapita Ministries",
  robots: { index: false, follow: false },
};

const MESSAGES: Record<string, [string, string]> = {
  contact: ["Votre message a bien été envoyé", "Merci de nous avoir contactés. Nous reviendrons vers vous dans les meilleurs délais."],
  invitation: ["Votre demande d'invitation a bien été envoyée", "Merci pour votre demande. Nous l'étudierons et reviendrons vers vous rapidement."],
  don: [
    "Merci pour votre don",
    "Votre générosité est un immense soutien à la propagation de la Parole de Dieu et au salut des hommes. Le Seigneur multiplie l'œuvre de vos mains.",
  ],
  avis: ["Merci pour votre avis", "Votre avis a bien été envoyé et sera visible après validation par l'équipe."],
  newsletter: ["Inscription confirmée", "Vous recevrez désormais « ParoleDeViePourVous » directement dans votre boîte mail."],
  paiement: ["Merci pour votre commande !", "Votre paiement a bien été reçu. Vous recevrez un e-mail de confirmation, et votre commande apparaît dans votre espace « Mon compte »."],
  profil: ["Profil mis à jour", "Vos informations ont bien été enregistrées."],
  priere: ["Merci pour votre démarche", "Nous avons bien reçu votre message. Que Dieu vous bénisse dans cette nouvelle marche avec Lui."],
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; order?: string }>;
}) {
  const { type, order: orderId } = await searchParams;
  const [title, text] = (type && MESSAGES[type]) || MESSAGES.contact;

  let orderSummary: { total_cents: number; shipping_cents: number; items: { title_snapshot: string; quantity: number }[] } | null = null;
  if (type === "paiement" && orderId) {
    const supabase = await createClient();
    const { data: order } = await supabase.from("orders").select("total_cents, shipping_cents, status").eq("id", orderId).maybeSingle();
    if (order) {
      const { data: items } = await supabase.from("order_items").select("title_snapshot, quantity").eq("order_id", orderId);
      orderSummary = { total_cents: order.total_cents, shipping_cents: order.shipping_cents, items: items ?? [] };
    }
  }

  return (
    <>
      <section className="confirm-section">
        <div className="wrap">
          <div className="confirm-icon">✓</div>
          <h1>{title}</h1>
          <p>{text}</p>

          {orderSummary && (
            <div className="admin-card" style={{ maxWidth: 420, margin: "0 auto 32px", textAlign: "left" }}>
              {orderSummary.items.map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                  <span>
                    {item.title_snapshot} × {item.quantity}
                  </span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6, color: "var(--ink-soft)" }}>
                <span>Livraison</span>
                <span>{orderSummary.shipping_cents === 0 ? "Offerte" : formatPrice(orderSummary.shipping_cents)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                <span>Total</span>
                <span>{formatPrice(orderSummary.total_cents)}</span>
              </div>
            </div>
          )}

          <div className="confirm-actions">
            <Link href="/" className="btn btn-primary">
              Retour à l&apos;accueil →
            </Link>
            <Link href="/publications" className="btn btn-outline">
              Découvrir les publications
            </Link>
          </div>
        </div>
      </section>

      <Footer variant="dark" />
    </>
  );
}
