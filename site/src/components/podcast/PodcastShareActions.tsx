"use client";

import { useState } from "react";

// Reproduit prototype-html/podcast/index.html § .podcast-share-actions —
// volontairement plus compact que ShareCartouche (src/components/articles/
// ShareCartouche.tsx, 8 boutons) : la maquette ne montre que 2 icônes sur la
// carte podcast (WhatsApp + partage natif), l'espace d'une carte étant plus
// restreint que le bas de page d'un article. Fonctionnel malgré la
// simplicité visuelle : WhatsApp ouvre un vrai lien de partage, "Partager"
// utilise l'API Web Share native si le navigateur la supporte, sinon copie
// le lien (retour au même mécanisme que ShareCartouche).
export default function PodcastShareActions({ title, message, url }: { title: string; message: string; url: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const encodedMessage = encodeURIComponent(message);

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: message, url });
        return;
      } catch {
        // Annulé par l'utilisateur ou API indisponible en pratique — repli
        // silencieux sur la copie ci-dessous, jamais de message d'erreur.
      }
    }
    try {
      await navigator.clipboard.writeText(message);
      setFeedback("Lien copié !");
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      // Rien à faire de plus si le presse-papiers est indisponible.
    }
  }

  return (
    <div className="podcast-share-actions" data-share-root>
      <a
        href={`https://api.whatsapp.com/send?text=${encodedMessage}`}
        target="_blank"
        rel="noopener"
        aria-label="Partager sur WhatsApp"
        title="Partager sur WhatsApp"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            className="filled"
            d="M17.5 6.4a7.9 7.9 0 0 0-12.7 9.6L3.8 20l4.1-1.1a7.9 7.9 0 0 0 12.4-6.5c0-2.1-.8-4.1-2.3-5.6Zm-5.5 12.2a6.6 6.6 0 0 1-3.4-.9l-.2-.1-2.5.7.7-2.4-.2-.3a6.6 6.6 0 1 1 5.5 2.9Z"
          />
        </svg>
      </a>
      <button type="button" onClick={handleNativeShare} aria-label="Partager" title="Partager">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="18" cy="5" r="2.6" />
          <circle cx="6" cy="12" r="2.6" />
          <circle cx="18" cy="19" r="2.6" />
          <path d="M8.4 10.7 15.6 6.6M8.4 13.3l7.2 4.1" />
        </svg>
      </button>
      {feedback && (
        <span className="share-feedback" data-share-feedback aria-live="polite">
          {feedback}
        </span>
      )}
    </div>
  );
}
