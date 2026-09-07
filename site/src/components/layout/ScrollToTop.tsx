"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

// Corrige un vrai bug de positionnement au chargement d'un article, signalé
// une première fois de façon imprécise, puis une seconde avec une précision
// décisive (retour du 07/09) : reproductible sur mobile ET desktop (mesuré :
// ~200-250px d'écart, jamais remarqué sur desktop tant l'effet y est discret),
// mais UNIQUEMENT via un lien de navigation interne (client-side, <Link>) —
// jamais via le menu déroulant mobile, qui utilise volontairement de simples
// <a href> (voir MobileNav.tsx), donc un vrai rechargement de page, qui
// repart toujours de zéro par nature.
//
// Cause réelle : header/bandeaux (BrandSplit + Topbar + Header, "sticky")
// vivent dans le layout partagé (site)/layout.tsx, jamais démonté entre deux
// pages publiques. App Router de Next.js essaie alors de préserver la
// position de ce chrome partagé au lieu de remonter tout en haut du document,
// et le calcul se fait mal avec un header "position:sticky" — l'écart mesuré
// correspond à peu près à sa hauteur. Un simple `window.scrollTo(0,0)` posé
// une seule fois ne suffit pas : mesuré en direct, le retour en haut de
// Next.js s'exécute APRÈS ce composant et l'écrase par sa propre animation
// (`html{scroll-behavior:smooth}` en base — voir globals.css), qui ramène
// la page à ce même mauvais endroit sur environ 1 seconde. Il faut donc
// réimposer la position, en instantané (behavior:"instant", qui ignore le
// scroll-behavior:smooth global pour cet appel précis), sur toute la durée
// de cette animation concurrente, pas une seule fois.
export default function ScrollToTop() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (window.location.hash) return;

    let frameId: number;
    const start = performance.now();
    // 1200ms — mesuré en direct : l'animation concurrente de Next.js met
    // environ 1 seconde à se stabiliser sur son mauvais endroit ; cette
    // fenêtre la couvre avec une marge de sécurité.
    const DURATION_MS = 1200;

    function enforce(now: number) {
      if (window.scrollY !== 0) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (now - start < DURATION_MS) frameId = requestAnimationFrame(enforce);
    }

    frameId = requestAnimationFrame(enforce);
    return () => cancelAnimationFrame(frameId);
    // Volontairement seulement `pathname`, jamais les paramètres de requête
    // (searchParams) : la pagination (voir Pagination.tsx) navigue sur la
    // même page avec `?page=2` et `scroll={false}` — un changement
    // intentionnel, qui ne doit jamais déclencher ce retour en haut de page.
  }, [pathname]);

  return null;
}
