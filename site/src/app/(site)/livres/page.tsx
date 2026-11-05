import type { Metadata } from "next";
import { getBooks } from "@/lib/content/books";
import { getPageContent } from "@/lib/content/pageContent";
import CatalogGrid from "@/components/shop/CatalogGrid";
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
  const [books, pageContent] = await Promise.all([getBooks(), getPageContent("livres")]);

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
          {/* v2-brand-case (audit Hub Livres, 14/09) : classe déjà présente
              dans globals.css (§ .v2-brand-case, text-transform:none) mais
              jamais appliquée ici — l'eyebrow "amDG Éditions du Royaume"
              héritait donc du text-transform:uppercase de .v2-eyebrow et
              s'affichait "AMDG ÉDITIONS DU ROYAUME", perdant la graphie de
              marque figée (a/m minuscules) que la maquette (.brand-case)
              préserve explicitement. */}
          <p className="v2-eyebrow light v2-brand-case">
            <span /> {pageContent.eyebrow}
          </p>
          <h1>{pageContent.title}</h1>
          <p>{pageContent.intro}</p>
        </div>
      </section>

      <section className="v2-commerce-wrap">
        <div className="v2-catalog-intro">
          <h2>{pageContent.catalog_intro}</h2>
        </div>

        {books.length === 0 ? (
          <p className="empty-state">{pageContent.empty_state}</p>
        ) : (
          <CatalogGrid books={books} />
        )}

        <div className="v2-catalog-facts v2-catalog-conclusion">
          <div>
            <strong>{books.length}</strong>
            <span>{pageContent.catalog_count_label}</span>
          </div>
          <div>
            <strong>{pageContent.independent_value}</strong>
            <span>{pageContent.independent_label}</span>
          </div>
        </div>
      </section>

      {/* CTA "amDG Éditions" retiré (reprise ciblée, décision validée 14/09,
          confirmée par validation humaine comme vestige de l'ancienne
          interface) — sa seule fonction réelle (lien externe vers
          amdgeditions.fr) reste disponible via le lien du network-bar du
          Header (partagé, présent sur cette page comme sur toutes) :
          aucune donnée, route ni fonctionnalité liée à amDG Éditions n'est
          supprimée, seule cette section visuelle supplémentaire l'est. */}

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}

