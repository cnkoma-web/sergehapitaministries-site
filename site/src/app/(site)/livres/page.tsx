import type { Metadata } from "next";
import Link from "next/link";
import { getBooks } from "@/lib/content/books";
import { formatPrice } from "@/lib/format";
import CoverRollover from "@/components/shop/CoverRollover";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Livres | Serge Hapita Ministries";
const description = "Les ouvrages de Serge Hapita publiés sous amDG Éditions.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/livres" },
  openGraph: { type: "website", title, description, url: "/livres", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function LivresPage() {
  const books = await getBooks();

  return (
    // V2 (retour du 11/09, Lot 5) — reproduit prototype-html/livres/
    // index.html § .store-hero/.catalog-intro/.catalog-grid (commerce.css).
    // Réhabillage visuel uniquement : getBooks, CoverRollover,
    // AddToCartButton, formatPrice inchangés. La maquette ne réserve pas
    // de mise en avant séparée pour le premier livre (contrairement à
    // l'ancien habillage) : tous les livres, y compris le plus récent,
    // apparaissent uniformément dans la grille — aucune donnée perdue.
    <div className="v2-commerce-page">
      <section className="v2-store-hero livres">
        <div className="v2-commerce-wrap v2-store-hero-inner">
          <p className="v2-eyebrow light">
            <span /> amDG Éditions du Royaume
          </p>
          <h1>Livres</h1>
          <p>Les ouvrages de Serge publiés sous amDG Éditions.</p>
        </div>
      </section>

      <section className="v2-commerce-wrap">
        <div className="v2-catalog-intro">
          <h2>
            Chaque livre est un compagnon de route, un outil de transformation intérieure, un appel à vivre selon la{" "}
            <em>justice du Royaume.</em>
          </h2>
        </div>

        {books.length === 0 ? (
          <p className="empty-state">Le catalogue est en cours de préparation.</p>
        ) : (
          <div className="v2-catalog-grid">
            {books.map((book) => (
              <article className="v2-catalog-card" key={book.id}>
                <Link href={`/livres/${book.slug}`} className="v2-catalog-cover-link" aria-label={`Découvrir ${book.title}`}>
                  <div className="v2-catalog-cover">
                    {book.cover_url ? (
                      <CoverRollover src={book.cover_url} hoverSrc={book.hover_cover_url} alt={book.title} />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "linear-gradient(135deg,var(--v2-violet),var(--v2-violet-deep))", padding: 14, textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--v2-serif)", fontWeight: 600, color: "#fff", fontSize: 15, lineHeight: 1.3 }}>{book.title}</div>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="v2-catalog-card-body">
                  {book.status === "precommande" ? (
                    <span className="v2-catalog-badge">Précommande</span>
                  ) : (
                    book.badge && <span className="v2-catalog-badge">{book.badge}</span>
                  )}
                  <h2>
                    <Link href={`/livres/${book.slug}`}>{book.title}</Link>
                  </h2>
                  <p className="v2-catalog-price">{formatPrice(book.price_cents)}</p>
                  <div className="v2-catalog-actions">
                    <Link href={`/livres/${book.slug}`} className="v2-catalog-detail">
                      Voir le livre
                    </Link>
                    <AddToCartButton
                      bookId={book.id}
                      className="v2-catalog-add"
                      ariaLabel={`Ajouter ${book.title} au panier`}
                      label={
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" />
                          <circle cx="9.5" cy="19" r="1" />
                          <circle cx="17" cy="19" r="1" />
                          <path d="M13 5v6M10 8h6" />
                        </svg>
                      }
                      addedLabel="✓"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="v2-catalog-facts v2-catalog-conclusion">
          <div>
            <strong>{books.length}</strong>
            <span>livres au catalogue</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>édition indépendante</span>
          </div>
        </div>
      </section>

      {/* CTA amDG Éditions — fonctionnalité réelle sans emplacement dans la
          maquette (voir la note en tête de section dans globals.css pour
          les précédents équivalents) : gardée, habillée avec la palette
          v2. */}
      <section className="v2-support-section" style={{ padding: "72px 0" }}>
        <div className="v2-wrap" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <p className="v2-eyebrow light" style={{ justifyContent: "center" }}>
            <span /> amDG Éditions
          </p>
          <h2 style={{ color: "#fff", fontFamily: "var(--v2-serif)", fontWeight: 500, fontSize: 32, marginBottom: 16 }}>La maison d&apos;édition de Serge Hapita</h2>
          <p style={{ color: "rgba(255,255,255,.74)", marginBottom: 22 }}>
            Tous ces ouvrages sont publiés sous amDG Éditions, l&apos;une des activités portées par l&apos;association
            ActesDesFilsDeDieu.
          </p>
          <a href="http://www.amdgeditions.fr" className="v2-button v2-button-light">
            Découvrir amDG Éditions <span>→</span>
          </a>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
