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
// Section "Version audio" du prototype (§ .confession-audio, pointant vers
// /podcast/#je-confesse) volontairement omise pour l'instant : la route
// Podcast n'existe pas encore (Lot 9) — jamais un lien qui mènerait à une
// page inexistante. Le champ podcast_episode_id est déjà préparé sur
// l'article (voir articles.ts) pour ce lot futur.
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
          <h1>
            « {settings.verseText}
            {" "}»
            <cite>{settings.verseReference}</cite>
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
        <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
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

      <section className="section" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
          <LikeButton articleId={current.id} initialCount={current.like_count} mode="public" />
          <div className="rm-nav-days">
            {previous ? <Link href={dayHref(previous.article_date)}>← Jour précédent</Link> : <span className="disabled">← Jour précédent</span>}
            <a href="#archive" className="archive-link">Voir l&apos;archive ↓</a>
            {next ? <Link href={dayHref(next.article_date)}>Jour suivant →</Link> : <span className="disabled">Jour suivant →</span>}
          </div>
        </div>
      </section>

      <section className="share-zone">
        <div className="wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
          <ShareCartouche
            title={current.title}
            url={pageUrl}
            category="jc"
            articleDate={current.article_date}
            excerpt={current.body ? stripHtml(current.body) : undefined}
          />
        </div>
      </section>

      <RelatedArticlesSection articles={relatedArticles} />

      <section className="rm-archive" id="archive">
        <div className="wrap">
          <h2>Confessions précédentes</h2>
          <p className="sub">Retrouve les proclamations des jours précédents.</p>
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
