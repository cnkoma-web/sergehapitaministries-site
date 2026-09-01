import type { Metadata } from "next";
import { getArticlesFeed } from "@/lib/content/articles";
import { getInterfaceTexts } from "@/lib/content/interfaceTexts";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Que Dit la Bible ? | Serge Hapita Ministries";
const description = "Une exhortation structurée : verset clé, enseignement, confession et application concrète.";
const PER_PAGE = 7;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/publications/que-dit-la-bible" },
  openGraph: { type: "website", title, description, url: "/publications/que-dit-la-bible", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// Hub dédié à une seule catégorie (menu Publications > Que Dit la Bible),
// rétabli après sa disparition — distinct du hub général /publications
// (retour du 30/08).
export default async function QueDitLaBiblePage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const [{ articles, total }, texts] = await Promise.all([getArticlesFeed(["qdlb"], page, PER_PAGE), getInterfaceTexts()]);
  const excerptLines = Number(texts["publications.excerpt_lines"]) || 2;

  return (
    <>
      <section className="util-hero pubs-hero">
        <div className="wrap">
          <h1>Que Dit la Bible ?</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="feed-section">
        <div className="content-col">
          {articles.length === 0 ? (
            <p className="empty-state">Les premiers articles arrivent bientôt.</p>
          ) : (
            <div className="feed-list">
              {articles.map((a) => (
                <PublicationFeedItem article={a} excerptLines={excerptLines} key={a.id} />
              ))}
            </div>
          )}
          {total > 0 && (
            <Pagination page={page} perPage={PER_PAGE} total={total} basePath="/publications/que-dit-la-bible" showPerPageSelector={false} />
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
