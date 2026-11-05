import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

type ConstructionPageProps = {
  section: string;
  eyebrow: string;
  status?: string;
  messageLine1?: string;
  messageLine2?: string;
  blessing?: string;
  backAction?: string;
};

export const constructionMetadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ConstructionPage({
  section,
  eyebrow,
  status = "En construction",
  messageLine1 = "Cet espace est en cours de préparation.",
  messageLine2 = "Revenez bientôt.",
  blessing = "Que Dieu vous bénisse.",
  backAction = "Retour à l’accueil",
}: ConstructionPageProps) {
  return (
    <div className="v2-construction-page">
      <main className="v2-construction-main">
        <div className="v2-construction-glow v2-construction-glow-one" aria-hidden="true" />
        <div className="v2-construction-glow v2-construction-glow-two" aria-hidden="true" />

        <section className="v2-construction-card" aria-labelledby="construction-title">
          <div className="v2-construction-mark" aria-hidden="true">SHM</div>
          <p className="v2-construction-eyebrow">
            <span />
            {eyebrow}
          </p>
          <h1 id="construction-title">{section}</h1>
          <p className="v2-construction-status">{status}</p>
          <div className="v2-construction-rule" aria-hidden="true">
            <span />
          </div>
          <p className="v2-construction-message">
            {messageLine1}
            <br />
            {messageLine2}
            <strong>
              <em>{blessing}</em>
            </strong>
          </p>
          <Link href="/" className="v2-construction-link">
            {backAction} <span aria-hidden="true">→</span>
          </Link>
        </section>
      </main>
      <Footer variant="light" />
    </div>
  );
}

