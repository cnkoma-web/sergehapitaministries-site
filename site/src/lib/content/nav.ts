import { getInterfaceTexts } from "./interfaceTexts";
import type { NavLink, NavItem } from "./navTypes";

// La STRUCTURE du menu (quelles pages, quelle hiérarchie de sous-menus, quelles
// routes) reste ici, dans le code — c'est une décision d'architecture du site,
// pas du contenu éditorial au sens du cahier des charges. Seuls les LIBELLÉS
// affichés sont pilotables depuis l'admin (table `interface_texts`, via la clé
// indiquée sur chaque entrée), avec cette valeur de repli comme libellé par défaut.
//
// Les types (NavLink/NavItem/isDropdown) vivent dans navTypes.ts : ce fichier-ci
// importe le client Supabase serveur et ne doit jamais être importé depuis un
// Client Component (voir MobileNav.tsx, qui importe navTypes.ts directement).

export type { NavLink, NavDropdown, NavItem } from "./navTypes";
export { isDropdown } from "./navTypes";

type NavLinkDef = { key: string; label: string; href: string };
type NavDropdownDef = { key: string; label: string; links: NavLinkDef[] };
type NavItemDef = NavLinkDef | NavDropdownDef;

function isDropdownDef(item: NavItemDef): item is NavDropdownDef {
  return "links" in item;
}

const NAV_DEF: NavItemDef[] = [
  { key: "nav.accueil", label: "Accueil", href: "/" },
  {
    key: "nav.a_propos",
    label: "À propos",
    links: [
      { key: "nav.a_propos.de_serge", label: "De Serge", href: "/de-serge" },
      { key: "nav.a_propos.livres", label: "Livres", href: "/livres" },
      { key: "nav.a_propos.videos", label: "Vidéos", href: "/videos" },
      { key: "nav.a_propos.invitation", label: "Invitation", href: "/invitation" },
      { key: "nav.a_propos.partenariat", label: "Partenariat", href: "/partenariat" },
    ],
  },
  { key: "nav.connaitre_jesus", label: "Connaître Jésus", href: "/connaitre-jesus" },
  {
    key: "nav.publications",
    label: "Publications",
    links: [
      { key: "nav.publications.qdlb", label: "Que Dit la Bible ?", href: "/publications#que-dit-la-bible" },
      { key: "nav.publications.vs", label: "La Vie Supérieure", href: "/publications#vie-superieure" },
      { key: "nav.publications.rm", label: "Rosée Matinale", href: "/rosee-matinale" },
    ],
  },
  { key: "nav.boutique", label: "Boutique", href: "/boutique" },
  { key: "nav.soutenir", label: "Soutenir", href: "/partenariat" },
  { key: "nav.contact", label: "Contact", href: "/contact" },
];

export async function getMainNav(): Promise<NavItem[]> {
  const texts = await getInterfaceTexts();
  const label = (key: string, fallback: string) => texts[key] ?? fallback;

  return NAV_DEF.map((item) =>
    isDropdownDef(item)
      ? {
          label: label(item.key, item.label),
          links: item.links.map((l) => ({ label: label(l.key, l.label), href: l.href })),
        }
      : { label: label(item.key, item.label), href: item.href }
  );
}

export async function getBrandSplitLinks(): Promise<{ left: NavLink; right: NavLink }> {
  const texts = await getInterfaceTexts();
  return {
    left: {
      label: texts["brand_split.left.label"] ?? "ActesDesFilsDeDieu",
      href: texts["brand_split.left.href"] ?? "http://www.actedesfilsdedieu.fr",
    },
    right: {
      label: texts["brand_split.right.label"] ?? "amDG Éditions",
      href: texts["brand_split.right.href"] ?? "http://www.amdgeditions.fr",
    },
  };
}
