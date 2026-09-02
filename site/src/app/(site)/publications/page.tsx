import type { Metadata } from "next";
import { getArticlesFeed } from "@/lib/content/articles";
import { getInterfaceTexts } from "@/lib/content/interfaceTexts";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Publications | Serge Hapita Ministries";
const description = "Rosée Matinale, Que Dit la Bible ? et La Vie Supérieure — trois formats, un seul message.";
const PER_PAGE = 4; // Règle fixe (retour du 05/09) — 4 par page partout où ce flux apparaît, y compris l'accueil.

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
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  // Deux flux distincts, l'un après l'autre — pas un flux unique mélangeant
  // les trois catégories : Flux 1 = Que Dit la Bible + La Vie Supérieure.
  // Flux 2 = Rosée Matinale du jour uniquement (retour du 30/08) — une autre
  // porte d'entrée vers Rosée Matinale, comme sur l'accueil, pas une liste
  // des jours précédents (l'archive complète reste sur /rosee-matinale).
  const [qbVs, rmToday, texts] = await Promise.all([
    getArticlesFeed(["qdlb", "vs"], page, PER_PAGE),
    getArticlesFeed(["rm"], 1, 1),
    getInterfaceTexts(),
  ]);
  const todayRosee = rmToday.articles[0] ?? null;
  // Réglage admin (retour du 03/09) — nombre de lignes d'extrait affichées
  // sur les cartes, pas une valeur fixée dans le code.
  const excerptLines = Number(texts["publications.excerpt_lines"]) || 2;

  return (
    <>
      <section className="util-hero pubs-hero">
        <div className="wrap">
          <h1>Publications</h1>
          <p>{description}</p>
        </div>
      </section>

      {/* Flux 1 — Que Dit la Bible + La Vie Supérieure, mélangées
          chronologiquement, chacune sa pastille de catégorie. Pas de titre
          de section (retour du 30/08) : les cartes portent déjà leur badge. */}
      <section className="feed-section">
        <div className="content-col">
          {qbVs.articles.length === 0 ? (
            <p className="empty-state">Les premières publications arrivent bientôt.</p>
          ) : (
            <div className="feed-list">
              {qbVs.articles.map((a) => (
                <PublicationFeedItem article={a} excerptLines={excerptLines} key={a.id} />
              ))}
            </div>
          )}
          {qbVs.total > 0 && (
            <Pagination page={page} perPage={PER_PAGE} total={qbVs.total} basePath="/publications" showPerPageSelector={false} />
          )}
        </div>
      </section>

      {/* Flux 2 — Rosée Matinale du jour, fond distinct pour qu'on comprenne
          immédiatement qu'il s'agit d'un ensemble différent. Pas de titre de
          section, pas de liste des jours précédents ici (retour du 30/08). */}
      {todayRosee && (
        <section className="rm-reminder">
          <div className="content-col">
            <div className="feed-list">
              <PublicationFeedItem article={todayRosee} excerptLines={excerptLines} />
            </div>
          </div>
        </section>
      )}

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
