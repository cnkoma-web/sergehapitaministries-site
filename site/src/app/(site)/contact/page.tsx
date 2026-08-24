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
    images: ["/assets/og/contact.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/og/contact.jpg"],
  },
};

export default function ContactPage() {
  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Contact</h1>
          <p>Une question, un message ? Nous serons heureux de vous lire.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="form-block">
            <h2 style={{ fontSize: 20, marginBottom: 20 }}>Envoyez-nous un message</h2>
            <ContactForm />
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
