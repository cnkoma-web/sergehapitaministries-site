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
    // COMPOSITION corrigée (reprise fiche Livre, 14/09) : la maquette porte
    // "commerce-narrow reviews-section" sur LA MÊME balise (930px), pas une
    // section pleine largeur enveloppant un <div> à 695px (var(--content-col),
    // classe partagée avec les articles, jamais la bonne largeur ici) —
    // mesuré 695px de large au lieu de 930px avant correction.
    <section className="v2-commerce-narrow v2-reviews-section" id="avis">
      <div className="v2-reviews-heading">
        {/* <p> AJOUTÉ (recertification atomique, 14/09) : présent dans la
            maquette (§ .reviews-heading p, commerce.css l.219 — style déjà
            porté côté V2 par .v2-reviews-heading p, jamais utilisé faute de
            markup) et absent du rendu V2 jusqu'ici — trou de couverture
            détecté par le balayage exhaustif (élément à texte statique
            simple, sans logique ni donnée dynamique associée). Regroupé
            avec le h2 dans un même bloc pour ne pas perturber la grille à
            2 colonnes (maquette : h2+p ; V2 y ajoute .v2-reviews-summary,
            un résumé note/étoiles absent de la maquette pour cette page —
            fonctionnalité V2 conservée, documentée SUPPLÉMENTAIRE V2). */}
        <div>
          <h2>Vous avez déjà découvert ce produit&nbsp;?</h2>
          <p>Votre avis aide d&apos;autres visiteurs — quelques secondes suffisent.</p>
        </div>
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
    </section>
  );
}
