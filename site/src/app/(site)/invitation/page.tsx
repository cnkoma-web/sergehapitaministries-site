import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import InvitationForm from "@/components/forms/InvitationForm";
import { getPageContent } from "@/lib/content/pageContent";

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

export default async function InvitationPage() {
  const content = await getPageContent("invitation");
  return (
    // V2 (retour du 11/09, Lot 6) — reproduit prototype-html/invitation/
    // index.html § .engagement-hero/.invitation-intro/.invitation-form
    // (engagement.css). Réhabillage visuel uniquement : submitInvitationForm
    // inchangé — tous les champs de la maquette existaient déjà réellement.
    <div className="v2-engagement-page v2-invitation-page">
      <section className="v2-engagement-hero invitation">
        <div className="v2-engagement-wrap v2-engagement-hero-inner">
          <p className="v2-eyebrow light">
            <span /> {content.eyebrow}
          </p>
          <h1>{content.title}</h1>
        </div>
      </section>

      <section className="v2-engagement-wrap v2-invitation-intro">
        <h2>{content.section_title}</h2>
        <p>{content.intro}</p>
      </section>

      <div className="v2-engagement-wrap">
        <InvitationForm />
      </div>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
