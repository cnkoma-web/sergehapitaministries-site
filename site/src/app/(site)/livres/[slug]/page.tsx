import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, getAdjacentBooks, getBookImages } from "@/lib/content/books";
import CoverRollover from "@/components/shop/CoverRollover";
import { getReviewSummary } from "@/lib/content/reviews";
import { formatPrice } from "@/lib/format";
import Stars from "@/components/reviews/Stars";
import ReviewSection from "@/components/reviews/ReviewSection";
import AddToCartButton from "@/components/cart/AddToCartButton";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) return {};
  const title = `${book.title} | Serge Hapita Ministries`;
  const description = book.description || `${book.title}, un livre de ${book.author}.`;
  return {
    title,
    description,
    alternates: { canonical: `/livres/${slug}` },
    openGraph: { type: "website", title, description, url: `/livres/${slug}`, siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function LivreDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  if (!book) notFound();

  const [{ prev, next }, summary, images] = await Promise.all([
    getAdjacentBooks(book.position),
    getReviewSummary({ bookId: book.id }),
    getBookImages(book.id),
  ]);
  const galleryImages = images.length > 0 ? images : book.cover_url ? [{ id: "cover", url: book.cover_url, position: 0 }] : [];

  return (
    <>
      <section className="product-section">
        {/* Pas de --content-col ici (retour du 31/08) : la zone image+infos
            est un affichage produit, pas du texte de lecture — elle garde la
            largeur standard .wrap. Seul l'écart interne (gap) est resserré,
            voir .product-grid. Le texte de lecture en dessous
            (.product-desc) reste, lui, sur --content-col. */}
        <div className="wrap">
          <div className="book-nav">
            {prev ? (
              <Link href={`/livres/${prev.slug}`} className="book-nav-link">← {prev.title}</Link>
            ) : (
              <span />
            )}
            <Link href="/livres" className="book-nav-catalogue">Tout le catalogue</Link>
            {next ? (
              <Link href={`/livres/${next.slug}`} className="book-nav-link">{next.title} →</Link>
            ) : (
              <span />
            )}
          </div>

          <div className="product-grid">
            <div>
              <div className={galleryImages.length > 0 ? "product-cover" : "product-cover placeholder"}>
                {galleryImages.length > 0 ? (
                  <CoverRollover src={galleryImages[0].url} hoverSrc={galleryImages[1]?.url} alt={book.title} />
                ) : (
                  <div>
                    <div className="ph-collection">{book.publisher}</div>
                    <div className="ph-title">{book.title}</div>
                  </div>
                )}
              </div>
              {galleryImages.length > 1 && (
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {galleryImages.map((img, i) => (
                    <div key={img.id} style={{ width: 56, aspectRatio: "2/3", borderRadius: 6, overflow: "hidden", border: "1px solid var(--line)" }}>
                      <Image src={img.url} alt={`${book.title} — vue ${i + 1}`} width={56} height={84} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              {book.status === "precommande" && (
                <div className="status-badge precommande" style={{ marginBottom: 8 }}>
                  Précommande
                </div>
              )}
              {book.badge && <div className="product-badge">{book.badge}</div>}
              <h1 className="product-title">{book.title}</h1>
              <div className="product-author">{book.author} — {book.publisher}</div>

              <div className="rating-row">
                <Stars rating={summary.average} />
                <span className="count">
                  {summary.count > 0 ? `${summary.average} · ${summary.count} avis` : "Aucun avis pour le moment"}
                </span>
              </div>

              <div className="price-actions-row">
                <div className="product-price">{formatPrice(book.price_cents)}</div>
                <div className="product-actions">
                  <Link href="/livres" className="btn-compact btn-compact-outline" title="Retour au catalogue" aria-label="Retour au catalogue">
                    ←
                  </Link>
                  <AddToCartButton bookId={book.id} className="btn-compact btn-compact-primary" label="Ajouter au panier" />
                </div>
              </div>

              <div className="specs-table">
                <div className="specs-row"><span>Éditeur</span><span>{book.publisher}</span></div>
                <div className="specs-row"><span>Auteur</span><span>{book.author}</span></div>
                <div className="specs-row"><span>Format</span><span>{book.format || "À renseigner"}</span></div>
                <div className="specs-row"><span>Pages</span><span>{book.pages ? `${book.pages} p.` : "À renseigner"}</span></div>
                <div className="specs-row"><span>Langue</span><span>{book.language || "Français"}</span></div>
                <div className="specs-row"><span>ISBN</span><span>{book.isbn || "À renseigner"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section product-desc">
        <div className="wrap">
          <h2>À propos de ce livre</h2>
          {book.description ? (
            // L'admin (seul auteur possible de ce HTML, is_admin() en base) est la
            // seule source de ce contenu — voir RichTextEditor pour la frontière de confiance.
            <div dangerouslySetInnerHTML={{ __html: book.description }} />
          ) : (
            <p>Description complète à venir.</p>
          )}
        </div>
      </section>

      <ReviewSection bookId={book.id} />
      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
