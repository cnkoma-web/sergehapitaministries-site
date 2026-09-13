import type { Metadata } from "next";
import { getArticlesFeed } from "@/lib/content/articles";
import CategoryHubFeed from "@/components/articles/CategoryHubFeed";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "La Vie Supérieure | Serge Hapita Ministries";
const description = "Des enseignements approfondis consacrés à la nouvelle création, la vie de Dieu, la justice, l'identité en Christ, la connaissance spirituelle, la sagesse et l'œuvre du Saint-Esprit.";
const motto = "Une connaissance destinée à devenir l'expérience de la vie en Christ.";
const PER_PAGE = 4; // Règle fixe (retour du 05/09) — 4 par page partout où ce flux apparaît.

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/publications/la-vie-superieure" },
  openGraph: { type: "website", title, description, url: "/publications/la-vie-superieure", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (11/09, reconstruction complète) — reproduit fidèlement
// prototype-html/publications/la-vie-superieure/index.html §
// .category-hero.life (dégradé encre→violet, "02" en filigrane, badge +
// accroche .category-motto propres à cette rubrique — absents du hub Que
// Dit la Bible) + .category-feed.direct-feed. Même correction que le hub
// Que Dit la Bible (voir son commentaire) : habillage générique remplacé
// par la vraie maquette de CETTE page précise.
export default async function LaVieSuperieurePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const { articles, total } = await getArticlesFeed(["vs"], page, PER_PAGE);

  return (
    <div className="v2-category-hub-page">
      <section className="v2-category-hub-hero life">
        <div className="v2-wrap v2-category-hub-hero-inner">
          <div className="v2-category-hub-mark">02</div>
          <div>
            <span className="v2-category-hub-badge">La Vie Supérieure</span>
            <h1>Les réalités de la vie en Christ</h1>
            <p>{description}</p>
            <p className="v2-category-hub-motto">{motto}</p>
          </div>
        </div>
      </section>

      <section className="v2-category-hub-feed">
        <div className="v2-wrap">
          {articles.length === 0 ? (
            <p className="empty-state">Les premiers enseignements arrivent bientôt.</p>
          ) : (
            <CategoryHubFeed articles={articles} type="vs" showFeatured={page === 1} />
          )}
          {/* Bug réel corrigé (audit Phase B, 13/09) : la pagination
              s'affichait même sur une seule page (2 articles < PER_PAGE),
              alors que la maquette (2 articles ici) n'a AUCUNE pagination —
              contrairement à Que dit la Bible (6 articles, 2 pages), qui
              en a une. Condition alignée sur "plus d'une page nécessaire",
              jamais sur la seule présence de contenu. */}
          {total > PER_PAGE && (
            <div className="v2-category-hub-pagination">
              <Pagination page={page} perPage={PER_PAGE} total={total} basePath="/publications/la-vie-superieure" showPerPageSelector={false} />
            </div>
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
