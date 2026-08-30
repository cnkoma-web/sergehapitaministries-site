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
  const featured = books[0];

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Livres</h1>
          <p>Les ouvrages de Serge publiés sous amDG Éditions.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 56, paddingBottom: 56 }}>
        <div className="wrap catalogue-intro-split">
          <div>
            <h2 style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontStyle: "italic", lineHeight: 1.35, marginBottom: 28, maxWidth: 460 }}>
              Chaque livre est un compagnon de route, un outil de transformation intérieure, un
              appel à vivre selon la justice du Royaume.
            </h2>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 22, display: "flex", gap: 44 }}>
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 600, color: "var(--purple)" }}>
                  {books.length}
                </div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-soft)", marginTop: 2 }}>
                  Ouvrages au catalogue
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 600, color: "var(--purple)" }}>100</div>
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-soft)", marginTop: 2 }}>
                  % Édition indépendante
                </div>
              </div>
            </div>
          </div>

          {featured && (
            <div style={{ background: "var(--lavender)", borderRadius: 12, padding: 20, borderTop: "3px solid var(--purple)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--purple)", marginBottom: 14 }}>
                ★ {featured.badge || "En avant"} · {featured.author}
              </div>
              <div className="catalogue-thumb" style={{ margin: "0 auto 18px", maxWidth: 220 }}>
                {featured.cover_url ? (
                  <CoverRollover src={featured.cover_url} hoverSrc={featured.hover_cover_url} alt={featured.title} />
                ) : (
                  <div className="catalogue-thumb placeholder">
                    <div>
                      <div className="ph-collection">{featured.publisher}</div>
                      <div className="ph-title">{featured.title}</div>
                    </div>
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <h3 style={{ fontFamily: "Fraunces, serif", fontSize: 19, marginBottom: 6 }}>{featured.title}</h3>
                <div style={{ fontFamily: "Fraunces, serif", fontWeight: 600, fontSize: 17, color: "var(--purple)", marginBottom: 16 }}>
                  {formatPrice(featured.price_cents)}
                </div>
                <Link
                  href={`/livres/${featured.slug}`}
                  style={{ display: "block", background: "var(--ink)", color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", padding: 13, borderRadius: 4 }}
                >
                  → Découvrir
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          {books.length === 0 ? (
            <p className="empty-state" style={{ textAlign: "center" }}>
              Le catalogue est en cours de préparation.
            </p>
          ) : (
            <div className="catalogue-grid">
              {books.map((book) => (
                <div className="catalogue-book" key={book.id}>
                  <div className="catalogue-thumb">
                    {book.status === "precommande" ? (
                      <span className="catalogue-badge">Précommande</span>
                    ) : (
                      book.badge && <span className="catalogue-badge">{book.badge}</span>
                    )}
                    {book.cover_url ? (
                      <CoverRollover src={book.cover_url} hoverSrc={book.hover_cover_url} alt={book.title} />
                    ) : (
                      <div className="catalogue-thumb placeholder" style={{ position: "absolute", inset: 0 }}>
                        <div>
                          <div className="ph-collection">{book.publisher}</div>
                          <div className="ph-title">{book.title}</div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="catalogue-body">
                    <h3>{book.title}</h3>
                    <div className="author">{book.author}</div>
                    <div className="price">{formatPrice(book.price_cents)}</div>
                    <div className="catalogue-actions">
                      <Link href={`/livres/${book.slug}`}>Voir</Link>
                      <AddToCartButton bookId={book.id} className="add-cart" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section" style={{ background: "var(--lavender)", textAlign: "center" }}>
        <div className="wrap" style={{ maxWidth: 640 }}>
          <div className="eyebrow" style={{ justifyContent: "center" }}>amDG Éditions</div>
          <h2 style={{ fontSize: 26, marginBottom: 16 }}>La maison d&apos;édition de Serge Hapita</h2>
          <p style={{ color: "var(--ink-soft)", marginBottom: 22 }}>
            Tous ces ouvrages sont publiés sous amDG Éditions, l&apos;une des activités portées
            par l&apos;association ActesDesFilsDeDieu.
          </p>
          <a href="http://www.amdgeditions.fr" className="btn btn-outline">
            Découvrir amDG Éditions →
          </a>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
