// Contenu de navigation du site.
//
// ⚠️ TEMPORAIRE : ces données sont codées en dur ici pour la Phase 1 (socle technique).
// Le cahier des charges (exigence transversale, tête de document) impose que ces libellés
// deviennent pilotables depuis l'administration sans toucher au code — ce sera fait en
// Phase 2 (table `interface_texts`). En attendant, ce fichier est le SEUL endroit du code
// où ces libellés doivent apparaître, pour que le branchement au CMS reste un simple
// remplacement de ces fonctions par des appels à la base de données.

export type NavLink = { label: string; href: string };
export type NavDropdown = { label: string; links: NavLink[] };
export type NavItem = NavLink | NavDropdown;

export function isDropdown(item: NavItem): item is NavDropdown {
  return "links" in item;
}

export function getMainNav(): NavItem[] {
  return [
    { label: "Accueil", href: "/" },
    {
      label: "À propos",
      links: [
        { label: "De Serge", href: "/de-serge" },
        { label: "Livres", href: "/livres" },
        { label: "Vidéos", href: "/videos" },
        { label: "Invitation", href: "/invitation" },
        { label: "Partenariat", href: "/partenariat" },
      ],
    },
    { label: "Connaître Jésus", href: "/connaitre-jesus" },
    {
      label: "Publications",
      links: [
        { label: "Que Dit la Bible ?", href: "/publications#que-dit-la-bible" },
        { label: "La Vie Supérieure", href: "/publications#vie-superieure" },
        { label: "Rosée Matinale", href: "/rosee-matinale" },
      ],
    },
    { label: "Boutique", href: "/boutique" },
    { label: "Soutenir", href: "/partenariat" },
    { label: "Contact", href: "/contact" },
  ];
}

export function getBrandSplitLinks(): { left: NavLink; right: NavLink } {
  return {
    left: { label: "ActesDesFilsDeDieu", href: "http://www.actedesfilsdedieu.fr" },
    right: { label: "amDG Éditions", href: "http://www.amdgeditions.fr" },
  };
}
