import type { Metadata } from "next";
import { getArticlesFeed } from "@/lib/content/articles";
import CategoryHubFeed from "@/components/articles/CategoryHubFeed";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Que dit la Bible ? | Serge Hapita Ministries";
const description = "Un examen quotidien des Écritures, dont le contenu et la puissance permettent de construire la véritable image de Dieu dans la vie de ceux qui nous suivent.";
const PER_PAGE = 4; // Règle fixe (retour du 05/09) — 4 par page partout où ce flux apparaît.

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/publications/que-dit-la-bible" },
  openGraph: { type: "website", title, description, url: "/publications/que-dit-la-bible", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (11/09, reconstruction complète) — reproduit fidèlement
// prototype-html/publications/que-dit-la-bible/index.html § .category-hero
// (fond encre, "01" en filigrane) + .category-feed.direct-feed (voir
// src/components/articles/CategoryHubFeed.tsx pour le détail du choix de
// gabarit). Corrige l'écart signalé par Serge le 11/09 : cette page avait
// été construite avec l'habillage générique du hub /publications (voir
// globals.css § .v2-pub-page), sans avoir regardé sa propre maquette,
// pourtant bien distincte (héros avec numéro de rubrique, flux à une
// colonne avec article "à la une").
export default async function QueDitLaBiblePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { articles, total } = await getArticlesFeed(["qdlb"], page, PER_PAGE);

  return (
    <div className="v2-category-hub-page">
      <section className="v2-category-hub-hero">
        <div className="v2-wrap v2-category-hub-hero-inner">
          <div className="v2-category-hub-mark">01</div>
          <div>
            <h1>Que dit la Bible ?</h1>
            <p>{description}</p>
          </div>
        </div>
      </section>

      <section className="v2-category-hub-feed">
        <div className="v2-wrap">
          {articles.length === 0 ? (
            <p className="empty-state">Les premiers articles arrivent bientôt.</p>
          ) : (
            <CategoryHubFeed articles={articles} type="qdlb" showFeatured={page === 1} />
          )}
          {/* Même correction que La Vie Supérieure (audit Phase B, 13/09) :
              pagination masquée s'il n'y a qu'une page, par cohérence — sans
              effet visible ici tant qu'il y a plus de PER_PAGE articles. */}
          {total > PER_PAGE && (
            <div className="v2-category-hub-pagination">
              <Pagination page={page} perPage={PER_PAGE} total={total} basePath="/publications/que-dit-la-bible" showPerPageSelector={false} />
            </div>
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
