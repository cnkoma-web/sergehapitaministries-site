import { getReviewSummary, getApprovedReviews } from "@/lib/content/reviews";
import Stars from "./Stars";
import ReviewForm from "./ReviewForm";

type Props = { bookId?: string; goodieId?: string };

// Ancre #avis : permet à Serge d'envoyer un lien direct vers cette section dans
// ses campagnes de rappel (cahier §3.3).
export default async function ReviewSection({ bookId, goodieId }: Props) {
  const target = { bookId, goodieId };
  const [summary, reviews] = await Promise.all([getReviewSummary(target), getApprovedReviews(target)]);

  // V2 (retour du 11/09, Lot 5) — reproduit prototype-html/livres/
  // manifester-ce-que-dieu-a-prevu/index.html § .reviews-section/
  // .reviews-heading/.reviews-layout/.reviews-empty (commerce.css) — même
  // grille à 2 colonnes (avis existants ou message vide à gauche,
  // formulaire à droite), plutôt que l'ancien empilement vertical.
  return (
    <section className="v2-reviews-section" id="avis">
      <div className="v2-wrap" style={{ maxWidth: "var(--content-col)", margin: "0 auto" }}>
        <div className="v2-reviews-heading">
          <h2>Vous avez déjà découvert ce produit&nbsp;?</h2>
          <div className="v2-reviews-summary">
            <div className="big-score">{summary.average ?? "—"}</div>
            <div>
              <Stars rating={summary.average} />
              <p style={{ fontSize: 13, color: "var(--v2-muted)", margin: "4px 0 0" }}>{summary.count} avis</p>
            </div>
          </div>
        </div>

        <div className="v2-reviews-layout">
          {reviews.length === 0 ? (
            <div className="v2-reviews-empty">
              <strong>Aucun avis pour le moment.</strong>
              <p>Soyez le premier à partager votre expérience.</p>
            </div>
          ) : (
            <div className="v2-reviews-list">
              {reviews.map((r) => (
                <div className="v2-review-card" key={r.id}>
                  <div className="v2-review-card-head">
                    <strong style={{ fontSize: 14 }}>{r.author_name || "Anonyme"}</strong>
                    <Stars rating={r.rating} />
                  </div>
                  {r.body && <p style={{ fontSize: 14, color: "var(--v2-muted)", margin: 0 }}>{r.body}</p>}
                </div>
              ))}
            </div>
          )}

          <ReviewForm bookId={bookId} goodieId={goodieId} />
        </div>
      </div>
    </section>
  );
}
