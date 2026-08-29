"use client";

import Script from "next/script";
import { useConsent } from "@/lib/cookieConsent";

// Envoie les pages vues à Google Analytics (GA4) — uniquement après consentement
// (cahier/RGPD : voir CookieConsentBanner.tsx). Le compte de service utilisé par
// le tableau de bord admin ne fait que LIRE ces données, ce script est ce qui
// les produit. N'installe rien tant que NEXT_PUBLIC_GA_MEASUREMENT_ID n'est
// pas configurée, ni tant que le visiteur n'a pas accepté.
export default function GoogleAnalytics() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  const consent = useConsent();

  if (!id || consent !== "accepted") return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${id}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}');
        `}
      </Script>
    </>
  );
}
