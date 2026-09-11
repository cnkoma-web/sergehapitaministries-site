import { getBrandSplitLinks } from "@/lib/content/nav";

// V2 (retour du 11/09, Lot 1) — les 2 liens partenaires vivent désormais
// dans .v2-network-bar, aux côtés du ticker (voir Topbar.tsx et
// (site)/layout.tsx qui regroupe les deux dans un même bandeau, comme
// prototype-html/index.html § .network-bar). Données inchangées
// (getBrandSplitLinks) — seul l'habillage change : jamais un bloc pleine
// largeur par lien comme l'ancien .brand-split, mais une ligne compacte
// dans la bande sombre du haut, masquée sur mobile (prototype-html/
// styles.css, @media max-width:720px : .network-inner nav{display:none}).
export default async function BrandSplit() {
  const { left, right } = await getBrandSplitLinks();
  return (
    <nav className="v2-partner-nav" aria-label="Sites partenaires">
      <a href={left.href} target="_blank" rel="noopener noreferrer">
        {left.label}
      </a>
      <a href={right.href} target="_blank" rel="noopener noreferrer">
        {right.label}
      </a>
    </nav>
  );
}
