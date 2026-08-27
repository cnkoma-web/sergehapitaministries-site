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
    images: ["/assets/og/invitation.jpg"],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/og/invitation.jpg"] },
};

export default function InvitationPage() {
  return (
    <>
      <section className="inv-hero">
        <div className="bg-illustration">
          <svg viewBox="0 0 400 200" width="100%" height="100%" style={{ maxWidth: 900 }}>
            <rect x="60" y="50" width="280" height="180" rx="8" fill="#fff" opacity=".15" />
            <path d="M60 55 L200 160 L340 55" stroke="#fff" strokeWidth="4" fill="none" opacity=".25" />
            <rect x="60" y="50" width="280" height="180" rx="8" fill="none" stroke="#fff" strokeWidth="3" opacity=".2" />
            <circle cx="200" cy="60" r="16" fill="#fff" opacity=".18" />
            <path d="M192 60 L198 66 L210 52" stroke="#fff" strokeWidth="3" fill="none" opacity=".3" />
          </svg>
        </div>
        <div className="wrap">
          <h1>Invitation</h1>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 32 }}>
        <div className="wrap inv-form-wrap">
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Vous souhaitez inviter Serge ?</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 15 }}>
              Envoyez-nous toutes les informations sur votre projet.
            </p>
          </div>
          <InvitationForm />
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
