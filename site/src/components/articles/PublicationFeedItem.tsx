import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { ARTICLE_TYPE_INITIALS, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { formatPublicationDateTime } from "@/lib/format";
import { stripHtml } from "@/lib/richtext";

// Une entrée d'un flux de publications (hub Publications, hubs par
// catégorie) — vignette, badge de catégorie, titre, date + heure, vues,
// chapeau. Rosée Matinale pointe vers sa page dédiée avec le bon jour
// (§3.2), les autres vers /publications/[slug].
export default function PublicationFeedItem({ article }: { article: Article }) {
  const href = article.type === "rm" ? `/rosee-matinale?date=${article.article_date}` : `/publications/${article.slug}`;
  const excerpt = article.excerpt || (article.body ? stripHtml(article.body).slice(0, 140) + "…" : article.verse_text || "");

  return (
    <Link href={href} className="feed-item">
      {article.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.cover_url} alt={article.cover_alt || article.title} className="feed-thumb" />
      ) : (
        <div className="feed-thumb" aria-hidden="true" />
      )}
      <div className="feed-body">
        <div className="feed-meta">
          <span className={`feed-badge ${article.type}`}>{ARTICLE_TYPE_INITIALS[article.type]}</span>
          <span className="feed-date">{ARTICLE_TYPE_LABEL[article.type]} · {formatPublicationDateTime(article.article_date, article.created_at)}</span>
          <span className="feed-views">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {article.view_count}
          </span>
        </div>
        <h3>{article.title}</h3>
        {excerpt && <p className="excerpt">{excerpt}</p>}
      </div>
    </Link>
  );
}
