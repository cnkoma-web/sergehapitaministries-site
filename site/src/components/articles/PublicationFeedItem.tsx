import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";

// Libellé du bouton selon la catégorie, propre aux hubs (retour du 04/09).
// jc (retour validation humaine, 13/09, reprise ciblée) : "Continuer la
// confession" — la maquette (.confess-reminder) écrit littéralement
// "Lire et proclamer" en dur dans son HTML statique, mais cette formulation
// a été explicitement remplacée ici (décision validée, pas un oubli) ;
// seule cette carte (daily-reminder du hub Publications) utilise ce
// libellé — à consigner comme exception validée au référentiel.
const CTA_LABEL: Record<Article["type"], string> = { qdlb: "Lire la suite", vs: "Découvrir", rm: "Lire la suite", jc: "Continuer la confession" };
// Libellés historiques de l'accueil (retour du 03/09), conservés tels quels
// (retour du 05/09) : le passage de l'accueil à un flux unique change la
// structure de la liste, pas ce texte de bouton déjà tranché séparément.
const HOME_CTA_LABEL: Record<Article["type"], string> = { qdlb: "Lire →", vs: "Découvrir →", rm: "Lire →", jc: "Confesser →" };

// Nombre moyen de caractères par ligne d'extrait à ~15px (retour du 05/09,
// point 6) — sert à couper le chapeau nous-mêmes, en code, à une longueur
// fixe, plutôt que de compter sur -webkit-line-clamp : le lien
// "Lire la suite" doit être physiquement à l'intérieur du même bloc de
// texte que le chapeau tronqué (jamais un élément séparé positionné en
// dessous), donc c'est le code qui doit garantir qu'il reste de la place,
// pas Serge en tapant son texte.
//
// Deux valeurs, pas une (retour du 05/09, 2e passage) : .feed-body n'a pas
// la même largeur réelle sur mobile (vignette 64px, ≤640px) que sur
// tablette/desktop (vignette 96px, .content-col plafonné à 695px au-delà
// de 640px — tablette et desktop partagent donc la même largeur de carte).
// Une seule constante calibrée pour l'un donnait 3 lignes pile sur l'autre,
// mais 5 à 8 lignes sur le premier (mesuré en direct) — le "minimum 3
// lignes" doit être identique sur les 3 tailles d'écran, pas seulement sur
// celle qui a servi à calibrer la constante.
const CHARS_PER_LINE_DESKTOP = 145;
const CHARS_PER_LINE_MOBILE = 42;

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
  minExcerptLines = 3,
  charsPerLineDesktop = CHARS_PER_LINE_DESKTOP,
}: {
  article: Article;
  excerptLines: number;
  variant?: "hub" | "home";
  /** Plancher de lignes réservées par la troncature JS (retour validation
   * humaine, 13/09) — par défaut 3, comme avant. Les cartes du jour
   * (.daily-reminder-grid) sont visuellement limitées à 2 lignes par CSS
   * (-webkit-line-clamp:2, voir globals.css) : sans ce plancher abaissé à 2
   * pour cet usage précis, la troncature JS réservait de la place pour une
   * 3e ligne que le clamp CSS masque ensuite — le lien CTA, toujours en fin
   * de texte, se retrouvait physiquement hors de la zone visible (mesuré
   * via getBoundingClientRect() : le CTA existait dans le DOM mais son
   * rectangle tombait ~127px sous la zone visible du chapô, donc jamais
   * affiché). Les autres usages (flux principal, home) gardent 3. */
  minExcerptLines?: number;
  /** Capacité réelle de caractères par ligne desktop (retour validation
   * humaine, 13/09) — par défaut calibrée pour la colonne pleine largeur du
   * flux principal (695-860px). Les cartes .daily-reminder-grid sont bien
   * plus étroites (581px mesuré) : réutiliser 145 y sur-estimait largement
   * la place réelle disponible (texte réellement rendu sur ~5 lignes à
   * cette largeur pour un budget calculé pour 3), aggravant le
   * débordement du CTA hors du clamp CSS ci-dessus. Mesuré en direct
   * (clone sans clamp, hauteur réelle / line-height) : ~86 caractères/ligne
   * à 581px, pas 145. */
  charsPerLineDesktop?: number;
}) {
  // Vraie URL par jour depuis le 05/09 (restructuration) — plus de "?date=".
  // Je Confesse (Lot 4) suit le même principe que Rosée Matinale — une
  // page dédiée par jour, jamais /publications/[slug] (pas de titre
  // éditorial propre, donc pas de vrai slug porteur de sens ici).
  const href =
    article.type === "rm"
      ? `/rosee-matinale/${article.article_date}`
      : article.type === "jc"
        ? `/publications/je-confesse-et-declare/${article.article_date}`
        : `/publications/${article.slug}`;
  // Je Confesse (retour de validation humaine, 13/09) : article.title vaut
  // toujours "Je Confesse — [date]" (voir admin/publications/actions.ts),
  // une étiquette technique interne, jamais un vrai titre éditorial — la
  // maquette (§ .confess-reminder) met la première phrase de la
  // proclamation en tête (comme un titre), le reste du corps ensuite en
  // chapeau. Reproduit ici dynamiquement à partir du vrai corps de
  // l'article (jamais de contenu en dur) : aucun impact sur les autres
  // types (rm/qdlb/vs), qui gardent leur vrai titre éditorial.
  const isConfession = article.type === "jc";
  function splitFirstSentence(text: string): { first: string; rest: string } {
    const m = text.match(/^(.*?[.!?])(\s+|$)/);
    if (!m) return { first: text, rest: "" };
    return { first: m[1], rest: text.slice(m[0].length) };
  }
  const confessionBody = isConfession && article.body ? stripHtml(article.body) : "";
  const { first: confessionHeadline, rest: confessionRest } = splitFirstSentence(confessionBody);
  const displayTitle = isConfession ? confessionHeadline || article.title : article.title;
  const rawExcerpt = isConfession
    ? confessionRest
    : article.excerpt || (article.body ? stripHtml(article.body) : article.verse_text || "");
  const dateLabel = new Date(article.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const ctaLabel = variant === "home" ? HOME_CTA_LABEL[article.type] : CTA_LABEL[article.type];
  // 3 lignes minimum (retour du 05/09) — plancher appliqué ici, un seul
  // endroit pour l'accueil ET les hubs, quelle que soit la valeur du
  // réglage admin (qui reste libre d'aller au-delà de 3, jamais en deçà).
  const effectiveLines = Math.max(minExcerptLines, excerptLines);
  // Réserve la place du "… " + du lien sur la dernière ligne (retour du
  // 05/09) — sans cette marge, le total (chapeau + lien) dépassait souvent
  // d'une ligne complète la longueur voulue par excerptLines.
  const reserved = ctaLabel.length + 3;
  const trimmedExcerpt = rawExcerpt.trim();
  const desktop = truncateExcerpt(trimmedExcerpt, charsPerLineDesktop * effectiveLines - reserved);
  const mobile = truncateExcerpt(trimmedExcerpt, CHARS_PER_LINE_MOBILE * effectiveLines - reserved);

  return (
    <div className="feed-item">
      {/* Plus de vignette du tout sur les aperçus, avec ou sans image
          renseignée (retour du 05/09, remplace le point précédent qui ne
          retirait l'espace que pour les publications sans image) — l'image
          de Serge ne sert plus que sur la page article elle-même et sur
          l'image de partage Open Graph. Le texte occupe toute la largeur
          disponible. */}
      <div className="feed-body">
        <div className="feed-meta">
          {/* Nom complet de la catégorie directement dans la capsule colorée
              (retour du 05/09) — plus de sigle (QB/VS) devant/à la place :
              même couleur, même forme de capsule, seul le texte change. */}
          <span className="feed-cat-group">
            <span className={`feed-badge ${article.type}`}>{ARTICLE_TYPE_LABEL[article.type]}</span>
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
          <Link href={href}>{displayTitle}</Link>
        </h3>
        <p className="excerpt">
          <Link href={href}>
            {/* Deux variantes, une seule visible à la fois via CSS
                (display:none exclut automatiquement l'autre de l'arbre
                d'accessibilité, pas besoin d'aria-hidden) — voir
                CHARS_PER_LINE_MOBILE ci-dessus. */}
            <span className="excerpt-desktop">
              {desktop.text}
              {desktop.truncated && "…"} <span className="feed-cta-inline">{ctaLabel}</span>
            </span>
            <span className="excerpt-mobile">
              {mobile.text}
              {mobile.truncated && "…"} <span className="feed-cta-inline">{ctaLabel}</span>
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
}
