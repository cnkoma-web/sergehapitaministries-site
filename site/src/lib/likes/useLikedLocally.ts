"use client";

import { useSyncExternalStore } from "react";

// Dédoublonnage "une fois par visiteur" pour Que Dit la Bible / Rosée
// Matinale (retour du 05/09) — pas de compte à associer à un like pour ces
// catégories restées volontairement publiques, donc pas de garantie serveur
// possible : mémorisé dans le navigateur du visiteur, best-effort. Même
// mécanisme SSR-safe que le consentement cookies (cookieConsent.ts) —
// useSyncExternalStore plutôt qu'un useEffect+setState classique, qui
// déclenche un re-rendu en cascade évitable pour ce genre de lecture d'un
// stockage externe au premier rendu.
const STORAGE_KEY = "shm-liked-articles";
const LIKED_EVENT = "shm-liked-articles-changed";

// useSyncExternalStore exige que getSnapshot renvoie la MÊME référence tant
// que rien n'a changé, sinon il boucle indéfiniment (re-rendu → nouvelle
// référence → re-abonnement → re-rendu...). JSON.parse renvoie un nouveau
// tableau à chaque appel : on ne réanalyse donc que si le contenu brut du
// localStorage a réellement changé depuis le dernier appel, et on garde la
// même référence sinon.
let cachedRaw: string | null | undefined;
let cachedIds: string[] = [];

function getLikedIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedIds = raw ? JSON.parse(raw) : [];
    }
    return cachedIds;
  } catch {
    return cachedIds;
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(LIKED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(LIKED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

// Référence stable et unique (pas un `[]` littéral recréé à chaque appel) —
// même exigence de useSyncExternalStore que pour getLikedIds ci-dessus.
const EMPTY: string[] = [];
function getServerSnapshot(): string[] {
  return EMPTY;
}

export function useIsLikedLocally(articleId: string): boolean {
  const ids = useSyncExternalStore(subscribe, getLikedIds, getServerSnapshot);
  return ids.includes(articleId);
}

export function markLikedLocally(articleId: string): void {
  try {
    const ids = getLikedIds();
    if (!ids.includes(articleId)) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, articleId]));
    }
  } catch {
    // Stockage indisponible (navigation privée stricte, etc.) — le like
    // reste compté côté serveur, juste pas mémorisé pour la prochaine
    // visite : comportement honnête plutôt qu'une erreur silencieuse qui
    // bloquerait le clic.
  }
  window.dispatchEvent(new Event(LIKED_EVENT));
}
