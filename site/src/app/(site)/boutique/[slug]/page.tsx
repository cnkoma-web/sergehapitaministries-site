import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGoodieBySlug } from "@/lib/content/goodies";
import { getReviewSummary } from "@/lib/content/reviews";
import { formatPrice } from "@/lib/format";
import Stars from "@/components/reviews/Stars";
import ReviewSection from "@/components/reviews/ReviewSection";
import GoodiePurchasePanel from "@/components/shop/GoodiePurchasePanel";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const goodie = await getGoodieBySlug(slug);
  if (!goodie) return {};
  const title = `${goodie.title} | Serge Hapita Ministries`;
  const description = `${goodie.title} — boutique Serge Hapita Ministries.`;
  return {
    title,
    description,
    alternates: { canonical: `/boutique/${slug}` },
    openGraph: { type: "website", title, description, url: `/boutique/${slug}`, siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  };
}

export default async function GoodieDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const goodie = await getGoodieBySlug(slug);
  if (!goodie) notFound();

  const summary = await getReviewSummary({ goodieId: goodie.id });
  const available = goodie.status === "available";

  return (
    // RECONSTRUCTION (chantier Boutique — fiche Goodie, reprise) : la fiche
    // réelle de la maquette (prototype-html/boutique/t-shirt-voix-
    // prophetique/index.html) N'EST PAS la fiche Livre — la V2 précédente
    // reproduisait la Fiche Livre par analogie (.product-cover en couverture
    // 2:3, sélecteurs à vignettes) alors que le vrai gabarit Goodie utilise
    // un panneau visuel plein cadre (.product-visual, sticky, dégradé,
    // AUCUN ratio 2:3), un bandeau d'indisponibilité (.product-unavailable,
    // absent jusqu'ici) et deux <select> classiques (.product-choice). Le
    // squelette commun aux deux fiches (.book-detail-hero/.book-detail/
    // .catalog-badge/.book-meta/.book-description, mêmes classes ET mêmes
    // valeurs dans les deux maquettes) reste légitimement partagé via
    // .v2-product-page — seul ce qui diverge réellement est reconstruit ici.
    <div className="v2-product-page">
      <div className="v2-breadcrumbs-hero">
        <div className="v2-commerce-wrap v2-breadcrumbs">
          <Link href="/boutique">Boutique</Link>
          <span>›</span>
          <span>{goodie.title}</span>
        </div>
      </div>

      <section className="v2-commerce-wrap product-grid">
        <div className="product-visual">
          {goodie.image_url ? (
            <Image src={goodie.image_url} alt={goodie.title} fill style={{ objectFit: "cover" }} />
          ) : (
            <>
              {/* Accroche éditoriale du visuel (§ .product-visual span, maquette) :
                  absente du modèle goodies (DONNÉE CMS MANQUANTE, comme sur le Hub
                  Boutique) — repli sur le titre réel, jamais une phrase codée en
                  dur. "Visuel à venir" (§ .product-visual small) est un texte
                  générique d'interface, reproduit à l'identique. */}
              <span>{goodie.title}</span>
              <small>Visuel à venir</small>
            </>
          )}
        </div>

        <div className="product-info-col">
          <span className="product-badge">{available ? "Disponible" : "Bientôt disponible"}</span>
          <h1 className="product-title">{goodie.title}</h1>

          {/* AJOUTÉ (reconstruction) : § .product-unavailable, maquette —
              entièrement absent jusqu'ici. Ne s'affiche que si le produit
              n'est pas disponible, comme sur la maquette. */}
          {!available && (
            <div className="product-unavailable">
              Cette fiche montre le gabarit du produit. Le visuel, le prix, les couleurs, les tailles et la
              disponibilité seront alimentés par le CMS lors de l&apos;ouverture de la Boutique.
            </div>
          )}

          <div className="rating-row">
            <Stars rating={summary.average} />
            <span className="count">
              {summary.count > 0 ? `${summary.average} · ${summary.count} avis` : "Aucun avis pour le moment"}
            </span>
          </div>

          <GoodiePurchasePanel
            goodieId={goodie.id}
            sizes={goodie.sizes}
            colors={goodie.colors}
            available={available}
            priceLabel={formatPrice(goodie.price_cents)}
          />

          {/* § .book-meta, maquette : Type/Collection n'ont aucune source dans
              le modèle goodies (DONNÉE CMS MANQUANTE, signalée dans le
              référentiel) — Disponibilité, elle, est réelle (goodie.status).
              Les données réelles existantes qui dépassent le gabarit statique
              (matière, coupe, entretien, fabrication, délai) sont préservées
              dans ce même conteneur, à la direction graphique de la maquette
              (.specs-table déjà certifié, structurellement identique à
              .book-meta). */}
          <div className="specs-table">
            <div className="specs-row"><span>Disponibilité</span><span>{available ? "Disponible" : "À venir"}</span></div>
            <div className="specs-row"><span>Matière</span><span>{goodie.material || "À renseigner"}</span></div>
            <div className="specs-row"><span>Coupe</span><span>{goodie.cut || "À renseigner"}</span></div>
            <div className="specs-row"><span>Entretien</span><span>{goodie.care || "À renseigner"}</span></div>
            <div className="specs-row"><span>Fabrication</span><span>{goodie.fabrication || "À la demande"}</span></div>
            <div className="specs-row"><span>Délai d&apos;expédition</span><span>{goodie.shipping_delay || "À renseigner"}</span></div>
          </div>
        </div>
      </section>

      {/* COMPOSITION corrigée (non-régression, reprise fiche Livre 14/09) :
          .content-col (695px, classe partagée avec les articles) a été
          remplacé par .v2-commerce-wrap sur la fiche Livre lors de la
          correction d'un bug de largeur — ce bloc .product-desc est
          PARTAGÉ entre les 2 pages (voir le commentaire d'origine dans
          globals.css), donc reporté ici à l'identique pour ne pas laisser
          cette fiche avec une grille interne cassée (plus de
          grid-template-columns appliqué depuis le renommage). */}
      {goodie.description && (
        <section className="section product-desc">
          <div className="v2-commerce-wrap">
            <h2>À propos du produit</h2>
            {/* Seul un admin (is_admin() en base) peut écrire ce HTML — voir RichTextEditor. */}
            <div dangerouslySetInnerHTML={{ __html: goodie.description }} />
          </div>
        </section>
      )}

      <ReviewSection goodieId={goodie.id} />
      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
