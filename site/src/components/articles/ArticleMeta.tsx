// Ligne vues + temps de lecture sous la date (cahier §3.9, ajouté hors session —
// compteur réel incrémenté côté serveur, temps de lecture recalculé à la
// publication à partir du nombre de mots réel du corps de l'article).
// Recontrôle validation humaine (13/09, section Hero de Je Confesse) :
// l'ordre réel de la maquette (.rm-hero-meta, Rosée Matinale ET Je
// Confesse, vérifié indépendamment sur les deux) est "temps de lecture"
// PUIS "vues", texte nu sans icône ni séparateur "·" (le seul espacement
// vient du gap du conteneur) — l'inverse de ce que rendait ce composant
// partagé. Corrigé ici (composant partagé avec les pages article
// individuelles, hors périmètre mais pas encore certifiées, donc sans
// risque de régression sur une page déjà validée).
export default function ArticleMeta({ viewCount, readingTimeMinutes }: { viewCount: number; readingTimeMinutes: number | null }) {
  return (
    <div className="article-meta">
      {readingTimeMinutes && <span>{readingTimeMinutes} min de lecture</span>}
      <span>
        {viewCount} vue{viewCount > 1 ? "s" : ""}
      </span>
    </div>
  );
}
