import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import InvitationForm from "@/components/forms/InvitationForm";

const title = "Invitation | Serge Hapita Ministries";
const description = "Invitez Serge Hapita pour une conférence, un séminaire ou une prédication.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/invitation" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/invitation",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

export default function InvitationPage() {
  return (
    // V2 (retour du 11/09, Lot 6) — reproduit prototype-html/invitation/
    // index.html § .engagement-hero/.invitation-intro/.invitation-form
    // (engagement.css). Réhabillage visuel uniquement : submitInvitationForm
    // inchangé — tous les champs de la maquette existaient déjà réellement.
    <div className="v2-engagement-page v2-invitation-page">
      <section className="v2-engagement-hero invitation">
        <div className="v2-engagement-wrap v2-engagement-hero-inner">
          <p className="v2-eyebrow light">
            <span /> À propos
          </p>
          <h1>Invitation</h1>
        </div>
      </section>

      <section className="v2-engagement-wrap v2-invitation-intro">
        <h2>Vous souhaitez inviter Serge&nbsp;?</h2>
        <p>Envoyez-nous toutes les informations sur votre projet.</p>
      </section>

      <div className="v2-engagement-wrap">
        <InvitationForm />
      </div>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
