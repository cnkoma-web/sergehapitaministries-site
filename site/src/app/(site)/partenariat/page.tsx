import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";
import DonateWidget from "@/components/forms/DonateWidget";

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

export default function PartenariatPage() {
  return (
    // V2 (retour du 11/09, Lot 6) — reproduit prototype-html/partenariat/
    // index.html § .engagement-hero/.partnership-intro/.donation-section
    // (engagement.css). Réhabillage visuel uniquement :
    // createDonationCheckoutSession (DonateWidget) inchangé.
    <div className="v2-engagement-page">
      <section className="v2-engagement-hero partnership">
        <div className="v2-engagement-wrap v2-engagement-hero-inner">
          <p className="v2-eyebrow light">
            <span /> Partenariat
          </p>
          <h1>Associez-vous à cette œuvre du Royaume de Dieu</h1>
        </div>
      </section>

      <section className="v2-partnership-intro">
        <div className="v2-engagement-wrap v2-partnership-intro-grid">
          <p className="v2-partnership-subtitle">
            Des semences de foi plantées dans un terrain éternel — semer avec Dieu pour une moisson d&apos;âmes et de
            bénédictions.
          </p>
          <div className="v2-partnership-copy">
            <p className="v2-partnership-opening">
              Cher ami, depuis des générations, la Parole de Dieu a apporté la guérison, le salut et la lumière dans
              la vie de milliers de personnes. À travers ce ministère, des vies sont continuellement touchées par la
              puissance de la Parole de Dieu et la présence de Jésus.
            </p>
            <p className="v2-partnership-pivot">
              Et ce n&apos;est possible que grâce à votre générosité qui nous aide à propager la Parole de Dieu.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-donation-section">
        <div className="v2-engagement-wrap v2-donation-layout">
          <div className="v2-donation-copy">
            <p className="v2-eyebrow">
              <span /> Soutenir l&apos;œuvre
            </p>
            <h2>Devenez un semeur de la Parole par votre don</h2>
            <p>
              Merci beaucoup d&apos;avoir envisagé de devenir partenaire en soutenant ce ministère. Nous ne prenons
              pas votre générosité à la légère. Votre soutien financier est le fondement de cet important travail
              ministériel.
            </p>
          </div>
          <DonateWidget />
        </div>
      </section>

      <Footer variant="dark" />
    </div>
  );
}
