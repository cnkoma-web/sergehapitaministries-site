import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { extractParagraphs } from "@/lib/richtext";
import ArticleMeta from "@/components/articles/ArticleMeta";
import ShareCartouche from "@/components/articles/ShareCartouche";
import RelatedArticlesSection from "@/components/articles/RelatedArticlesSection";
import LikeButton from "@/components/articles/LikeButton";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import Pagination from "@/components/admin/Pagination";

const SITE_URL = "https://sergehapitaministries.org";
// Règle fixe (retour du 05/09) — 3 entrées d'archive par page.
export const ARCHIVE_PER_PAGE = 3;

// Une vraie URL par jour (retour du 05/09, restructuration) — remplace
// l'ancien "?date=" pour que l'image de partage générée (opengraph-image.tsx)
// puisse enfin refléter le jour précis choisi, pas toujours celui du jour
// courant : un fichier spécial Next.js ne reçoit que les segments de route
// (params), jamais la query string. Tous les liens internes vers un autre
// jour (précédent/suivant/archive) passent par cette fonction, jamais par un
// "?date=" reconstruit à la main.
function dayHref(date: string): string {
  return `/rosee-matinale/${date}`;
}

// Rendu partagé entre /rosee-matinale (toujours "aujourd'hui", URL fixe et
// permanente) et /rosee-matinale/[date] (un jour précis de l'archive) — les
// deux affichent la même chose, seule la façon de déterminer "current"
// diffère selon la route appelante.
export default function RoseeMatinaleContent({
  current,
  previous,
  next,
  archive,
  archivePageNum,
  basePath,
  relatedArticles,
}: {
  current: Article;
  previous: Article | null;
  next: Article | null;
  archive: Article[];
  archivePageNum: number;
  basePath: string;
  relatedArticles: Article[];
}) {
  const pageUrl = `${SITE_URL}${dayHref(current.article_date)}`;
  const paragraphs = extractParagraphs(current.body || "");
  const archivePaged = archive.slice((archivePageNum - 1) * ARCHIVE_PER_PAGE, archivePageNum * ARCHIVE_PER_PAGE);

  return (
    // V2 (retour du 11/09, Lot 3) — reproduit prototype-html/rosee-matinale/
    // index.html § .rm-hero/.rm-chapeau/.entry-body-section/.rm-nav-days/
    // .related-section/.archive-section (voir globals.css § .v2-rm-page).
    // "Poursuivre la lecture" (.rm-explore) n'a pas d'équivalent dans le
    // prototype (voir le commentaire détaillé dans globals.css).
    <div className="v2-rm-page">
      <section
        className="rm-photo-hero"
        style={{ backgroundImage: `url(${current.cover_url || "/rosee-matinale-hero.jpg"})` }}
        role={current.cover_url ? "img" : undefined}
        aria-label={current.cover_url ? current.cover_alt ?? undefined : undefined}
      >
        <div className="wrap">
          {/* Titre de l'entrée du jour en premier (retour du 07/09, 3e
              passage — inverse l'ordre du passage précédent) — distinct du
              libellé de catégorie ci-dessous (qui reste "Rosée Matinale",
              fixe) : le nouveau champ "Titre", rempli au cas par cas par
              Serge dans l'admin (repli automatique sur le même texte que la
              date ci-dessous s'il ne l'a pas encore renseigné pour cette
              entrée — voir l'écran d'édition). */}
          <h1 className="entry-title">{current.title}</h1>
          <div className="cat">Rosée Matinale</div>
          <div className="date">
            {new Date(current.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <ArticleMeta viewCount={current.view_count} readingTimeMinutes={current.reading_time_minutes} />
        </div>
      </section>

      {current.verse_text && (
        <section className="rm-quote-zone">
          <div className="wrap">
            <div className="rm-quote-wrap">
              <div className="rm-quote-mark">&quot;</div>
              <p className="rm-quote-text">{current.verse_text}</p>
            </div>
          </div>
        </section>
      )}

      {/* Padding resserré (retour du 30/08) : le .section générique (88px)
          créait un vide trop marqué avec le chapeau au-dessus et l'archive
          en dessous. */}
      <section className="section" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
          {/* Classe "rm-body-html" (retour du 07/09) — sans elle, une
              "citation mise en exergue" insérée dans le corps ne recevait
              aucun style particulier ici (violet, italique, centrée,
              taille agrandie) : cette page n'a jamais eu l'équivalent de
              ".body-html" utilisé par Que Dit la Bible/La Vie Supérieure
              pour cibler ce même bloc en CSS (voir globals.css).
              Ancien style inline (fontSize 16.5/lineHeight 1.85) retiré
              (retour du 11/09, audit typographique) — un style inline
              gagne toujours sur la règle CSS externe .rm-body-html (19px/
              1.9, exact prototype-html § .entry-body > p), qu'il rendait
              inopérante en silence. */}
          {paragraphs.map((html, i) => (
            <div
              key={i}
              className="rm-body-html"
              style={{ marginBottom: 20 }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ))}

          {/* Bouton "J'aime" (retour du 05/09) — juste après le corps du
              texte. Accessible à tout le monde, sans compte (Rosée Matinale
              reste public). */}
          <LikeButton articleId={current.id} initialCount={current.like_count} mode="public" />

          {/* Navigation ramenée dans la zone blanche du texte (retour du
              07/09, 2e passage — annule le regroupement du passage
              précédent) : reste avec son propre trait de séparation, pas
              dans la bande de partage colorée juste en dessous. */}
          <div className="rm-nav-days">
            {previous ? (
              <Link href={dayHref(previous.article_date)}>← Jour précédent</Link>
            ) : (
              <span className="disabled">← Jour précédent</span>
            )}
            <a href="#archive" className="archive-link">Voir l&apos;archive ↓</a>
            {next ? (
              <Link href={dayHref(next.article_date)}>Jour suivant →</Link>
            ) : (
              <span className="disabled">Jour suivant →</span>
            )}
          </div>
        </div>
      </section>

      {/* Bande de partage --purple pleine (retour du 07/09, 2e passage) —
          couleur exacte demandée, plus --lavender-deep. */}
      <section className="share-zone">
        <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
          {/* current.title (retour du 07/09, 3e passage) — remplace un titre
              reconstruit ici même depuis la date, en double-emploi maladroit
              avec le vrai champ "Titre" de l'entrée (voir l'écran d'édition
              Rosée Matinale) : celui-ci reflète désormais un titre choisi
              par Serge, pas seulement son repli automatique. */}
          <ShareCartouche
            title={current.title}
            url={pageUrl}
            category="rm"
            articleDate={current.article_date}
            excerpt={current.verse_text ?? undefined}
          />
        </div>
      </section>

      {/* "Autres articles similaires" (retour du 07/09) — composant partagé
          avec Que Dit la Bible / La Vie Supérieure, jamais reconstruit ici.
          Toujours Que Dit la Bible / La Vie Supérieure, jamais d'autre
          entrée Rosée Matinale (voir getLatestNonRoseeArticles). Fond
          --lavender pâle (.related-articles), juste après la zone de
          partage --lavender-deep ci-dessus (2e passage, 07/09) — les deux
          teintes de lavande restent bien distinctes l'une de l'autre. */}
      <RelatedArticlesSection articles={relatedArticles} />

      <section className="rm-archive" id="archive">
        <div className="wrap">
          <h2>Rosées matinales précédentes</h2>
          <p className="sub">Chaque jour, une nouvelle pensée s&apos;ajoute à cette liste.</p>
          {archive.length === 0 ? (
            <p className="rm-empty">Ceci est la toute première pensée publiée — l&apos;archive se remplira à partir de demain.</p>
          ) : (
            <>
              <div className="rm-list">
                {archivePaged.map((entry) => (
                  <Link href={dayHref(entry.article_date)} className="rm-item" key={entry.id}>
                    <div className="date">
                      {new Date(entry.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                    <div className="excerpt">{entry.verse_text}</div>
                  </Link>
                ))}
              </div>
              <Pagination
                page={archivePageNum}
                perPage={ARCHIVE_PER_PAGE}
                total={archive.length}
                basePath={basePath}
                pageParam="archivePage"
                perPageParam="archivePerPage"
                showPerPageSelector={false}
              />
            </>
          )}
        </div>
      </section>

      <section className="rm-explore">
        <div className="wrap">
          <h2>Poursuivre la lecture</h2>
          <div className="explore-grid">
            <div className="explore-card">
              <div className="icon">QB</div>
              <h3>Que Dit la Bible ?</h3>
              <p>Un enseignement structuré, verset par verset.</p>
              <Link href="/publications/que-dit-la-bible">Découvrir →</Link>
            </div>
            <div className="explore-card">
              <div className="icon">VS</div>
              <h3>La Vie Supérieure</h3>
              <p>Un enseignement approfondi, pour aller plus loin.</p>
              <Link href="/publications/la-vie-superieure">Découvrir →</Link>
            </div>
            <div className="explore-card">
              <div className="icon">L</div>
              <h3>Les livres</h3>
              <p>Les ouvrages publiés sous amDG Éditions.</p>
              <Link href="/livres">Découvrir →</Link>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
