"use client";

import { useEffect } from "react";

// Signale une consultation réelle de l'article une fois la page ouverte dans
// un navigateur (retour du 06/09) — le comptage proprement dit (une fois par
// visiteur/jour) est décidé côté serveur par /api/track-view via un cookie,
// jamais ici. Remplace l'ancien incrementViewCount() appelé pendant le rendu
// serveur de la page, qui comptait aussi les rechargements de vérification.
export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    fetch("/api/track-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleId }),
    }).catch(() => {});
  }, [articleId]);

  return null;
}
