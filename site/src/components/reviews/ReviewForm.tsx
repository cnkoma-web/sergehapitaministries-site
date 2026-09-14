"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = { bookId?: string; goodieId?: string };

// Bouton "Envoyer mon avis" (jamais "Publier") — la publication passe par
// modération, jamais instantanée (cahier §3.3).
export default function ReviewForm({ bookId, goodieId }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("reviews").insert({
      book_id: bookId ?? null,
      goodie_id: goodieId ?? null,
      user_id: user?.id ?? null,
      author_name: String(formData.get("author_name") ?? "").trim() || null,
      rating: rating || null,
      body: String(formData.get("body") ?? "").trim() || null,
    });

    setLoading(false);
    if (insertError) {
      setError("Impossible d'envoyer votre avis pour le moment. Réessayez plus tard.");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="review-form">
        <p style={{ color: "#1F8A4C", fontSize: 14.5, margin: 0 }}>
          Merci ! Votre avis a bien été envoyé et sera visible après validation par l&apos;équipe.
        </p>
      </div>
    );
  }

  return (
    // STRUCTURE corrigée (reprise fiche Livre, 14/09) : l'ordre des champs
    // était Note → Nom → Avis, alors que la maquette (§ .review-form) va
    // Nom → Note → Avis — remis dans cet ordre.
    // <h3>"Laisser un avis" retiré (inspection factuelle + correction,
    // 14/09) : n'existe dans aucune version de la maquette (le formulaire
    // enchaîne directement sur les champs) — mesuré responsable de 39px
    // d'écart de hauteur (25px de h3 + 14px de gap). Vérifié qu'il ne
    // portait aucune fonction indispensable (texte statique seul, aucun
    // état ni accessibilité qui en dépende) avant retrait. Formulaire/
    // labels/étoiles/données/validation/soumission/résumé dynamique tous
    // inchangés.
    <form className="review-form" onSubmit={handleSubmit}>
      {error && <div className="admin-error">{error}</div>}
      <label htmlFor="review-name">Votre nom</label>
      <input id="review-name" type="text" name="author_name" />
      <div>
        <label>Votre note</label>
        <div className="star-input">
          {[1, 2, 3, 4, 5].map((v) => (
            <span
              key={v}
              className={v <= (hoverRating || rating) ? "active" : undefined}
              onClick={() => setRating(v)}
              onMouseEnter={() => setHoverRating(v)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <label htmlFor="review-body">Votre avis</label>
      <textarea id="review-body" name="body" />
      <button type="submit" disabled={loading}>
        {loading ? "Envoi…" : "Envoyer mon avis →"}
      </button>
      {/* AJOUTÉ (recertification atomique, 14/09) : présent dans la maquette
          (<p class="review-note" data-review-note aria-live="polite">) et
          absent du rendu V2 — trou de couverture détecté par le balayage
          exhaustif (texte statique, sans logique associée). aria-live
          conservé : pertinent ici puisque ce même paragraphe pourrait à
          l'avenir porter un message d'état (déjà le rôle de data-review-note
          côté maquette), même si aujourd'hui son contenu est fixe. */}
      <p className="review-note" aria-live="polite">Votre avis sera publié après modération.</p>
    </form>
  );
}
