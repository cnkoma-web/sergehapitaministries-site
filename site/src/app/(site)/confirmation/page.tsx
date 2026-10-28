import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
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
  profil: ["Profil mis à jour", "Vos informations ont bien été enregistrées."],
  priere: ["Merci pour votre démarche", "Nous avons bien reçu votre message. Que Dieu vous bénisse dans cette nouvelle marche avec Lui."],
};

const PAYMENT_MESSAGES: Record<string, [string, string]> = {
  paid: [
    "Merci pour votre commande !",
    "Votre paiement a bien été reçu. Vous recevrez un e-mail de confirmation, et votre commande apparaît dans votre espace « Mon compte ».",
  ],
  pending: [
    "Votre commande est enregistrée",
    "La confirmation du paiement est en cours. Le statut de votre commande sera mis à jour dès que Stripe aura confirmé l’opération.",
  ],
  failed: [
    "Le paiement n’a pas été confirmé",
    "Votre commande est enregistrée, mais le paiement n’a pas abouti. Son statut reste consultable depuis votre espace.",
  ],
  refunded: [
    "Votre commande a été remboursée",
    "Le remboursement de cette commande est enregistré dans votre espace « Mon compte ».",
  ],
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; order?: string }>;
}) {
  const { type, order: orderId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const hasRealAccount = isRealUser(user);

  // unit_price_cents AJOUTÉ (chantier /confirmation, source : maquettes-
  // complementaires-shm/confirmation-paiement.html § .item strong) : la
  // donnée existe réellement en base (déjà utilisée par le webhook Stripe
  // et par /mon-compte) mais n'était pas sélectionnée ici — le prix par
  // article était donc absent à tort, jamais une donnée manquante.
  let orderSummary: {
    status: string;
    total_cents: number;
    shipping_cents: number;
    items: { title_snapshot: string; quantity: number; unit_price_cents: number }[];
  } | null = null;
  if (type === "paiement" && orderId) {
    const { data: order } = await supabase.from("orders").select("total_cents, shipping_cents, status").eq("id", orderId).maybeSingle();
    if (order) {
      const { data: items } = await supabase.from("order_items").select("title_snapshot, quantity, unit_price_cents").eq("order_id", orderId);
      orderSummary = { status: order.status, total_cents: order.total_cents, shipping_cents: order.shipping_cents, items: items ?? [] };
    }
  }

  const [title, text] = type === "paiement"
    ? PAYMENT_MESSAGES[orderSummary?.status ?? "pending"] ?? PAYMENT_MESSAGES.pending
    : (type && MESSAGES[type]) || MESSAGES.contact;

  return (
    // RECONSTRUCTION (chantier /confirmation, 15/09) : nouvelles sources de
    // vérité pour l'INTERFACE — maquettes-complementaires-shm/confirmation-
    // standard.html (7 états texte) et confirmation-paiement.html (+
    // récapitulatif réel), remplaçant l'ancienne coquille vide du prototype
    // d'origine. Fonctions/données inchangées (MESSAGES, lecture orders/
    // order_items). Header/Footer réels du site conservés tels quels (déjà
    // injectés par (site)/layout.tsx) — jamais reconstruits depuis les
    // Header/Footer illustratifs des maquettes (consigne explicite).
    <div className="v2-confirmation-page">
      <main className="v2-confirm">
        <div className="v2-commerce-wrap">
          <div className="v2-confirm-card">
            <p className="v2-confirm-eyebrow">Confirmation</p>
            <div className="v2-confirm-check">✓</div>
            <h1>{title}</h1>
            <p className="v2-confirm-lead">{text}</p>

            {orderSummary && (
              <section className="v2-confirm-order">
                <h2>Votre commande</h2>
                {orderSummary.items.map((item, i) => (
                  <div className="v2-confirm-order-item" key={i}>
                    <div>
                      <b>{item.title_snapshot}</b>
                      <small>Quantité {item.quantity}</small>
                    </div>
                    <strong>{formatPrice(item.unit_price_cents * item.quantity)}</strong>
                  </div>
                ))}
                <div className="v2-confirm-order-totals">
                  <div className="v2-confirm-sum">
                    <span>Livraison</span>
                    <strong>
                      {orderSummary.shipping_cents === 0
                        ? ["paid", "refunded"].includes(orderSummary.status) ? "Offerte" : "À confirmer"
                        : formatPrice(orderSummary.shipping_cents)}
                    </strong>
                  </div>
                  <div className="v2-confirm-sum total">
                    <span>Total</span>
                    <strong>{formatPrice(orderSummary.total_cents)}</strong>
                  </div>
                </div>
              </section>
            )}

            <div className="v2-confirm-cta">
              {type === "paiement" ? (
                <>
                  <Link
                    href={hasRealAccount ? "/mon-compte?section=commandes" : "/compte?tab=signup"}
                    className="v2-btn v2-btn-primary"
                  >
                    {hasRealAccount ? "Voir ma commande →" : "Créer mon compte →"}
                  </Link>
                  {!hasRealAccount ? (
                    <Link href="/compte?tab=login" className="v2-btn v2-btn-secondary">
                      J&apos;ai déjà un compte →
                    </Link>
                  ) : null}
                  <Link href="/" className="v2-btn v2-btn-secondary">
                    Retour à l&apos;accueil
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/" className="v2-btn v2-btn-primary">
                    Retour à l&apos;accueil →
                  </Link>
                  <Link href="/publications" className="v2-btn v2-btn-secondary">
                    Découvrir les publications
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer variant="light" />
    </div>
  );
}
