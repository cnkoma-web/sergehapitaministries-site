import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookBySlug, getAdjacentBooks, getBookImages } from "@/lib/content/books";
import CoverRollover from "@/components/shop/CoverRollover";
import PublisherLink from "@/components/shop/PublisherLink";
import { getReviewSummary } from "@/lib/content/reviews";
import { formatPrice } from "@/lib/format";
import { stripHtml } from "@/lib/richtext";
import Stars from "@/components/reviews/Stars";
import ReviewSection from "@/components/reviews/ReviewSection";
import AddToCartButton from "@/components/cart/AddToCartButton";
import ShareCartouche from "@/components/articles/ShareCartouche";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

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
  const pageUrl = `${SITE_URL}/livres/${slug}`;
  // Fallback si la description n'est pas encore renseignée (retour du
  // 05/09) — même principe que shareExcerpt sur les articles : à défaut de
  // texte, le partage retombe sur "titre - lien" simple (voir ShareCartouche).
  const shareDescription = book.description ? stripHtml(book.description) : undefined;

  return (
    // V2 (retour du 11/09, Lot 5) — reproduit prototype-html/livres/
    // manifester-ce-que-dieu-a-prevu/index.html § .book-detail-hero/
    // .book-detail/.book-description/.reviews-section (commerce.css).
    // Réhabillage visuel uniquement : getBookBySlug, getAdjacentBooks,
    // CoverRollover, Stars, ReviewSection, AddToCartButton, ShareCartouche
    // inchangés. Le fil d'Ariane remplace l'ancienne navigation
    // prev/catalogue/next en haut de page (absente de la maquette) — cette
    // navigation reste réelle, déplacée en bas de fiche (§ .book-sequence,
    // voir juste avant les avis), à l'identique de la maquette.
    <div className="v2-product-page">
      <div className="v2-wrap v2-breadcrumbs">
        <Link href="/">Accueil</Link>
        <span>›</span>
        <Link href="/livres">Livres</Link>
        <span>›</span>
        <span>{book.title}</span>
      </div>

      <section className="product-section">
        <div className="wrap">
          <div className="product-grid">
            {/* Regroupe couverture + galerie dans un même axe (retour du
                03/09) : elles partagent maintenant le même centrage plutôt
                que d'être centrées indépendamment l'une de l'autre — voir
                .product-cover-col pour la largeur responsive (340px desktop,
                260px sous 980px, alignée sur .product-cover). */}
            <div className="product-cover-col">
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
              <div className="product-author">
                <Link href="/de-serge">{book.author}</Link> — <PublisherLink publisher={book.publisher} />
              </div>

              <div className="rating-row">
                <Stars rating={summary.average} />
                <span className="count">
                  {summary.count > 0 ? `${summary.average} · ${summary.count} avis` : "Aucun avis pour le moment"}
                </span>
              </div>

              <div className="price-actions-row">
                <div className="product-price">{formatPrice(book.price_cents)}</div>
              </div>

              <div className="specs-table">
                <div className="specs-row"><span>Éditeur</span><span><PublisherLink publisher={book.publisher} /></span></div>
                <div className="specs-row"><span>Auteur</span><span>{book.author}</span></div>
                <div className="specs-row"><span>Format</span><span>{book.format || "À renseigner"}</span></div>
                <div className="specs-row"><span>Pages</span><span>{book.pages ? `${book.pages} p.` : "À renseigner"}</span></div>
                <div className="specs-row"><span>Langue</span><span>{book.language || "Français"}</span></div>
                <div className="specs-row"><span>ISBN</span><span>{book.isbn || "À renseigner"}</span></div>
              </div>

              {/* Déplacé sous la liste de caractéristiques, aligné à gauche
                  comme la galerie de vignettes sous la couverture (retour du
                  03/09) — n'était plus à côté du prix. */}
              <div className="product-actions">
                <Link href="/livres" className="btn-compact btn-compact-outline" title="Retour au catalogue" aria-label="Retour au catalogue">
                  ←
                </Link>
                <AddToCartButton bookId={book.id} className="btn-compact btn-compact-primary" label="Ajouter au panier" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* paddingBottom:0 (retour du 07/09, revue complète des zones de
          partage) — le partage n'est plus un simple bloc dans cette même
          colonne de texte (voir .share-zone juste en dessous), plus besoin
          d'espace réservé ici en bas. */}
      <section className="section product-desc" style={{ paddingBottom: 0 }}>
        <div className="content-col">
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

      {/* Zone de partage --purple pleine (retour du 07/09, revue complète) —
          même schéma que les publications (voir ShareCartouche/globals.css) :
          bien démarquée par sa propre bande de couleur plutôt qu'un simple
          bloc sans fond dans la colonne de texte. Corrige au passage un vrai
          bug jamais signalé isolément : le message "Lien copié !"
          (.copy-feedback, texte blanc) était invisible sur le fond blanc
          d'origine, faute de cette bande de couleur derrière lui. */}
      <section className="share-zone">
        <div className="content-col">
          <ShareCartouche title={book.title} url={pageUrl} bookDescription={shareDescription} />
        </div>
      </section>

      {/* Navigation prev/suivant (§ .book-sequence) — même donnée réelle
          (getAdjacentBooks) que l'ancienne .book-nav, déplacée en bas de
          fiche pour reproduire la position exacte de la maquette. */}
      <nav className="v2-wrap v2-book-sequence" aria-label="Navigation entre les livres">
        {prev ? <Link href={`/livres/${prev.slug}`}>← Précédent</Link> : <span />}
        <Link href="/livres" className="v2-book-sequence-mid">Tous les livres</Link>
        {next ? <Link href={`/livres/${next.slug}`}>Suivant →</Link> : <span />}
      </nav>

      <ReviewSection bookId={book.id} />
      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
