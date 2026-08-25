"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProfileForm from "./ProfileForm";
import { formatPrice } from "@/lib/format";

type Section = "apercu" | "commandes" | "profil" | "acces" | "avis";

const SECTIONS: { id: Section; label: string }[] = [
  { id: "apercu", label: "Aperçu" },
  { id: "commandes", label: "Mes commandes" },
  { id: "profil", label: "Mon profil" },
  { id: "acces", label: "Mon accès" },
  { id: "avis", label: "Mes avis" },
];

type VsArticle = { slug: string; title: string };
type MyReview = { id: string; rating: number | null; body: string | null; status: string; productTitle: string };
type MyOrder = { id: string; status: string; totalCents: number; createdAt: string; items: string[] };

type Props = {
  userId: string;
  firstName: string;
  email: string;
  vsArticles: VsArticle[];
  reviews: MyReview[];
  orders: MyOrder[];
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

export default function DashTabs({ userId, firstName, email, vsArticles, reviews, orders }: Props) {
  const [section, setSection] = useState<Section>("apercu");
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/compte");
    router.refresh();
  }

  return (
    <div className="wrap dash-layout">
      <nav className="dash-nav">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href="#"
            className={section === s.id ? "active" : undefined}
            onClick={(e) => {
              e.preventDefault();
              setSection(s.id);
            }}
          >
            {s.label}
          </a>
        ))}
        <button onClick={handleSignOut}>Se déconnecter</button>
      </nav>

      <div>
        {section === "apercu" && (
          <div className="dash-section active">
            <div className="dash-welcome">
              <p>
                Bonjour <strong>{firstName || email}</strong>, ravis de vous revoir.
              </p>
            </div>
            <h2>Aperçu</h2>
            {orders.length === 0 ? (
              <p className="empty-state">
                Aucune commande récente. Découvrez les{" "}
                <Link href="/livres" style={{ color: "var(--purple)" }}>
                  livres
                </Link>{" "}
                ou la{" "}
                <Link href="/boutique" style={{ color: "var(--purple)" }}>
                  boutique
                </Link>
                .
              </p>
            ) : (
              <div className="order-row">
                <div>
                  <div className="num">{orders[0].items.join(", ")}</div>
                  <div className="date">{new Date(orders[0].createdAt).toLocaleDateString("fr-FR")}</div>
                </div>
                <span className="order-status">{ORDER_STATUS_LABEL[orders[0].status] ?? orders[0].status}</span>
              </div>
            )}
          </div>
        )}

        {section === "commandes" && (
          <div className="dash-section active">
            <h2>Mes commandes</h2>
            {orders.length === 0 ? (
              <p className="empty-state">
                Vous n&apos;avez pas encore de commande. Vos achats de livres et de goodies
                apparaîtront ici.
              </p>
            ) : (
              orders.map((o) => (
                <div className="order-row" key={o.id}>
                  <div>
                    <div className="num">{o.items.join(", ")}</div>
                    <div className="date">
                      {new Date(o.createdAt).toLocaleDateString("fr-FR")} — {formatPrice(o.totalCents)}
                    </div>
                  </div>
                  <span className="order-status">{ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
                </div>
              ))
            )}
          </div>
        )}

        {section === "profil" && (
          <div className="dash-section active">
            <h2>Mon profil</h2>
            <ProfileForm userId={userId} initialFirstName={firstName} initialEmail={email} />
          </div>
        )}

        {section === "acces" && (
          <div className="dash-section active">
            <h2>Mon accès</h2>
            <div className="access-card" style={{ marginBottom: 28 }}>
              <h3>La Vie Supérieure</h3>
              <p>
                Statut : accès gratuit actif tant que vous avez un compte. Vous avez accès à
                l&apos;ensemble des enseignements ci-dessous.
              </p>
            </div>
            {vsArticles.length === 0 ? (
              <p className="empty-state">Aucun enseignement publié pour le moment.</p>
            ) : (
              <div className="vs-library">
                {vsArticles.map((a) => (
                  <div className="vs-library-item" key={a.slug}>
                    <div>
                      <h4>{a.title}</h4>
                    </div>
                    <div className="vs-library-actions">
                      <a href={`/publications/${a.slug}`} className="btn-compact btn-compact-outline">Lire</a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "avis" && (
          <div className="dash-section active">
            <h2>Mes avis</h2>
            {reviews.length === 0 ? (
              <p className="empty-state">Vous n&apos;avez publié aucun avis pour le moment.</p>
            ) : (
              reviews.map((r) => (
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
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
