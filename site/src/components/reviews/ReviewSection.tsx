import { getReviewSummary, getApprovedReviews } from "@/lib/content/reviews";
import Stars from "./Stars";
import ReviewForm from "./ReviewForm";

type Props = { bookId?: string; goodieId?: string };

// Ancre #avis : permet à Serge d'envoyer un lien direct vers cette section dans
// ses campagnes de rappel (cahier §3.3).
export default async function ReviewSection({ bookId, goodieId }: Props) {
  const target = { bookId, goodieId };
  const [summary, reviews] = await Promise.all([getReviewSummary(target), getApprovedReviews(target)]);

  return (
    <section className="reviews-section" id="avis">
      <div className="wrap">
        <div className="reviews-head">
          <div className="reviews-summary">
            <div className="big-score">{summary.average ?? "—"}</div>
            <div>
              <Stars rating={summary.average} />
              <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                {summary.count} avis
              </div>
            </div>
          </div>
        </div>

        <h2 style={{ textAlign: "center", fontSize: 22, marginBottom: 8 }}>
          Vous avez déjà découvert ce produit ?
        </h2>
        <p style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 14.5, marginBottom: 28 }}>
          Votre avis aide d&apos;autres visiteurs — quelques secondes suffisent.
        </p>

        {reviews.length === 0 ? (
          <div className="reviews-empty">
            <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience.</p>
          </div>
        ) : (
          <div style={{ maxWidth: 760, margin: "0 auto 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ background: "#fff", borderRadius: 14, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ fontSize: 14 }}>{r.author_name || "Anonyme"}</strong>
                  <Stars rating={r.rating} />
                </div>
                {r.body && <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>{r.body}</p>}
              </div>
            ))}
          </div>
        )}

        <ReviewForm bookId={bookId} goodieId={goodieId} />
      </div>
    </section>
  );
}
