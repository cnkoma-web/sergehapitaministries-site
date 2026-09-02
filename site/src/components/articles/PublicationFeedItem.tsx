import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { ARTICLE_TYPE_INITIALS, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";

// Libellé du bouton selon la catégorie, propre aux hubs (retour du 04/09) —
// distinct des libellés de l'accueil ("Lire →"/"Découvrir →", inchangés).
const CTA_LABEL: Record<Article["type"], string> = { qdlb: "Lire la suite", vs: "Découvrir", rm: "Lire la suite" };

// Une entrée d'un flux de publications (hub Publications, hubs par
// catégorie) — vignette, badge + catégorie + date + vues sur une même
// ligne, titre, chapeau. Rosée Matinale pointe vers sa page dédiée avec le
// bon jour (§3.2), les autres vers /publications/[slug].
//
// Trois liens distincts (vignette, titre, chapeau) plutôt qu'une seule
// carte entièrement cliquable (retour du 03/09) : le survol ne doit
// déclencher le lien que sur ces trois zones précises — pas sur les
// métadonnées (badge, date, vues) ni sur les espaces vides de la carte.
//
// Retour du 04/09 : catégorie et date reviennent sur la même ligne (avec un
// espacement net entre les deux, pas collées), vues en violet, date au
// format complet en toutes lettres — identique à la page article. Le lien
// "Lire la suite"/"Découvrir" ne doit jamais retourner à la ligne.
// excerptLines contrôle le nombre de lignes de l'extrait — réglage admin
// (interface_texts "publications.excerpt_lines"), pas une valeur fixée ici.
export default function PublicationFeedItem({ article, excerptLines }: { article: Article; excerptLines: number }) {
  const href = article.type === "rm" ? `/rosee-matinale?date=${article.article_date}` : `/publications/${article.slug}`;
  const excerpt = article.excerpt || (article.body ? stripHtml(article.body).slice(0, 140) + "…" : article.verse_text || "");
  const dateLabel = new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

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
        <div className="feed-meta">
          <span className={`feed-badge ${article.type}`}>{ARTICLE_TYPE_INITIALS[article.type]}</span>
          <span className="feed-cat-label">{ARTICLE_TYPE_LABEL[article.type]}</span>
          <span className="feed-date">{dateLabel}</span>
          <span className="feed-views">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {article.view_count} vue{article.view_count > 1 ? "s" : ""}
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
