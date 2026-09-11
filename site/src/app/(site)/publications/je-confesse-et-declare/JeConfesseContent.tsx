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
// Même règle que Rosée Matinale (retour du 05/09) — 3 entrées d'archive par page.
export const ARCHIVE_PER_PAGE = 3;

function dayHref(date: string): string {
  return `/publications/je-confesse-et-declare/${date}`;
}

// V2 (Lot 4, 11/09) — reproduit prototype-html/publications/
// je-confesse-et-declare/index.html § .rm-hero.confess-hero/.entry-body-
// section/.confess-chapeau/.like-row/.rm-nav-days/.related-section/
// .archive-section. Calqué sur RoseeMatinaleContent.tsx (même principe :
// rendu partagé entre la route "aujourd'hui" et la route par jour de
// l'archive), avec les différences volontaires du cahier : pas de titre
// éditorial (le verset + sa référence tiennent lieu de h1, jamais
// current.title ici), pas de photo de fond (dégradé, comme le prototype),
// une citation de clôture fixe (Romains 10:10, jamais éditée par Serge —
// aucune entrée du dossier ne suggère qu'elle varie d'un jour à l'autre).
//
// Section "Version audio" du prototype (§ .confession-audio, pointant vers
// /podcast/#je-confesse) volontairement omise pour l'instant : la route
// Podcast n'existe pas encore (Lot 9) — jamais un lien qui mènerait à une
// page inexistante. Le champ podcast_episode_id est déjà préparé sur
// l'article (voir articles.ts) pour ce lot futur.
export default function JeConfesseContent({
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
    <div className="v2-rm-page v2-jc-page">
      <section className="v2-jc-hero">
        <div className="v2-wrap v2-jc-hero-copy">
          {/* Espace insécable avant le guillemet fermant (même règle
              typographique française que verse-box/further-verse dans
              publications/[slug]/page.tsx) — ce guillemet est ajouté par ce
              gabarit, pas tapé par Serge, jamais nbspBeforeClosingGuillemet
              ici (elle ne traite qu'un " »" déjà présent dans le texte,
              pas un guillemet ajouté séparément juste après). */}
          <h1>
            « {current.verse_text}
            {" "}»
            {current.verse_reference && <cite>{current.verse_reference}</cite>}
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
            <div key={i} className="rm-body-html" style={{ fontSize: 16.5, lineHeight: 1.85, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </div>
      </section>

      {/* Citation de clôture fixe (Romains 10:10) — voir le commentaire en
          tête de fichier : jamais éditée par Serge, identique sur toutes
          les entrées. */}
      <section className="v2-jc-chapeau">
        <blockquote>
          Ayez l&apos;audace de dire les mêmes choses que Dieu a dites à votre sujet dans sa Parole. C&apos;est ce qui
          vous fait jouir des bienfaits du salut. C&apos;est en confessant de la bouche ce que l&apos;on croit du
          cœur que l&apos;on parvient au salut.
          <cite>Romains 10:10</cite>
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
          <ShareCartouche title={current.title} url={pageUrl} category="jc" articleDate={current.article_date} excerpt={current.verse_text ?? undefined} />
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

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
