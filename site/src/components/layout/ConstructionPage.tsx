import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

type ConstructionPageProps = {
  section: "Boutique" | "Vidéos" | "Podcast";
  eyebrow: string;
};

export const constructionMetadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ConstructionPage({ section, eyebrow }: ConstructionPageProps) {
  return (
    <div className="v2-construction-page">
      <main className="v2-construction-main">
        <div className="v2-construction-glow v2-construction-glow-one" aria-hidden="true" />
        <div className="v2-construction-glow v2-construction-glow-two" aria-hidden="true" />

        <section className="v2-construction-card" aria-labelledby="construction-title">
          <div className="v2-construction-mark" aria-hidden="true">SHM</div>
          <Image
            src="/logo.png"
            alt="Serge Hapita Ministries"
            width={188}
            height={63}
            className="v2-construction-logo"
            priority
          />
          <p className="v2-construction-eyebrow">
            <span />
            {eyebrow}
          </p>
          <h1 id="construction-title">{section}</h1>
          <p className="v2-construction-status">Page en construction</p>
          <div className="v2-construction-rule" aria-hidden="true">
            <span />
          </div>
          <p className="v2-construction-message">
            Cet espace est en cours de préparation.
            <br />
            Revenez bientôt, et que Dieu vous bénisse.
          </p>
          <Link href="/" className="v2-construction-link">
            Retour à l’accueil <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <Footer variant="light" />
    </div>
  );
}
