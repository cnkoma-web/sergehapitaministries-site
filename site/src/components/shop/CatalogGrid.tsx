"use client";

import { useState } from "react";
import Link from "next/link";
import type { Book } from "@/lib/content/books";
import { formatPrice } from "@/lib/format";
import CoverRollover from "@/components/shop/CoverRollover";
import AddToCartButton from "@/components/cart/AddToCartButton";

const PER_PAGE_OPTIONS = [4, 8] as const;
const DEFAULT_PER_PAGE = 4;

// Pagination du catalogue (reprise ciblée, décision validée 14/09) : la
// maquette (§ .pagination, prototype-html/livres/) affiche 4 livres par
// page — conservé comme réglage par défaut, avec un sélecteur 4/8
// additionnel (jamais présent dans la maquette, décision validée) pour
// laisser le choix à l'internaute. Composant client car la pagination est
// un état d'affichage pur (aucune donnée supplémentaire à charger : tous
// les livres sont déjà récupérés côté serveur par getBooks(), dans leur
// ordre réel — le découpage par page se fait ici par simple slice(),
// jamais par un nouveau tri).
export default function CatalogGrid({ books }: { books: Book[] }) {
  const [perPage, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(books.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * perPage;
  const pageBooks = books.slice(start, start + perPage);

  function handlePerPageChange(next: number) {
    const nextTotalPages = Math.max(1, Math.ceil(books.length / next));
    setPerPage(next);
    // "si le changement... rend la page courante inexistante, revenir à
    // la première page" — seulement dans ce cas précis, pas systématique.
    setPage((p) => (p > nextTotalPages ? 1 : p));
  }

  return (
    <>
      <div className="v2-catalog-grid">
        {pageBooks.map((book) => (
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

      {/* Composition validée (14/09) : sélecteur 4/8 à GAUCHE, pagination à
          DROITE — la pagination n'est plus centrée comme sur la maquette
          d'origine (§ .pagination, justify-content:center). Le sélecteur
          reste toujours visible, même quand une seule page suffit, pour
          permettre de revenir à 4/page. */}
      <div className="v2-catalog-toolbar">
        <div className="v2-catalog-perpage">
          <label htmlFor="livres-per-page">Afficher</label>
          <select
            id="livres-per-page"
            value={perPage}
            onChange={(e) => handlePerPageChange(Number(e.target.value))}
          >
            {PER_PAGE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>livres par page</span>
        </div>

        {totalPages > 1 && (
          <nav className="v2-pagination" aria-label="Pagination du catalogue">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-current={currentPage === n ? "page" : undefined}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  );
}
