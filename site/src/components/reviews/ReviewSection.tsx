import { getReviewSummary, getApprovedReviews } from "@/lib/content/reviews";
import Stars from "./Stars";
import ReviewForm from "./ReviewForm";

type Props = { bookId?: string; goodieId?: string; variant?: "book" | "goodie" };

// Ancre #avis : permet à Serge d'envoyer un lien direct vers cette section dans
// ses campagnes de rappel (cahier §3.3).
//
// variant="goodie" (chantier Boutique — fiche Goodie, finalisation du
// gabarit) : la maquette Goodie (t-shirt-voix-prophetique/index.html) ne
// montre AUCUNE section avis — la présentation "Vous avez déjà découvert
// ce produit ?" est propre à la fiche Livre. Enveloppe graphique dédiée et
// plus compacte pour ce contexte, jamais recopiée par analogie ; la chaîne
// fonctionnelle (résumé, liste, formulaire, modération) reste strictement
// la même. Par défaut ("book", omis), le comportement et le rendu de la
// fiche Livre restent identiques, propriété par propriété.
export default async function ReviewSection({ bookId, goodieId, variant = "book" }: Props) {
  const target = { bookId, goodieId };
  const [summary, reviews] = await Promise.all([getReviewSummary(target), getApprovedReviews(target)]);

  if (variant === "goodie") {
    return (
      <section className="v2-goodie-reviews" id="avis">
        <div className="v2-goodie-reviews-head">
          <h2>Avis sur ce produit</h2>
          <div className="v2-goodie-reviews-summary">
            <Stars rating={summary.average} />
            <span>{summary.count > 0 ? `${summary.average} · ${summary.count} avis` : "Aucun avis pour le moment"}</span>
          </div>
        </div>
        <div className="v2-goodie-reviews-layout">
          {reviews.length === 0 ? (
            <div className="v2-goodie-reviews-empty">
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
        <h2>Vous avez déjà découvert ce produit&nbsp;?</h2>
        {/* STRUCTURE corrigée (SECTION 08, lot dédié 15/09) : la maquette
            porte h2 en 1re colonne et <p> en 2e colonne de la grille 2
            colonnes (§ .reviews-heading, grid-template-columns:1fr 1fr) —
            regrouper h2+p dans la même colonne (fait lors d'une passe
            précédente pour loger .v2-reviews-summary, un résumé note/
            étoiles absent de la maquette pour cette page) plaçait le <p>
            dans la mauvaise colonne (mesuré x=175 au lieu de x=665).
            Corrigé : h2 seul en colonne 1 ; <p> + résumé désormais
            empilés en colonne 2, résumé conservé comme fonctionnalité V2
            réelle (SUPPLÉMENTAIRE V2, non retiré). */}
        <div className="v2-reviews-heading-col2">
          <p>Votre avis aide d&apos;autres visiteurs — quelques secondes suffisent.</p>
          <div className="v2-reviews-summary">
            <div className="big-score">{summary.average ?? "—"}</div>
            <div>
              <Stars rating={summary.average} />
              <p style={{ fontSize: 13, color: "var(--v2-muted)", margin: "4px 0 0" }}>{summary.count} avis</p>
            </div>
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
