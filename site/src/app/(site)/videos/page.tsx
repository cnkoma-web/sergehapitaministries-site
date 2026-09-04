import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Vidéos | Serge Hapita Ministries";
const description = "Prédications, enseignements et témoignages du ministère.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/videos" },
  openGraph: { type: "website", title, description, url: "/videos", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// Page volontairement remplacée par un message temporaire (retour du 05/09)
// — cette section n'est pas encore construite ; mieux vaut l'annoncer
// clairement que de laisser apparaître une grille de vidéos incomplète ou
// non fonctionnelle. La logique réelle (getVideos, VideoGrid...) reste dans
// le reste du code, prête à être rebranchée ici quand la page sera prête.
export default function VideosPage() {
  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Vidéos</h1>
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
