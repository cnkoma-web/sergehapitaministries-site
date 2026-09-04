import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Boutique | Serge Hapita Ministries";
const description = "Goodies et accessoires du ministère Serge Hapita.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/boutique" },
  openGraph: { type: "website", title, description, url: "/boutique", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// Page volontairement remplacée par un message temporaire (retour du 05/09)
// — la boutique n'est pas encore construite ; mieux vaut l'annoncer
// clairement que de laisser apparaître une grille de produits incomplète ou
// non fonctionnelle. La logique réelle (getGoodies, goodie-card...) reste
// dans le reste du code, prête à être rebranchée ici quand la boutique sera
// prête.
export default function BoutiquePage() {
  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Boutique</h1>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ textAlign: "center" }}>
          <p className="empty-state">Cette page est en cours de réalisation. Revenez bientôt.</p>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
