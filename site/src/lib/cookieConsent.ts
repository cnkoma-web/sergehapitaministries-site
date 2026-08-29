import { useSyncExternalStore } from "react";

// Consentement aux cookies de mesure d'audience (RGPD/CNIL) — stocké côté
// navigateur uniquement (aucune donnée personnelle, pas besoin de le
// synchroniser côté serveur). Tant qu'aucun choix n'a été fait, Google
// Analytics ne se charge pas (voir GoogleAnalytics.tsx).
export const CONSENT_STORAGE_KEY = "shm-cookie-consent";
export const CONSENT_EVENT = "shm-cookie-consent-changed";

export type ConsentValue = "accepted" | "rejected";

export function getStoredConsent(): ConsentValue | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(CONSENT_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CONSENT_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): ConsentValue | null {
  return null;
}

/** Hook SSR-safe : lit/écoute le choix de consentement sans jamais provoquer
 * de désaccord entre le rendu serveur et le premier rendu client (contrairement
 * à un useState+useEffect classique, qui afficherait brièvement le mauvais état). */
export function useConsent(): ConsentValue | null {
  return useSyncExternalStore(subscribe, getStoredConsent, getServerSnapshot);
}

export function setStoredConsent(value: ConsentValue): void {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Stockage indisponible (navigation privée stricte, etc.) — le bandeau
    // réapparaîtra à la prochaine visite, comportement honnête plutôt qu'une
    // erreur silencieuse qui bloquerait le choix.
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
}
