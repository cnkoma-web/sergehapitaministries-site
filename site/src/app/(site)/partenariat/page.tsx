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
    <>
      <section className="part-hero">
        <div className="wrap">
          <div className="eyebrow">Partenariat</div>
          <h1>Associez-vous à cette œuvre du Royaume de Dieu</h1>
        </div>
      </section>

      <section className="part-intro">
        <div className="wrap">
          <p className="part-subtitle">
            Des semences de foi plantées dans un terrain éternel — semer avec Dieu pour une moisson d&apos;âmes et de
            bénédictions.
          </p>
          <p className="part-opening">
            Cher ami, depuis des générations, la Parole de Dieu a apporté la guérison, le salut et la lumière dans
            la vie de milliers de personnes. À travers ce ministère, des vies sont continuellement touchées par la
            puissance de la Parole de Dieu et la présence de Jésus.
          </p>
          <p className="part-pivot">
            Et ce n&apos;est possible que grâce à votre générosité qui nous aide à propager la Parole de Dieu.
          </p>
        </div>
      </section>

      <section className="donate-section">
        <div className="wrap">
          <DonateWidget />
        </div>
      </section>

      <Footer variant="dark" />
    </>
  );
}
