import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { ARTICLE_TYPE_INITIALS, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { formatPublicationDateTime } from "@/lib/format";
import { stripHtml } from "@/lib/richtext";

// Libellé du bouton selon la catégorie (retour du 03/09) — généralisé depuis
// le teaser de l'accueil, mêmes libellés exacts.
const CTA_LABEL: Record<Article["type"], string> = { qdlb: "Lire →", vs: "Découvrir →", rm: "Lire →" };

// Une entrée d'un flux de publications (hub Publications, hubs par
// catégorie) — vignette, badge de catégorie, titre, date + heure, vues,
// chapeau. Rosée Matinale pointe vers sa page dédiée avec le bon jour
// (§3.2), les autres vers /publications/[slug].
//
// Trois liens distincts (vignette, titre, chapeau) plutôt qu'une seule
// carte entièrement cliquable (retour du 03/09) : le survol ne doit
// déclencher le lien que sur ces trois zones précises — pas sur les
// métadonnées (badge, date, vues) ni sur les espaces vides de la carte.
//
// Ordre imposé, sans exception (retour du 03/09) : 1) catégorie seule,
// 2) date + heure + vues, 3) titre, 4) extrait. excerptLines contrôle le
// nombre de lignes de l'extrait affiché — réglage admin, pas une valeur
// fixée dans le composant (voir interface_texts "publications.excerpt_lines").
export default function PublicationFeedItem({ article, excerptLines }: { article: Article; excerptLines: number }) {
  const href = article.type === "rm" ? `/rosee-matinale?date=${article.article_date}` : `/publications/${article.slug}`;
  const excerpt = article.excerpt || (article.body ? stripHtml(article.body).slice(0, 140) + "…" : article.verse_text || "");

  return (
    <div className="feed-item">
      {article.cover_url ? (
        <Link href={href} className="feed-thumb-link" aria-label={article.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover_url} alt={article.cover_alt || article.title} className="feed-thumb" />
        </Link>
      ) : (
        <Link href={href} className="feed-thumb-link" aria-label={article.title}>
          <div className="feed-thumb" aria-hidden="true" />
        </Link>
      )}
      <div className="feed-body">
        <div className="feed-cat-row">
          <span className={`feed-badge ${article.type}`}>{ARTICLE_TYPE_INITIALS[article.type]}</span>
          <span className="feed-cat-label">{ARTICLE_TYPE_LABEL[article.type]}</span>
        </div>
        <div className="feed-info-row">
          <span className="feed-date">{formatPublicationDateTime(article.article_date, article.created_at)}</span>
          <span className="feed-views">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {article.view_count}
          </span>
        </div>
        <h3>
          <Link href={href}>{article.title}</Link>
        </h3>
        {excerpt && (
          <p className="excerpt" style={{ WebkitLineClamp: excerptLines }}>
            <Link href={href}>{excerpt}</Link>
          </p>
        )}
        <Link href={href} className="feed-cta">{CTA_LABEL[article.type]}</Link>
      </div>
    </div>
  );
}
