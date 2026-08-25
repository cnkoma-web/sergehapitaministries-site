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
    <form className="review-form" onSubmit={handleSubmit}>
      <h3>Laisser un avis</h3>
      {error && <div className="admin-error">{error}</div>}
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
      <input type="text" name="author_name" placeholder="Votre nom" />
      <textarea name="body" placeholder="Votre avis…" />
      <button className="btn btn-primary" type="submit" disabled={loading}>
        {loading ? "Envoi…" : "Envoyer mon avis →"}
      </button>
    </form>
  );
}
