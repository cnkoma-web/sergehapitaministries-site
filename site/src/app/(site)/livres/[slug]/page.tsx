import type { Metadata } from "next";
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
import BookPurchaseRow from "@/components/shop/BookPurchaseRow";
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
      {/* COMPOSITION corrigée (reconstruction Phase B2) : le fil d'Ariane
          et la grille produit utilisaient .v2-wrap/.wrap (1180px) au lieu
          de .v2-commerce-wrap (1120px, § .commerce-wrap de la maquette) —
          largeur erronée depuis l'origine, jamais mesurée précisément. */}
      <div className="v2-commerce-wrap v2-breadcrumbs">
        <Link href="/">Accueil</Link>
        <span>›</span>
        <Link href="/livres">Livres</Link>
        <span>›</span>
        <span>{book.title}</span>
      </div>

      <section className="product-section">
        <div className="v2-commerce-wrap">
          <div className="product-grid">
            {/* Regroupe couverture + galerie dans un même axe (retour du
                03/09) : elles partagent maintenant le même centrage plutôt
                que d'être centrées indépendamment l'une de l'autre — voir
                .product-cover-col pour la largeur responsive (340px desktop,
                260px sous 980px, alignée sur .product-cover). */}
            <div className="product-cover-col">
              <div className={galleryImages.length > 0 ? "product-cover" : "product-cover placeholder"}>
                {galleryImages.length > 0 ? (
                  <CoverRollover src={galleryImages[0].url} hoverSrc={galleryImages[1]?.url} alt={book.title} focusable />
                ) : (
                  <div>
                    <div className="ph-collection">{book.publisher}</div>
                    <div className="ph-title">{book.title}</div>
                  </div>
                )}
              </div>
              {/* SUPPLÉMENTAIRE V2 retiré (reprise après validation humaine,
                  14/09) : cette bande de vignettes appartenait à l'ancien
                  système de galerie — la maquette actuelle (§ .book-gallery)
                  ne montre qu'une grande couverture avec rollover vers le
                  dos, jamais de vignettes sous la couverture. Aucune donnée
                  supprimée : book_images continue d'alimenter CoverRollover
                  via galleryImages[0]/[1] (couverture + dos), seul l'AFFICHAGE
                  de la liste complète en vignettes est retiré de cette page. */}
              {/* ABSENT V2 corrigé (reconstruction Phase B2) : indication de
                  survol totalement absente jusqu'ici — restaurée à
                  l'identique de la maquette. N'a de sens que lorsqu'un vrai
                  dos existe (galleryImages[1]) : sur un livre sans 2e image,
                  CoverRollover n'affiche qu'une couverture fixe, rien à
                  "retourner". */}
              {galleryImages.length > 1 && (
                <p className="gallery-hint">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3" />
                  </svg>
                  Survolez ou touchez la couverture pour voir le dos
                </p>
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
              {/* CONTENU corrigé (reconstruction Phase B2) : séparateur "—"
                  (tiret cadratin) en dur au lieu du "·" (point médian, dans
                  un <span> flex séparé) de la maquette (§ .book-byline). */}
              <div className="product-author">
                <Link href="/de-serge">{book.author}</Link>
                <span>·</span>
                <PublisherLink publisher={book.publisher} />
              </div>

              <div className="rating-row">
                <Stars rating={summary.average} />
                <span className="count">
                  {summary.count > 0 ? `${summary.average} · ${summary.count} avis` : "Aucun avis pour le moment"}
                </span>
              </div>

              {/* ABSENT DONNÉE CMS (reconstruction Phase B2, SECTION 04.B) :
                  la maquette porte un court chapeau (.book-promise, ex.
                  "Toute vie se construit depuis une sagesse. Laquelle
                  gouverne réellement la tienne ?") juste sous l'auteur.
                  Aucun champ de la table `books` (title/author/publisher/
                  badge/price_cents/cover_url/format/pages/language/isbn/
                  description/status/position) ne porte légitimement cette
                  donnée : ce n'est ni un sous-titre, ni un résumé, ni une
                  citation d'ouvrage — `description` est le corps long de la
                  fiche ("À propos de ce livre"), la détourner pour en
                  extraire une phrase d'accroche fabriquerait un contenu
                  jamais saisi par l'admin. SIGNALÉ, NON CORRIGÉ ici :
                  ajouter ce champ suppose une évolution du schéma
                  `books` + de l'admin (nouveau champ éditorial), hors
                  périmètre d'une correction de code — décision à valider
                  par Serge avant toute évolution. */}

              <div className="price-actions-row">
                <div className="product-price">{formatPrice(book.price_cents)}</div>
              </div>

              {/* Sélecteur de quantité + ajout au panier (reconstruction
                  Phase B2, SECTION 04.C — fonction réelle manquante,
                  identifiée en Phase A) : repris de la position exacte de
                  la maquette (§ .purchase-row, juste sous le prix), avant
                  la fiche technique. Remplace l'ancien bouton "Ajouter au
                  panier" + "← retour au catalogue" (.product-actions,
                  déplacé sous les caractéristiques le 03/09) : ce bouton
                  retour n'a jamais existé dans la maquette et faisait
                  doublon avec le lien "Livres" du fil d'Ariane — retiré en
                  même temps que la CTA d'achat rejoint sa vraie place. */}
              <BookPurchaseRow bookId={book.id} />
              <p className="v2-purchase-note">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="4" y="10" width="16" height="11" rx="2" />
                  <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                </svg>
                Paiement sécurisé par Stripe · Livraison calculée selon la destination
              </p>

              <div className="specs-table">
                <div className="specs-row"><span>Éditeur</span><span><PublisherLink publisher={book.publisher} /></span></div>
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

      {/* paddingBottom:0 (retour du 07/09, revue complète des zones de
          partage) — le partage n'est plus un simple bloc dans cette même
          colonne de texte (voir .share-zone juste en dessous), plus besoin
          d'espace réservé ici en bas. */}
      {/* COMPOSITION corrigée (reconstruction Phase B2) : padding-bottom:0
          en ligne compensait l'ancien .share-zone directement accolé
          (aucun espace propre) — désormais remplacé par .v2-book-sharing
          qui porte son propre padding-block:34px (§ .book-sharing,
          maquette) : le padding-block:92px symétrique de .product-desc
          (§ .book-description) peut donc s'appliquer normalement des deux
          côtés, comme sur la maquette. Largeur également corrigée :
          .content-col (695px, classe partagée avec les articles) ne
          correspondait ni à l'ancien override (1000px, jamais justifié)
          ni à la maquette (.commerce-wrap, 1120px) — .v2-commerce-wrap
          utilisé à la place, cohérent avec le reste de cette page. */}
      <section className="section product-desc">
        <div className="v2-commerce-wrap">
          {/* CONTENU corrigé : la maquette impose un retour à la ligne
              explicite ("À propos<br>de ce livre", § .book-description
              h2) plutôt que de compter sur le retour naturel du texte. */}
          <h2>
            À propos
            <br />
            de ce livre
          </h2>
          {book.description ? (
            // L'admin (seul auteur possible de ce HTML, is_admin() en base) est la
            // seule source de ce contenu — voir RichTextEditor pour la frontière de confiance.
            <div dangerouslySetInnerHTML={{ __html: book.description }} />
          ) : (
            <p>Description complète à venir.</p>
          )}
        </div>
      </section>

      {/* STRUCTURE/STYLE corrigés (reconstruction Phase B2, SECTION 07) :
          la fiche livre a sa propre maquette pour le partage (§
          .book-sharing — ligne simple h2 + icônes, fond clair, filet
          inférieur), différente du bandeau plein "--purple" des
          publications (§ .share-zone) réutilisé ici par erreur. Le
          composant partagé ShareCartouche n'est PAS reconstruit (ses
          classes internes .share-block/.share-row/.share-icon restent
          strictement inchangées, comme demandé) — seul le CONTENEUR change
          pour reproduire .book-sharing ; les icônes n'ayant plus
          d'ancêtre .share-zone, elles héritent nativement de la couleur de
          texte de la page (--v2-ink, sombre), ce qui est justement le bon
          contraste sur ce fond clair. */}
      {/* Une seule section portant les 2 classes (§ "commerce-narrow
          book-sharing" dans la maquette), pas une section pleine largeur
          enveloppant un conteneur centré : le filet inférieur (border-
          bottom) doit lui-même faire 930px de large et rester centré, pas
          courir bord à bord. */}
      <section className="v2-commerce-narrow v2-book-sharing">
        <h2>Partager ce livre</h2>
        <ShareCartouche title={book.title} url={pageUrl} bookDescription={shareDescription} />
      </section>

      {/* ORDRE corrigé (reconstruction Phase B2, SECTION 09) : la maquette
          place la navigation précédent/suivant APRÈS les avis (§
          .reviews-section puis .book-sequence) — l'ordre inverse était en
          place depuis le 11/09. getAdjacentBooks(book.position) inchangé.
          COMPOSITION corrigée au passage : la maquette place ce nav dans
          .commerce-narrow (930px, § "commerce-narrow book-sequence"), pas
          .v2-wrap (1180px) — largeur erronée depuis l'origine. */}
      <ReviewSection bookId={book.id} />
      <nav className="v2-commerce-narrow v2-book-sequence" aria-label="Navigation entre les livres">
        {prev ? <Link href={`/livres/${prev.slug}`}>← Précédent</Link> : <span />}
        <Link href="/livres" className="v2-book-sequence-mid">Tous les livres</Link>
        {next ? <Link href={`/livres/${next.slug}`}>Suivant →</Link> : <span />}
      </nav>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
