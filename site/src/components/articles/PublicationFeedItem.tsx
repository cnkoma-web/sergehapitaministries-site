import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { ARTICLE_TYPE_INITIALS, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";

// Libellé du bouton selon la catégorie, propre aux hubs (retour du 04/09).
const CTA_LABEL: Record<Article["type"], string> = { qdlb: "Lire la suite", vs: "Découvrir", rm: "Lire la suite" };
// Libellés historiques de l'accueil (retour du 03/09), conservés tels quels
// (retour du 05/09) : le passage de l'accueil à un flux unique change la
// structure de la liste, pas ce texte de bouton déjà tranché séparément.
const HOME_CTA_LABEL: Record<Article["type"], string> = { qdlb: "Lire →", vs: "Découvrir →", rm: "Lire →" };

// Nombre moyen de caractères par ligne d'extrait à ~15px sur la largeur
// réelle de .feed-body (retour du 05/09, point 6) — sert à couper le
// chapeau nous-mêmes, en code, à une longueur fixe, plutôt que de compter
// sur -webkit-line-clamp : le lien "Lire la suite" doit être physiquement
// à l'intérieur du même bloc de texte que le chapeau tronqué (jamais un
// élément séparé positionné en dessous), donc c'est le code qui doit
// garantir qu'il reste de la place, pas Serge en tapant son texte.
const CHARS_PER_LINE = 62;

// Coupe au dernier espace avant la limite (jamais au milieu d'un mot) et ne
// touche pas au texte si il tient déjà dans la limite.
function truncateExcerpt(text: string, maxChars: number): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false };
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  const clean = lastSpace > maxChars * 0.6 ? cut.slice(0, lastSpace) : cut;
  return { text: clean.trimEnd(), truncated: true };
}

// Une entrée d'un flux de publications (hub Publications, hubs par
// catégorie, et depuis le 05/09 le flux unique de l'accueil) — vignette,
// badge + catégorie + date + vues, titre, chapeau. Rosée Matinale pointe
// vers sa page dédiée avec le bon jour (§3.2), les autres vers
// /publications/[slug].
//
// Trois liens distincts (vignette, titre, chapeau) plutôt qu'une seule
// carte entièrement cliquable (retour du 03/09) : le survol ne doit
// déclencher le lien que sur ces trois zones précises — pas sur les
// métadonnées (badge, date, vues) ni sur les espaces vides de la carte.
//
// Retour du 04/09 : catégorie et date reviennent sur la même ligne, vues en
// violet, date au format complet en toutes lettres — identique à la page
// article.
// Retour du 05/09 (point 3) : badge + libellé de catégorie regroupés et
// agrandis (à hauteur du chapeau, 18px), espacement net avec le groupe
// date + vues.
// Retour du 05/09 (point 6, 3e signalement de ce point) : le lien
// "Lire la suite"/"Découvrir" n'est plus un élément séparé positionné sous
// le chapeau (ce qui créait visuellement un "retour à la ligne" — un bloc
// qui saute systématiquement à la ligne suivante). Le chapeau est
// désormais tronqué par le code à une longueur fixe (CHARS_PER_LINE ×
// excerptLines, jamais au milieu d'un mot), suivi de "…" seulement si
// coupé, puis immédiatement du lien "Lire la suite"/"Découvrir" — à
// l'intérieur du même <Link>, du même paragraphe, du même flux de texte.
// Il peut désormais suivre le retour à la ligne naturel du texte comme
// n'importe quel mot (jamais coupé en deux lui-même, via white-space:
// nowrap sur .feed-cta-inline), mais n'est plus jamais un bloc à part.
// excerptLines contrôle la longueur du chapeau — réglage admin
// (interface_texts "publications.excerpt_lines"), pas une valeur fixée ici.
// variant "home" utilise les libellés de bouton historiques de l'accueil
// (flèche) plutôt que ceux des hubs, seule différence entre les deux usages.
export default function PublicationFeedItem({
  article,
  excerptLines,
  variant = "hub",
}: {
  article: Article;
  excerptLines: number;
  variant?: "hub" | "home";
}) {
  const href = article.type === "rm" ? `/rosee-matinale?date=${article.article_date}` : `/publications/${article.slug}`;
  const rawExcerpt = article.excerpt || (article.body ? stripHtml(article.body) : article.verse_text || "");
  const dateLabel = new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const ctaLabel = variant === "home" ? HOME_CTA_LABEL[article.type] : CTA_LABEL[article.type];
  // Réserve la place du "… " + du lien sur la dernière ligne (retour du
  // 05/09) — sans cette marge, le total (chapeau + lien) dépassait souvent
  // d'une ligne complète la longueur voulue par excerptLines.
  const reserved = ctaLabel.length + 3;
  const { text: excerptText, truncated } = truncateExcerpt(rawExcerpt.trim(), CHARS_PER_LINE * excerptLines - reserved);

  return (
    <div className="feed-item">
      {/* Pas de vignette du tout si aucune image n'est renseignée (retour du
          05/09) — plus d'espace réservé/placeholder vide : le texte prend
          alors toute la largeur. Comportement inchangé quand une image
          existe. */}
      {article.cover_url && (
        <Link href={href} className="feed-thumb-link" aria-label={article.title}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.cover_url} alt={article.cover_alt || article.title} className="feed-thumb" />
        </Link>
      )}
      <div className="feed-body">
        <div className="feed-meta">
          <span className="feed-cat-group">
            <span className={`feed-badge ${article.type}`}>{ARTICLE_TYPE_INITIALS[article.type]}</span>
            <span className="feed-cat-label">{ARTICLE_TYPE_LABEL[article.type]}</span>
          </span>
          <span className="feed-info-group">
            <span className="feed-date">{dateLabel}</span>
            <span className="feed-views">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {article.view_count} vue{article.view_count > 1 ? "s" : ""}
            </span>
          </span>
        </div>
        <h3>
          <Link href={href}>{article.title}</Link>
        </h3>
        <p className="excerpt">
          <Link href={href}>
            {excerptText}
            {truncated && "…"}
            {" "}
            <span className="feed-cta-inline">{ctaLabel}</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
