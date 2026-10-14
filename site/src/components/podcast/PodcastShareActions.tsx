"use client";

import { useState } from "react";

// Une seule commande de partage : elle ouvre la feuille native du téléphone
// (WhatsApp, Messages, e-mail, etc.). Sur un navigateur sans Web Share,
// le message et son lien sont copiés dans le presse-papiers.
export default function PodcastShareActions({ title, message, url }: { title: string; message: string; url: string }) {
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: message, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${message}\n${url}`);
      setFeedback("Lien copié !");
      setTimeout(() => setFeedback(null), 2000);
    } catch {
      // Le bouton reste sans effet si ni Web Share ni le presse-papiers
      // ne sont disponibles.
    }
  }

  return (
    <div className="podcast-share-actions" data-share-root>
      <button type="button" onClick={handleNativeShare} aria-label="Partager cet épisode" title="Partager">
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
