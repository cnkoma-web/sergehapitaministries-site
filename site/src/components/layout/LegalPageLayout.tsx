import type { ReactNode } from "react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";

const PAGES = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/politique-de-confidentialite", label: "Politique de confidentialité" },
  { href: "/politique-de-cookies", label: "Politique de cookies" },
  { href: "/termes-et-conditions", label: "Termes et conditions" },
] as const;

// V2 (retour du 11/09, Lot 8) — coquille partagée par les 4 pages légales,
// reproduit prototype-html/mentions-legales/index.html § .legal-hero/
// .legal-layout/.legal-nav/.legal-body (commerce.css). Réhabillage visuel
// uniquement : le texte de chaque page (fourni en children) reste
// inchangé — voir le commentaire dans chaque page.tsx sur les fichiers
// reference/contenus-juridiques-integres/*.md du 10/09 (captures du HTML
// rendu du site actuel, pas un nouveau texte, décidé avec Serge le 11/09).
export default function LegalPageLayout({
  title,
  lastUpdate,
  currentHref,
  children,
}: {
  title: string;
  lastUpdate: string;
  currentHref: (typeof PAGES)[number]["href"];
  children: ReactNode;
}) {
  return (
    <div className="v2-legal-page">
      <section className="v2-legal-hero">
        <div className="v2-commerce-wrap v2-legal-hero-inner">
          <h1>{title}</h1>
          <p>{lastUpdate}</p>
        </div>
      </section>

      <div className="v2-commerce-wrap v2-legal-layout">
        <nav className="v2-legal-nav" aria-label="Pages légales">
          <strong>Informations légales</strong>
          {PAGES.map((p) => (
            <Link key={p.href} href={p.href} aria-current={p.href === currentHref ? "page" : undefined}>
              {p.label}
            </Link>
          ))}
        </nav>
        <article className="v2-legal-body">{children}</article>
      </div>

      <Footer variant="dark" />
    </div>
  );
}
