import type { Metadata } from "next";
import { getArticlesFeed } from "@/lib/content/articles";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Publications | Serge Hapita Ministries";
const description = "Rosée Matinale, Que Dit la Bible ? et La Vie Supérieure — trois formats, un seul message.";
const PER_PAGE = 7; // Règle fixe imposée par le cahier (retour du 30/08) — pas un réglage.

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
  searchParams: Promise<{ page?: string; rmPage?: string }>;
}) {
  const { page: pageParam, rmPage: rmPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const rmPage = Math.max(1, Number(rmPageParam) || 1);

  // Deux flux distincts, l'un après l'autre — pas un flux unique mélangeant
  // les trois catégories (retour explicite du 30/08, corrige la v3) :
  // Flux 1 = Que Dit la Bible + La Vie Supérieure ; Flux 2 = Rosée Matinale.
  const [qbVs, rm] = await Promise.all([
    getArticlesFeed(["qdlb", "vs"], page, PER_PAGE),
    getArticlesFeed(["rm"], rmPage, PER_PAGE),
  ]);

  return (
    <>
      <section className="util-hero pubs-hero">
        <div className="wrap">
          <h1>Publications</h1>
          <p>{description}</p>
        </div>
      </section>

      {/* Flux 1 — Que Dit la Bible + La Vie Supérieure, mélangées
          chronologiquement, chacune sa pastille de catégorie. */}
      <section className="feed-section">
        <div className="pubs-col">
          <div className="section-head">
            <h2>Que Dit la Bible ? &amp; La Vie Supérieure</h2>
          </div>
          {qbVs.articles.length === 0 ? (
            <p className="empty-state">Les premières publications arrivent bientôt.</p>
          ) : (
            <div className="feed-list">
              {qbVs.articles.map((a) => (
                <PublicationFeedItem article={a} key={a.id} />
              ))}
            </div>
          )}
          {qbVs.total > 0 && (
            <Pagination
              page={page}
              perPage={PER_PAGE}
              total={qbVs.total}
              basePath="/publications"
              pageParam="page"
              showPerPageSelector={false}
              extraParams={rmPage > 1 ? { rmPage: String(rmPage) } : undefined}
            />
          )}
        </div>
      </section>

      {/* Flux 2 — Rosée Matinale exclusivement, fond distinct pour qu'on
          comprenne immédiatement qu'il s'agit d'un ensemble différent. Rosée
          Matinale n'apparaît plus dans le flux 1 (retour du 30/08). */}
      {rm.total > 0 && (
        <section className="rm-reminder">
          <div className="pubs-col">
            <div className="section-head">
              <h2>Rosée Matinale</h2>
            </div>
            <div className="feed-list">
              {rm.articles.map((a) => (
                <PublicationFeedItem article={a} key={a.id} />
              ))}
            </div>
            <Pagination
              page={rmPage}
              perPage={PER_PAGE}
              total={rm.total}
              basePath="/publications"
              pageParam="rmPage"
              showPerPageSelector={false}
              extraParams={page > 1 ? { page: String(page) } : undefined}
            />
          </div>
        </section>
      )}

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
