import Link from "next/link";
import type { Article } from "@/lib/content/articles";
import { stripHtml, nbspBeforeClosingGuillemet } from "@/lib/richtext";

// Extraite (retour du 07/09) — utilisée à la fois par les pages Que Dit la
// Bible / La Vie Supérieure et par Rosée Matinale, pour ne jamais dupliquer
// ce rendu (cahier : "réutilise le mécanisme existant, n'en construis pas
// un nouveau").

// Chaque type de publication a sa propre URL — jamais /publications/[slug]
// pour une entrée Rosée Matinale (page dédiée par jour). Un article Rosée
// Matinale peut atterrir ici via un lien manuel ("Articles similaires" dans
// l'éditeur n'a pas de filtre par type) : sans ceci, son lien pointerait
// vers une URL qui n'existe pas (404).
function hrefFor(a: Article): string {
  return a.type === "rm" ? `/rosee-matinale/${a.article_date}` : `/publications/${a.slug}`;
}

// Repli identique à celui déjà utilisé pour le partage (chapeau au corps de
// l'article si aucun extrait explicite) — bug corrigé (retour du 07/09) :
// sans ce repli, une entrée Rosée Matinale (qui n'a jamais de champ
// "excerpt") n'affichait jamais que son titre ici, jamais de chapeau,
// contrairement aux autres publications suggérées dans cette section.
function displayExcerpt(a: Article): string | undefined {
  const raw = a.excerpt || (a.body ? stripHtml(a.body) : a.verse_text || undefined);
  return raw ? nbspBeforeClosingGuillemet(raw) : undefined;
}

export default function RelatedArticlesSection({ articles, heading = "Autres articles similaires" }: { articles: Article[]; heading?: string }) {
  if (articles.length === 0) return null;

  return (
    <section className="related-articles">
      <div className="wrap">
        {/* Intitulé neutre, sans nom de catégorie entre guillemets (retour du
            05/09). */}
        <h2>{heading}</h2>
        <div className="related-grid">
          {articles.map((a) => {
            const excerpt = displayExcerpt(a);
            const href = hrefFor(a);
            return (
              // Corrigé (retour du 05/09, 2e signalement) : plus de lien
              // unique étiré sur toute la carte (métadonnées et espace vide
              // compris) — même principe que .feed-item : seuls le titre et
              // le chapeau sont cliquables, chacun avec son propre lien.
              <div className="related-card" key={a.id}>
                {/* .related-card time (prototype) : un vrai <time>, "7
                    septembre 2026" sans le jour de la semaine — écarts
                    corrigés le 11/09. */}
                <time className="verse" dateTime={a.article_date}>
                  {new Date(a.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </time>
                <h3>
                  <Link href={href}>{a.title}</Link>
                </h3>
                {excerpt && (
                  <p className="related-card-excerpt">
                    <Link href={href}>{excerpt}</Link>
                  </p>
                )}
                <Link href={href} className="related-card-link">
                  Lire la suite →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
