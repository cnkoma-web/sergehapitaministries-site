import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import DonateWidget from "@/components/forms/DonateWidget";
import { getPageContent } from "@/lib/content/pageContent";

const title = "Partenariat | Serge Hapita Ministries";
const description =
  "Associez-vous à cette œuvre du Royaume de Dieu — devenez un semeur de la Parole par votre don.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/partenariat" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/partenariat",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default async function PartenariatPage() {
  const content = await getPageContent("partenariat");
  return (
    // V2 (retour du 11/09, Lot 6) — reproduit prototype-html/partenariat/
    // index.html § .engagement-hero/.partnership-intro/.donation-section
    // (engagement.css). Réhabillage visuel uniquement :
    // createDonationCheckoutSession (DonateWidget) inchangé.
    <div className="v2-engagement-page">
      <section className="v2-engagement-hero partnership">
        <div className="v2-engagement-wrap v2-engagement-hero-inner">
          <p className="v2-eyebrow light">
            <span /> {content.eyebrow}
          </p>
          <h1>{content.title}</h1>
        </div>
      </section>

      <section className="v2-partnership-intro">
        <div className="v2-engagement-wrap v2-partnership-intro-grid">
          <p className="v2-partnership-subtitle">{content.subtitle}</p>
          <div className="v2-partnership-copy">
            <p className="v2-partnership-opening">{content.opening}</p>
            <p className="v2-partnership-pivot">{content.pivot}</p>
          </div>
        </div>
      </section>

      <section className="v2-donation-section">
        <div className="v2-engagement-wrap v2-donation-layout">
          <div className="v2-donation-copy">
            <p className="v2-eyebrow">
              <span /> {content.donation_eyebrow}
            </p>
            <h2>{content.donation_title}</h2>
            <p>{content.donation_intro}</p>
          </div>
          <DonateWidget />
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  );
}
