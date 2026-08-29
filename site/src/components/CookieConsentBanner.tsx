"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useConsent, setStoredConsent } from "@/lib/cookieConsent";

export default function CookieConsentBanner() {
  const pathname = usePathname();
  const consent = useConsent();

  // Pas de bandeau dans l'admin — Serge n'a pas besoin de consentir au suivi
  // de son propre site. Rien tant que le choix n'est pas encore connu (rendu
  // serveur) ou déjà fait.
  if (pathname.startsWith("/admin") || consent !== null) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-text">
        Ce site utilise des cookies de mesure d&apos;audience (Google Analytics) pour comprendre
        comment il est utilisé. Vous pouvez accepter ou refuser — voir notre{" "}
        <Link href="/politique-de-cookies">politique de cookies</Link>.
      </div>
      <div className="cookie-banner-actions">
        <button type="button" className="btn-ghost" onClick={() => setStoredConsent("rejected")}>
          Refuser
        </button>
        <button type="button" className="btn-primary" onClick={() => setStoredConsent("accepted")}>
          Accepter
        </button>
      </div>
    </div>
  );
}
