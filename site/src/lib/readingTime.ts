// Recalculé automatiquement à chaque publication/modification (cahier §3.9),
// jamais saisi manuellement — base ~200 mots/minute, arrondi, minimum 1 min.
export function computeReadingTime(body: string): number {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
