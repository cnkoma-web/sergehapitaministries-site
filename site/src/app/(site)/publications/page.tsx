import type { Metadata } from "next";
import { getPublicationsFeed, getLatestRosee } from "@/lib/content/articles";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Publications | Serge Hapita Ministries";
const description = "Rosée Matinale, Que Dit la Bible ? et La Vie Supérieure — trois formats, un seul message.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/publications" },
  openGraph: { type: "website", title, description, url: "/publications", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function PublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const [{ articles, total }, latestRosee] = await Promise.all([
    getPublicationsFeed(page, perPage),
    getLatestRosee(3),
  ]);

  return (
    <>
      <section className="util-hero pubs-hero">
        <div className="wrap">
          <h1>Publications</h1>
          <p>{description}</p>
        </div>
      </section>

      {/* Flux unifié — toutes catégories mélangées, triées du plus récent au
          plus ancien, chacune avec sa seule pastille de catégorie (cahier
          §6.5) : plus de gros blocs séparés par catégorie. */}
      <section className="feed-section">
        <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
          {articles.length === 0 ? (
            <p className="empty-state">Les premières publications arrivent bientôt.</p>
          ) : (
            <div className="feed-list">
              {articles.map((a) => (
                <PublicationFeedItem article={a} key={a.id} />
              ))}
            </div>
          )}
          {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/publications" />}
        </div>
      </section>

      {/* Rappel Rosée Matinale — fond de couleur différent, mêmes cartes que
          le flux principal (v3 §6.10 point 2) : Rosée Matinale apparaît déjà
          dans le flux ci-dessus, ceci est un rappel en plus, pas un remplacement. */}
      {latestRosee.length > 0 && (
        <section className="rm-reminder">
          <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
            <div className="section-head">
              <h2>Rosée Matinale</h2>
            </div>
            <div className="feed-list">
              {latestRosee.map((a) => (
                <PublicationFeedItem article={a} key={a.id} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
