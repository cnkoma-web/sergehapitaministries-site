import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/forms/ContactForm";

const title = "Contact | Serge Hapita Ministries";
const description =
  "Contactez Serge Hapita Ministries — une question, un message, une demande de partenariat.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/contact",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function ContactPage() {
  return (
    // V2 (retour du 11/09, Lot 6) — reproduit prototype-html/contact/
    // index.html § .engagement-hero/.contact-section (engagement.css).
    // Réhabillage visuel uniquement : submitContactForm inchangé.
    <div className="v2-engagement-page v2-contact-page">
      <section className="v2-engagement-hero contact">
        <div className="v2-engagement-wrap v2-engagement-hero-inner">
          <p className="v2-eyebrow light">
            <span /> Écrivez-nous
          </p>
          <h1>Contact</h1>
        </div>
      </section>

      <section className="v2-engagement-wrap v2-contact-section">
        <div className="v2-contact-heading">
          <h2>Parlons-en.</h2>
          <p>Une question, un témoignage ou un message&nbsp;? Écrivez directement à Serge Hapita Ministries.</p>
        </div>
        <ContactForm />
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
