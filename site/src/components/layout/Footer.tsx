import Link from "next/link";
import { getFooterColumns, getLegalLinks, getSocialLinks, getFooterTexts } from "@/lib/content/footer";

type FooterProps = {
  /**
   * Distinction "light"/"dark" héritée de l'ancien design (§1.2) — le
   * prototype V2 n'a plus qu'un seul pied de page (toujours clair,
   * .v2-footer). Prop conservée uniquement pour ne pas casser les appels
   * existants (`<Footer variant="light|dark" />` sur les pages pas encore
   * réhabillées) ; sans effet ici.
   */
  variant: "light" | "dark";
};

export default async function Footer({ variant }: FooterProps) {
  const columns = getFooterColumns();
  const legalLinks = getLegalLinks();
  const [socialLinks, { description, copyright }] = await Promise.all([
    getSocialLinks(),
    getFooterTexts(),
  ]);
  columns.find((c) => c.title === "Réseaux")!.links = socialLinks;

  // V2 (retour du 11/09, Lot 1) — reproduit prototype-html/index.html §
  // .footer : bloc "à propos" + logo à gauche, 3 colonnes de liens à
  // droite, ligne légale en bas. Données inchangées (getFooterColumns,
  // getSocialLinks, getLegalLinks, getFooterTexts) — variant "dark" perd son
  // sens ici (le prototype n'a qu'un seul pied de page clair) : la prop
  // reste acceptée pour compatibilité avec les appelants existants, sans
  // effet visuel tant que les pages appelantes ne sont pas, elles aussi,
  // passées en V2 (lots suivants).
  return (
    <footer className="v2-footer" data-variant={variant}>
      <div className="v2-wrap v2-footer-grid">
        <div className="v2-footer-about">
          <h2>
            Serge Hapita <em>Ministries</em>
          </h2>
          <p>{description}</p>
        </div>
        <nav className="v2-footer-links" aria-label="Pied de page">
          {columns.map((col) => (
            <div key={col.title}>
              <strong>{col.title}</strong>
              {col.links.map((link) =>
                link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href}>
                    {link.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </nav>
      </div>
      <div className="v2-wrap v2-footer-bottom">
        <span>{copyright}</span>
        {/* Les 4 liens légaux existent tous comme pages réelles — corrige un défaut des
            maquettes statiques où ce texte n'était jamais un vrai lien cliquable. */}
        <nav className="v2-footer-legal-links" aria-label="Informations légales">
          {legalLinks.map((link, i) => (
            <span key={link.href}>
              <Link href={link.href}>{link.label}</Link>
              {i < legalLinks.length - 1 && <span> · </span>}
            </span>
          ))}
        </nav>
      </div>
    </footer>
  );
}
