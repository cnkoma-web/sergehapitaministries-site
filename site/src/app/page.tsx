import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Serge Hapita Ministries — Révéler Christ au croyant";
const description =
  "Serge Hapita Ministries — un ministère qui révèle Christ au croyant, affermit le chrétien dans l'identité de fils, manifeste Dieu, le Père céleste.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
    images: ["/assets/og/accueil.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/og/accueil.jpg"],
  },
};

// ⚠️ Page d'accueil réelle (hero carrousel, Rosée Matinale du jour, livres en avant,
// publications, agenda, stats...) à construire en Phase 4 (contenu éditorial dynamique),
// une fois le CMS branché — voir le plan d'implémentation. Ce placeholder ne sert qu'à
// valider le socle de layout (Phase 1) sans anticiper sur du contenu encore statique
// qui serait de toute façon à refaire.
export default function HomePage() {
  return (
    <>
      <section className="section">
        <div className="wrap" style={{ textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
          <h1 style={{ fontSize: 32, marginBottom: 16 }}>Serge Hapita Ministries</h1>
          <p style={{ color: "var(--ink-soft)", lineHeight: 1.6 }}>
            Le socle technique du site est en cours de reconstruction. La page d&apos;accueil
            complète (hero, Rosée Matinale du jour, livres, publications, agenda) arrive en
            phase suivante.
          </p>
        </div>
      </section>
      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
