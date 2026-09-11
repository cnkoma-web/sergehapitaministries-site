import type { Metadata } from "next";
import { getArticlesFeed } from "@/lib/content/articles";
import { getInterfaceTexts } from "@/lib/content/interfaceTexts";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "La Vie Supérieure | Serge Hapita Ministries";
const description = "Un enseignement approfondi, réservé aux membres connectés.";
const PER_PAGE = 4; // Règle fixe (retour du 05/09) — 4 par page partout où ce flux apparaît.

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/publications/la-vie-superieure" },
  openGraph: { type: "website", title, description, url: "/publications/la-vie-superieure", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// Hub dédié à une seule catégorie (menu Publications > La Vie Supérieure),
// rétabli après sa disparition — distinct du hub général /publications
// (retour du 30/08).
export default async function LaVieSuperieurePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ articles, total }, texts] = await Promise.all([getArticlesFeed(["vs"], page, PER_PAGE), getInterfaceTexts()]);
  const excerptLines = Number(texts["publications.excerpt_lines"]) || 2;

  return (
    // V2 (retour du 11/09, Lot 3) — même habillage que le hub général (voir
    // globals.css § .v2-pub-page), sans la grille de liens de catégorie
    // (pas de maquette dédiée pour ce hub dans le dossier).
    <div className="v2-pub-page">
      <section className="v2-pub-hero">
        <div className="v2-wrap v2-pub-hero-inner">
          <p className="v2-eyebrow light">
            <span /> Publications
          </p>
          <h1>La Vie Supérieure</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="feed-section">
        <div className="content-col">
          {articles.length === 0 ? (
            <p className="empty-state">Les premiers enseignements arrivent bientôt.</p>
          ) : (
            <div className="feed-list">
              {articles.map((a) => (
                <PublicationFeedItem article={a} excerptLines={excerptLines} key={a.id} />
              ))}
            </div>
          )}
          {total > 0 && (
            <Pagination page={page} perPage={PER_PAGE} total={total} basePath="/publications/la-vie-superieure" showPerPageSelector={false} />
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
