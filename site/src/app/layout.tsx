import type { Metadata } from "next";
import BrandSplit from "@/components/layout/BrandSplit";
import Topbar from "@/components/layout/Topbar";
import Header from "@/components/layout/Header";
import "./globals.css";

// Chaque page définit son propre <title> complet (les maquettes originales n'ont pas un
// gabarit "Titre | Serge Hapita Ministries" uniforme — ex. l'accueil a un titre-accroche
// à part) — pas de `template` ici pour éviter une double concaténation.
export const metadata: Metadata = {
  metadataBase: new URL("https://sergehapitaministries.org"),
  title: "Serge Hapita Ministries — Révéler Christ au croyant",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <BrandSplit />
        <Topbar />
        <Header />
        {children}
      </body>
    </html>
  );
}
