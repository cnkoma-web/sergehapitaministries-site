import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { ARTICLE_TYPE_INITIALS, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { formatPublicationDateTime } from "@/lib/format";
import { stripHtml } from "@/lib/richtext";

// Une entrée du flux unifié Publications (cahier §6.5) et du rappel Rosée
// Matinale (v3 §6.10.2) — même format de carte pour les deux : vignette,
// badge de catégorie, titre, date + heure, chapeau. Rosée Matinale pointe
// vers sa page dédiée avec le bon jour (§3.2), les autres vers /publications/[slug].
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
        </div>
        <h3>{article.title}</h3>
        {excerpt && <p className="excerpt">{excerpt}</p>}
      </div>
    </Link>
  );
}
