import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";

// V2 (11/09, reconstruction complète) — reproduit fidèlement
// prototype-html/publications/que-dit-la-bible/index.html et
// la-vie-superieure/index.html § .category-feed.direct-feed >
// .category-feed-grid > .category-article(.featured), avec
// publications.css § .direct-feed .category-article* (à ne pas confondre
// avec la variante non-"direct-feed" de .category-article, une grille de
// cartes à 2 colonnes qui NE CORRESPOND PAS à ces deux hubs précis —
// erreur trouvée le 11/09 : ces deux pages avaient été construites avec
// l'habillage générique du hub /publications, jamais regardé leur propre
// maquette dédiée). Design à une seule colonne : un premier article "à la
// une" (carte sombre) suivi d'une simple liste bordée, jamais la grille à
// 2 colonnes de .category-article seule.

const CTA_LABEL: Record<"qdlb" | "vs", string> = { qdlb: "Lire la suite", vs: "Découvrir" };
// Longueur d'extrait calibrée sur les exemples réels de la maquette (~1-2
// phrases avant "Lire la suite…"/"Découvrir…") — design à une seule ligne
// de chapeau, pas le réglage "publications.excerpt_lines" du flux général
// (§ PublicationFeedItem), propre à un tout autre gabarit (carte à
// vignette, plusieurs lignes).
const EXCERPT_LENGTH = 190;
const FEATURED_EXCERPT_LENGTH = 230;

function truncateExcerpt(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  const clean = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return { text: clean.trimEnd(), truncated: true };
}

function articleHref(article: Article): string {
  return `/publications/${article.slug}`;
}

function CategoryHubMeta({ article }: { article: Article }) {
  const dateLabel = new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="hub-entry-meta">
      <time dateTime={article.article_date}>{dateLabel}</time>
      <span>
        {article.view_count} vue{article.view_count > 1 ? "s" : ""}
      </span>
    </div>
  );
}

export default function CategoryHubFeed({ articles, type, showFeatured }: { articles: Article[]; type: "qdlb" | "vs"; showFeatured: boolean }) {
  const ctaLabel = CTA_LABEL[type];
  const [first, ...rest] = articles;

  return (
    <div className="category-feed-grid">
      {first && showFeatured && (
        <article className="category-article featured">
          <div>
            <CategoryHubMeta article={first} />
            <h2>
              <Link href={articleHref(first)}>{first.title}</Link>
            </h2>
            <p>
              <Link href={articleHref(first)}>
                {(() => {
                  const raw = (first.excerpt || (first.body ? stripHtml(first.body) : "")).trim();
                  const { text, truncated } = truncateExcerpt(raw, FEATURED_EXCERPT_LENGTH);
                  return (
                    <>
                      {text}
                      {truncated && "…"} <strong>{ctaLabel}</strong>
                    </>
                  );
                })()}
              </Link>
            </p>
          </div>
        </article>
      )}
      {(showFeatured ? rest : articles).map((article) => {
        const raw = (article.excerpt || (article.body ? stripHtml(article.body) : "")).trim();
        const { text, truncated } = truncateExcerpt(raw, EXCERPT_LENGTH);
        return (
          <article className="category-article" key={article.id}>
            <CategoryHubMeta article={article} />
            <h2>
              <Link href={articleHref(article)}>{article.title}</Link>
            </h2>
            <p>
              <Link href={articleHref(article)}>
                {text}
                {truncated && "…"} <strong>{ctaLabel}</strong>
              </Link>
            </p>
          </article>
        );
      })}
    </div>
  );
}
