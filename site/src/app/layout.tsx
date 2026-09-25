import type { Metadata } from "next";
import "./globals.css";
import "./responsive-v2.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsentBanner from "@/components/CookieConsentBanner";

// Chaque page définit son propre <title> complet (les maquettes originales n'ont pas un
// gabarit "Titre | Serge Hapita Ministries" uniforme — ex. l'accueil a un titre-accroche
// à part) — pas de `template` ici pour éviter une double concaténation.
//
// Layout racine volontairement minimal : le chrome du site public (header/ticker/nav)
// vit dans app/(site)/layout.tsx, pas ici, pour que /admin ne l'hérite pas.
//
// Les URLs relatives des métadonnées doivent rester sur le domaine officiel en
// production, mais sur chaque hostname immuable du déploiement en Preview.
// VERCEL_URL peut désigner l'alias de branche (réutilisé entre déploiements) ;
// VERCEL_BRANCH_URL est également stable par branche. VERCEL_DEPLOYMENT_URL,
// lorsqu'il est fourni par Vercel, identifie le déploiement courant.
const metadataOrigin =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_DEPLOYMENT_URL
    ? `https://${process.env.VERCEL_DEPLOYMENT_URL}`
    : "https://sergehapitaministries.org";

export const metadata: Metadata = {
  metadataBase: new URL(metadataOrigin),
  title: "Serge Hapita Ministries — Révéler Christ au croyant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;600;700;800&family=Inter:wght@400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <GoogleAnalytics />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
