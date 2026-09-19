"use client";

import { useState } from "react";
import Link from "next/link";
import ProfileForm from "./ProfileForm";
import { formatPrice } from "@/lib/format";
import {
  FULFILLMENT_STATUS_LABEL,
  FULFILLMENT_STEPS,
  isFulfillmentStatus,
  shortOrderReference,
  type FulfillmentStatus,
} from "@/lib/orders/fulfillment";

type Section = "apercu" | "commandes" | "profil" | "acces" | "avis";

// RECONSTRUCTION (chantier /mon-compte, reprise) : ce composant utilisait un
// système de classes entièrement pré-V2 (.dash-layout/.dash-nav/.dash-
// section/.empty-state...), jamais aligné sur les vraies classes de la
// maquette (prototype-html/mon-compte/index.html § .dashboard-grid/
// .dashboard-tabs/.dashboard-panel/.dashboard-empty). Reconstruit sur ces
// classes réelles — chaque fonction/donnée existante (5 onglets,
// commandes/avis/accès réels, formulaire profil) est strictement préservée,
// seule l'interface change. Onglets = <button role="tab"> comme la
// maquette (jamais des <a href="#">), commutation cliente inchangée
// (aucune navigation, un seul montage de page).
const SECTIONS: { id: Section; label: string }[] = [
  { id: "apercu", label: "Aperçu" },
  { id: "commandes", label: "Mes commandes" },
  { id: "profil", label: "Mon profil" },
  { id: "acces", label: "Mon accès" },
  { id: "avis", label: "Mes avis" },
];

type VsArticle = { slug: string; title: string };
type MyReview = { id: string; rating: number | null; body: string | null; status: string; productTitle: string };
type OrderItem = { label: string; priceCents: number };
type MyOrder = {
  id: string;
  status: string;
  subtotalCents: number;
  shippingCents: number;
  totalCents: number;
  createdAt: string;
  fulfillmentStatus: string | null;
  confirmedAt: string | null;
  preparingAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  items: OrderItem[];
};

type Props = {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  vsArticles: VsArticle[];
  reviews: MyReview[];
  orders: MyOrder[];
  initialSection?: Section;
};

const REVIEW_STATUS_LABEL: Record<string, string> = {
  pending: "En attente de validation",
  approved: "Publié",
  rejected: "Non retenu",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Payée",
  failed: "Échouée",
  refunded: "Remboursée",
};

function orderDisplayStatus(order: MyOrder): string {
  return order.status === "paid" && isFulfillmentStatus(order.fulfillmentStatus)
    ? FULFILLMENT_STATUS_LABEL[order.fulfillmentStatus]
    : ORDER_STATUS_LABEL[order.status] ?? order.status;
}

function orderStepDate(order: MyOrder, status: FulfillmentStatus): string | null {
  if (status === "confirmed") return order.confirmedAt;
  if (status === "preparing") return order.preparingAt;
  if (status === "shipped") return order.shippedAt;
  return order.deliveredAt;
}

// Icônes SVG reprises à l'identique de chaque .dashboard-empty de la
// maquette (une icône différente par onglet).
const ICONS: Record<"person" | "box" | "lock" | "chat", React.ReactNode> = {
  person: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c.7-4.3 3.2-6.5 7.5-6.5s6.8 2.2 7.5 6.5" />
    </svg>
  ),
  box: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h16v13H4zM8 7V5a4 4 0 0 1 8 0v2" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4.5h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H10l-5.5 3v-3H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
    </svg>
  ),
};

export default function DashTabs({ userId, firstName, lastName, email, vsArticles, reviews, orders, initialSection = "apercu" }: Props) {
  const [section, setSection] = useState<Section>(initialSection);

  return (
    <div className="dashboard-grid">
      <nav className="dashboard-tabs" role="tablist" aria-label="Rubriques du compte">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-controls={`dashboard-${s.id}`}
            aria-selected={section === s.id}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {section === "apercu" && (
        <section className="dashboard-panel" id="dashboard-apercu" role="tabpanel">
          {/* H2 personnalisé (chantier /mon-compte, reprise) : la maquette
              n'a qu'UN SEUL message d'accueil (ce H2, "Bonjour.") — le
              bandeau .dash-welcome séparé ("Bonjour {prénom}, ravis de
              vous revoir") n'existait nulle part dans la maquette.
              Fusionné ici : personnalisation réelle conservée, structure
              alignée. */}
          <h2>Bonjour{firstName ? `, ${firstName}` : ""}.</h2>
          <p>Votre espace rassemble les éléments liés à votre compte.</p>
          {orders.length === 0 ? (
            <div className="dashboard-empty">
              <div>
                {ICONS.person}
                <strong>Votre espace est prêt.</strong>
                <p>Vos commandes, accès et avis apparaîtront ici au fur et à mesure.</p>
                <Link href="/livres">Découvrir les livres →</Link>
              </div>
            </div>
          ) : (
            <div className="order-row">
              <div>
                <div className="num">{orders[0].items.map((i) => i.label).join(", ")}</div>
                <div className="date">{new Date(orders[0].createdAt).toLocaleDateString("fr-FR")}</div>
              </div>
              <span className="order-status">{orderDisplayStatus(orders[0])}</span>
            </div>
          )}
        </section>
      )}

      {section === "commandes" && (
        <section className="dashboard-panel" id="dashboard-commandes" role="tabpanel">
          <h2>Mes commandes</h2>
          <p>Consultez le statut et l&apos;historique de vos commandes.</p>
          {orders.length === 0 ? (
            <div className="dashboard-empty">
              <div>
                {ICONS.box}
                <strong>Aucune commande pour le moment.</strong>
                <p>Lorsqu&apos;une commande sera associée à votre compte, elle apparaîtra dans cet espace.</p>
                <Link href="/livres">Parcourir le catalogue →</Link>
              </div>
            </div>
          ) : (
            <div className="order-list">
              {orders.map((o) => (
                <div className="order-entry" key={o.id}>
                  <div className="order-row">
                    <div>
                      <div className="num">Commande n° {shortOrderReference(o.id)}</div>
                      <div className="date">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</div>
                    </div>
                    <div className="order-status-group">
                      <span className="order-status">Paiement : {ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
                      {isFulfillmentStatus(o.fulfillmentStatus) && (
                        <span className="order-status secondary">Traitement : {FULFILLMENT_STATUS_LABEL[o.fulfillmentStatus]}</span>
                      )}
                    </div>
                  </div>
                  <div className="order-entry-items">
                    {o.items.map((item, i) => (
                      <div className="order-entry-line" key={i}>
                        <span>{item.label}</span>
                        <span>{formatPrice(item.priceCents)}</span>
                      </div>
                    ))}
                    <div className="order-entry-line muted">
                      <span>Sous-total</span>
                      <span>{formatPrice(o.subtotalCents)}</span>
                    </div>
                    {o.status === "paid" || o.status === "refunded" ? (
                      <>
                        <div className="order-entry-line muted">
                          <span>Livraison</span>
                          <span>{o.shippingCents === 0 ? "Offerte" : formatPrice(o.shippingCents)}</span>
                        </div>
                        <div className="order-entry-line total">
                          <span>Total</span>
                          <span>{formatPrice(o.totalCents)}</span>
                        </div>
                      </>
                    ) : (
                      // Livraison encore inconnue tant que le paiement Stripe n'a pas
                      // abouti (l'option de livraison est choisie côté Stripe) — pas
                      // de total honnête à afficher avant "paid".
                      <p className="order-entry-note">Frais de livraison non définitifs tant que le paiement n&apos;est pas confirmé.</p>
                    )}
                  </div>
                  {isFulfillmentStatus(o.fulfillmentStatus) && (
                    <div className="account-fulfillment">
                      <ol aria-label="Avancement de la commande">
                        {FULFILLMENT_STEPS.map((step, index) => {
                          const currentIndex = FULFILLMENT_STEPS.findIndex((candidate) => candidate.id === o.fulfillmentStatus);
                          const completed = index <= currentIndex;
                          const date = orderStepDate(o, step.id);
                          return (
                            <li key={step.id} className={completed ? "is-complete" : undefined} aria-current={step.id === o.fulfillmentStatus ? "step" : undefined}>
                              <span />
                              <strong>{step.label}</strong>
                              <small>{date ? new Date(date).toLocaleDateString("fr-FR") : "À venir"}</small>
                            </li>
                          );
                        })}
                      </ol>
                      {(o.trackingCarrier || o.trackingNumber || o.trackingUrl) && (
                        <div className="account-tracking">
                          <strong>Suivi du colis</strong>
                          {o.trackingCarrier && <span>Transporteur : {o.trackingCarrier}</span>}
                          {o.trackingNumber && <span>Numéro : {o.trackingNumber}</span>}
                          {o.trackingUrl && <a href={o.trackingUrl} target="_blank" rel="noreferrer">Suivre mon colis →</a>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {section === "profil" && (
        <section className="dashboard-panel" id="dashboard-profil" role="tabpanel">
          <h2>Mon profil</h2>
          <p>Mettez à jour les informations liées à votre compte.</p>
          <ProfileForm userId={userId} initialFirstName={firstName} initialLastName={lastName} initialEmail={email} />
        </section>
      )}

      {section === "acces" && (
        <section className="dashboard-panel" id="dashboard-acces" role="tabpanel">
          <h2>Mon accès</h2>
          <p>Les accès associés à votre compte sont regroupés ici.</p>
          <div className="access-card">
            <h3>La Vie Supérieure</h3>
            <p>Statut : accès gratuit actif tant que vous avez un compte. Vous avez accès à l&apos;ensemble des enseignements ci-dessous.</p>
          </div>
          {vsArticles.length === 0 ? (
            <div className="dashboard-empty">
              <div>
                {ICONS.lock}
                <strong>Aucun accès actif.</strong>
                <p>Cette zone reste vide tant qu&apos;aucun enseignement n&apos;est publié.</p>
              </div>
            </div>
          ) : (
            <div className="vs-library">
              {vsArticles.map((a) => (
                <div className="vs-library-item" key={a.slug}>
                  <h4>{a.title}</h4>
                  <div className="vs-library-actions">
                    <Link href={`/publications/${a.slug}`} className="btn-compact btn-compact-outline">
                      Lire
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {section === "avis" && (
        <section className="dashboard-panel" id="dashboard-avis" role="tabpanel">
          <h2>Mes avis</h2>
          <p>Retrouvez les avis que vous avez transmis et leur statut de modération.</p>
          {reviews.length === 0 ? (
            <div className="dashboard-empty">
              <div>
                {ICONS.chat}
                <strong>Aucun avis envoyé.</strong>
                <p>Vos avis apparaîtront ici après leur envoi, avec leur statut de modération.</p>
                {/* Lien générique (chantier /mon-compte, reprise) : la
                    maquette pointe vers un livre précis pris comme exemple
                    de démonstration — jamais un vrai lien à reproduire tel
                    quel pour tous les visiteurs. */}
                <Link href="/livres">Découvrir les livres →</Link>
              </div>
            </div>
          ) : (
            <div className="order-list">
              {reviews.map((r) => (
                <div className="order-row" key={r.id}>
                  <div>
                    <div className="num">{r.productTitle}</div>
                    <div className="date">
                      {r.rating ? "★".repeat(r.rating) + "☆".repeat(5 - r.rating) : "Sans note"}
                      {r.body ? ` — ${r.body}` : ""}
                    </div>
                  </div>
                  <span className="order-status">{REVIEW_STATUS_LABEL[r.status] ?? r.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
