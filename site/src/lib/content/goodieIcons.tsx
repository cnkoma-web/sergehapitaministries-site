// Icônes SVG dessinées à la main pour chaque goodie, tant qu'aucune vraie photo
// produit n'est disponible (cahier §1.1 : jamais d'emoji ni de photo de stock en
// remplacement). Ce sont des illustrations génériques par catégorie de produit,
// pas du contenu éditorial propre à une fiche — elles restent dans le code,
// comme le reste de la structure visuelle, et seront remplacées par `image_url`
// dès qu'un vrai visuel est importé (cahier Partie 4 : catalogue Printful à
// choisir). Indexées par slug pour rester correctes si l'ordre change.
import type { ReactNode } from "react";

export const GOODIE_ICONS: Record<string, ReactNode> = {
  "t-shirt-voix-prophetique": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <path fill="#7B3FE4" opacity=".85" d="M35 15 L20 25 L25 38 L32 34 L32 85 L68 85 L68 34 L75 38 L80 25 L65 15 Q65 25 50 25 Q35 25 35 15Z" />
    </svg>
  ),
  "t-shirt-logo-ministries": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <path fill="#2E2FE0" opacity=".85" d="M35 15 L20 25 L25 38 L32 34 L32 85 L68 85 L68 34 L75 38 L80 25 L65 15 Q65 25 50 25 Q35 25 35 15Z" />
    </svg>
  ),
  "casquette-brodee": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <path fill="#3D6E86" opacity=".85" d="M15 45 Q15 35 30 33 L70 33 Q85 35 85 45 Q85 60 68 62 L68 68 Q68 78 50 78 Q32 78 32 68 L32 62 Q15 60 15 45Z" />
      <ellipse cx="50" cy="33" rx="20" ry="5" fill="#3D6E86" opacity=".6" />
    </svg>
  ),
  "mug-rosee-matinale": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <path fill="#9A1FA8" opacity=".85" d="M25 30 L70 30 L68 80 Q68 85 62 85 L33 85 Q27 85 27 80 Z" />
      <path fill="none" stroke="#9A1FA8" strokeWidth="5" opacity=".85" d="M70 38 Q85 38 85 52 Q85 66 70 66" />
    </svg>
  ),
  "tote-bag": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <path fill="none" stroke="#7B3FE4" strokeWidth="6" opacity=".85" d="M35 32 L35 20 Q35 12 50 12 Q65 12 65 20 L65 32" />
      <path fill="#7B3FE4" opacity=".85" d="M22 32 L78 32 L74 88 L26 88 Z" />
    </svg>
  ),
  "carnet-de-notes": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <rect x="22" y="15" width="56" height="70" rx="4" fill="#2E2FE0" opacity=".85" />
      <rect x="30" y="26" width="40" height="4" fill="#fff" opacity=".7" />
      <rect x="30" y="36" width="40" height="4" fill="#fff" opacity=".7" />
      <rect x="30" y="46" width="26" height="4" fill="#fff" opacity=".7" />
    </svg>
  ),
  echarpe: (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <path fill="none" stroke="#3D6E86" strokeWidth="9" strokeLinecap="round" opacity=".85" d="M15 30 Q50 55 85 30 M25 45 Q50 68 75 45" />
    </svg>
  ),
  "coque-telephone": (
    <svg viewBox="0 0 100 100" width="70" height="70">
      <rect x="30" y="12" width="40" height="76" rx="10" fill="#9A1FA8" opacity=".85" />
      <rect x="36" y="20" width="28" height="52" rx="2" fill="#fff" opacity=".25" />
      <circle cx="50" cy="80" r="3" fill="#fff" opacity=".5" />
    </svg>
  ),
};

export function GoodieIcon({ slug }: { slug: string }) {
  return (
    <>
      {GOODIE_ICONS[slug] ?? (
        <svg viewBox="0 0 100 100" width="70" height="70">
          <circle cx="50" cy="50" r="30" fill="#7B3FE4" opacity=".5" />
        </svg>
      )}
    </>
  );
}
