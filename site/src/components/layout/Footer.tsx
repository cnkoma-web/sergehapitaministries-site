import Link from "next/link";
import { getFooterColumns, getLegalLinks, getSocialLinks, getFooterTexts } from "@/lib/content/footer";

type FooterProps = {
  /**
   * "light" (--paper) sur les 15 pages avec bloc newsletter juste au-dessus,
   * "dark" (--ink) sur les 8 pages sans newsletter (cahier §1.2).
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

  return (
    <footer className={variant === "dark" ? "footer--dark" : undefined}>
      <div className="wrap footer-grid">
        <div>
          <Link href="/" className="logo">
            Serge Hapita <em>Ministries</em>
          </Link>
          <p>{description}</p>
        </div>
        <div className="footer-nav-cols">
          {columns.map((col) => (
            <div className="footer-col" key={col.title}>
              <h5>{col.title}</h5>
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
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>{copyright}</span>
        {/* Les 4 liens légaux existent tous comme pages réelles — corrige un défaut des
            maquettes statiques où ce texte n'était jamais un vrai lien cliquable. */}
        <span className="footer-legal-links">
          {legalLinks.map((link, i) => (
            <span key={link.href}>
              <Link href={link.href}>{link.label}</Link>
              {i < legalLinks.length - 1 && <span> · </span>}
            </span>
          ))}
        </span>
      </div>
    </footer>
  );
}
