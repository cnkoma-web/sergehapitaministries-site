// Ligne vues + temps de lecture sous la date (cahier §3.9, ajouté hors session —
// compteur réel incrémenté côté serveur, temps de lecture recalculé à la
// publication à partir du nombre de mots réel du corps de l'article).
export default function ArticleMeta({ viewCount, readingTimeMinutes }: { viewCount: number; readingTimeMinutes: number | null }) {
  return (
    <div className="article-meta">
      <span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>{" "}
        {viewCount} vue{viewCount > 1 ? "s" : ""}
      </span>
      {readingTimeMinutes && (
        <>
          <span>·</span>
          <span>{readingTimeMinutes} min de lecture</span>
        </>
      )}
    </div>
  );
}
