import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { getJeConfesseSettings } from "@/lib/content/interfaceTexts";
import { extractParagraphs, stripHtml } from "@/lib/richtext";
import ArticleMeta from "@/components/articles/ArticleMeta";
import ShareCartouche from "@/components/articles/ShareCartouche";
import RelatedArticlesSection from "@/components/articles/RelatedArticlesSection";
import LikeButton from "@/components/articles/LikeButton";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import Pagination from "@/components/admin/Pagination";

const SITE_URL = "https://sergehapitaministries.org";
// Même règle que Rosée Matinale (retour du 05/09) — 3 entrées d'archive par page.
export const ARCHIVE_PER_PAGE = 3;

function dayHref(date: string): string {
  return `/publications/je-confesse-et-declare/${date}`;
}

// V2 (Lot 4, 11/09 — corrigé le 11/09 après relecture de la maquette par
// Serge) — reproduit prototype-html/publications/je-confesse-et-declare/
// index.html § .rm-hero.confess-hero/.entry-body-section/.confess-chapeau/
// .like-row/.rm-nav-days/.related-section/.archive-section. Calqué sur
// RoseeMatinaleContent.tsx (même principe : rendu partagé entre la route
// "aujourd'hui" et la route par jour de l'archive).
//
// Correction impérative du 11/09 : le verset d'en-tête (Proverbes 18:20)
// et la signature de clôture (Romains 10:10) sont FIXES pour toute la
// rubrique — réglages globaux (getJeConfesseSettings, interface_texts),
// jamais un champ par proclamation. Seuls varient par proclamation :
// l'image de couverture (affichée en filigrane à 30% d'opacité dans le
// héros, jamais un portrait par défaut) et le corps de la déclaration.
//
// Section "Version audio" (§ .confession-audio, restaurée le 13/09 après
// validation humaine) : /podcast/ (Lot 9) existe désormais — voir le
// commentaire détaillé dans globals.css § .v2-jc-audio. Lien réel vers le
// filtre Podcast/Je Confesse, jamais un lecteur statique factice.
export default async function JeConfesseContent({
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
  const settings = await getJeConfesseSettings();

  return (
    <div className="v2-rm-page v2-jc-page">
      <section className="v2-jc-hero">
        {/* Image propre à cette proclamation, en filigrane (30% d'opacité)
            sous le dégradé — jamais de portrait par défaut si aucune image
            n'a été renseignée dans l'admin. */}
        {current.cover_url && <div className="v2-jc-hero-image" style={{ backgroundImage: `url(${current.cover_url})` }} aria-hidden="true" />}
        <div className="v2-wrap v2-jc-hero-copy">
          {/* Espace insécable avant le guillemet fermant (même règle
              typographique française que verse-box/further-verse dans
              publications/[slug]/page.tsx) — ce guillemet est ajouté par ce
              gabarit, pas tapé par Serge, jamais nbspBeforeClosingGuillemet
              ici (elle ne traite qu'un " »" déjà présent dans le texte,
              pas un guillemet ajouté séparément juste après). */}
          <p className="v2-jc-hero-intro">Parce qu&apos;il est écrit :</p>
          <h1>
            « {settings.verseText}
            {" "}» <cite>{settings.verseReference}</cite>
          </h1>
          <div className="v2-jc-hero-context">
            <span className="v2-jc-badge">Je Confesse</span>
            <time className="v2-jc-date">
              {new Date(current.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </time>
            <ArticleMeta viewCount={current.view_count} readingTimeMinutes={current.reading_time_minutes} />
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 88, paddingBottom: 0 }}>
        {/* Reprise Phase B renforcée (13/09) : var(--content-col) vaut
            695px, pensé pour la colonne de lecture des pages article — la
            maquette de CETTE page (.entry-body) est en réalité
            width:min(790px,calc(100% - 48px)), SANS le padding de .wrap
            (0 28px) qui réduisait encore la largeur utile. Classe "wrap"
            retirée ici (elle ajoutait un padding que .entry-body n'a pas
            dans la maquette), largeur/centrage portés par le style inline
            seul. */}
        <div style={{ maxWidth: "min(790px, calc(100% - 48px))", margin: "0 auto" }}>
          {paragraphs.map((html, i) => (
            <div key={i} className="v2-jc-body-html" dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </div>
      </section>

      {/* Signature de clôture fixe — voir le commentaire en tête de
          fichier : jamais éditée par proclamation, réglage global. */}
      <section className="v2-jc-chapeau">
        <blockquote>
          {settings.signatureText}
          <cite>{settings.signatureReference}</cite>
        </blockquote>
      </section>

      {/* padding (recontrôle validation humaine, 13/09) : la maquette
          combine .entry-body-section (padding:88px 0 34px) ET
          .confession-actions-section (padding-top:0) sur cette même
          section — soit padding-top:0/padding-bottom:34px, pas 32/24
          (valeurs approximatives jamais mesurées contre la maquette). Ce
          padding-top:0 fait que le like-block touche exactement le bas du
          chapeau, sans le moindre espace blanc entre les deux — voir
          .v2-jc-page .like-block ci-dessous pour la suite de ce même
          écart (bordure "flottante" dans l'espace blanc). */}
      <section className="section" style={{ paddingTop: 0, paddingBottom: 34 }}>
        {/* Même correction que ci-dessus (largeur réelle .entry-body,
            sans le padding de .wrap). */}
        <div style={{ maxWidth: "min(790px, calc(100% - 48px))", margin: "0 auto" }}>
          <LikeButton articleId={current.id} initialCount={current.like_count} mode="public" />
          {/* Libellés (recontrôle validation humaine, 13/09) :
              prototype-html/publications/je-confesse-et-declare/index.html
              § .rm-nav-days écrit littéralement "← Précédent" / "Voir les
              archives" / "Suivant →" — pas "Jour précédent"/"Voir
              l'archive ↓"/"Jour suivant →" (formulation reprise à tort de
              Rosée Matinale par analogie lors de la construction Lot 4,
              jamais comparée mot pour mot à la maquette propre à cette
              page). Bloc JSX propre à Je Confesse (pas un composant
              partagé) : aucun impact sur Rosée Matinale, qui reste
              intouchable ce tour-ci. */}
          <div className="rm-nav-days">
            {previous ? <Link href={dayHref(previous.article_date)}>← Précédent</Link> : <span className="disabled">← Précédent</span>}
            <a href="#archive" className="archive-link">Voir les archives</a>
            {next ? <Link href={dayHref(next.article_date)}>Suivant →</Link> : <span className="disabled">Suivant →</span>}
          </div>
        </div>
      </section>

      <section className="v2-jc-audio" aria-label="Version audio de la proclamation">
        <div className="v2-wrap v2-jc-audio-inner">
          <span className="v2-jc-audio-icon" aria-hidden="true">▶</span>
          <div>
            <p>Version audio</p>
            <h2>Écouter cette proclamation</h2>
            <span>Retrouve cette proclamation dans la série Je Confesse.</span>
          </div>
          <Link href="/podcast?univers=jc">Découvrir la série →</Link>
        </div>
      </section>

      <section className="share-zone">
        {/* Reprise Phase B renforcée (13/09) : même correction que Rosée
            Matinale — la vraie largeur maquette (.entry-body/.share-inner)
            est 790px, pas 695px (var(--content-col), pensée pour les
            pages article). */}
        <div className="wrap" style={{ maxWidth: "min(790px, calc(100% - 48px))", margin: "0 auto" }}>
          <ShareCartouche
            title={current.title}
            url={pageUrl}
            category="jc"
            articleDate={current.article_date}
            excerpt={current.body ? stripHtml(current.body) : undefined}
          />
        </div>
      </section>

      <RelatedArticlesSection articles={relatedArticles} includeWeekday />

      <section className="rm-archive" id="archive">
        <div className="wrap">
          <h2>Confessions précédentes</h2>
          {/* "confessions", pas "proclamations" (recontrôle validation
              humaine, 13/09) : § .confession-archive .archive-intro de la
              maquette écrit littéralement "Retrouve les confessions des
              jours précédents." — la maquette elle-même n'est pas
              cohérente d'une section à l'autre (.confession-audio emploie
              "proclamation"), mais reste la source de vérité section par
              section, jamais harmonisée par nous-mêmes. */}
          <p className="sub">Retrouve les confessions des jours précédents.</p>
          {archive.length === 0 ? (
            <p className="rm-empty">Ceci est la toute première proclamation publiée — l&apos;archive se remplira à partir de demain.</p>
          ) : (
            <>
              <div className="rm-list">
                {archivePaged.map((entry) => (
                  <Link href={dayHref(entry.article_date)} className="rm-item" key={entry.id}>
                    <div className="date">{new Date(entry.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</div>
                    <div className="excerpt">{stripHtml(entry.body ?? "").slice(0, 140)}</div>
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

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
