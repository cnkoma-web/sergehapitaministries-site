import type { Metadata } from "next";
import Link from "next/link";
import { getArticlesFeed } from "@/lib/content/articles";
import { getInterfaceTexts } from "@/lib/content/interfaceTexts";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Publications | Serge Hapita Ministries";
const description = "Rosée Matinale, Que Dit la Bible ?, Je Confesse et La Vie Supérieure — quatre formats, un seul message.";
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
  // les catégories : Flux 1 = Que Dit la Bible + La Vie Supérieure.
  // Flux 2 = Rosée Matinale + Je Confesse (Lot 4) du jour, côte à côte —
  // deux autres portes d'entrée dédiées, comme sur l'accueil, pas une
  // liste des jours précédents (l'archive complète de chacune reste sur
  // sa propre page).
  const [qbVs, rmToday, jcToday, texts] = await Promise.all([
    getArticlesFeed(["qdlb", "vs"], page, PER_PAGE),
    getArticlesFeed(["rm"], 1, 1),
    getArticlesFeed(["jc"], 1, 1),
    getInterfaceTexts(),
  ]);
  const todayRosee = rmToday.articles[0] ?? null;
  const todayConfession = jcToday.articles[0] ?? null;
  // Réglage admin (retour du 03/09) — nombre de lignes d'extrait affichées
  // sur les cartes, pas une valeur fixée dans le code.
  const excerptLines = Number(texts["publications.excerpt_lines"]) || 2;

  return (
    // V2 (retour du 11/09, Lot 3) — reproduit prototype-html/publications/
    // index.html § .pub-hero/.feed-section/.daily-reminders + publications.css.
    // Flux et pagination réels inchangés (getArticlesFeed, Pagination) —
    // voir globals.css § .v2-pub-page pour le détail de l'habillage.
    <div className="v2-pub-page">
      {/* Audit Phase B (13/09) — reproduit fidèlement publications/index.html
          § .pub-hero : pas d'eyebrow (absent de la maquette, supprimé),
          grille 2 colonnes (h1 seul à gauche, tuiles de catégories PUIS
          chapô à droite), micro-labels et libellé "Que dit la Bible ?"
          repris mot pour mot de la maquette. */}
      <section className="v2-pub-hero">
        <div className="v2-wrap v2-pub-hero-inner">
          <h1>Publications</h1>
          <div className="v2-pub-hero-side">
            <nav className="v2-pub-hero-links" aria-label="Catégories de publications">
              <Link href="/publications/que-dit-la-bible">
                <small>Examiner</small>
                <strong>Que dit la Bible ?</strong>
              </Link>
              <Link href="/publications/la-vie-superieure">
                <small>Approfondir</small>
                <strong>La Vie Supérieure</strong>
              </Link>
              <Link href="/rosee-matinale">
                <small>Commencer le jour</small>
                <strong>Rosée Matinale</strong>
              </Link>
              <Link href="/publications/je-confesse-et-declare">
                <small>Proclamer</small>
                <strong>Je Confesse</strong>
              </Link>
            </nav>
            <p className="v2-pub-hero-copy">{description}</p>
          </div>
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
          {/* Même correction que les hubs par catégorie (audit Phase B,
              13/09) : pagination masquée s'il n'y a qu'une page. */}
          {qbVs.total > PER_PAGE && (
            <Pagination page={page} perPage={PER_PAGE} total={qbVs.total} basePath="/publications" showPerPageSelector={false} />
          )}
        </div>
      </section>

      {/* Flux 2 — Rosée Matinale + Je Confesse (Lot 4) du jour, côte à côte,
          fond distinct pour qu'on comprenne immédiatement qu'il s'agit d'un
          ensemble différent. Pas de titre de section, pas de liste des
          jours précédents ici (retour du 30/08). Grille à 2 colonnes
          seulement si les deux capsules ont une entrée aujourd'hui — sinon
          la seule présente garde toute la largeur. */}
      {(todayRosee || todayConfession) && (
        <section className="rm-reminder">
          <div className="content-col">
            <div className={todayRosee && todayConfession ? "daily-reminder-grid" : "feed-list"}>
              {todayRosee && <PublicationFeedItem article={todayRosee} excerptLines={excerptLines} />}
              {todayConfession && <PublicationFeedItem article={todayConfession} excerptLines={excerptLines} />}
            </div>
          </div>
        </section>
      )}

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
