// Types + helper purs (aucune dépendance serveur), pour pouvoir être importés
// depuis un Client Component (MobileNav.tsx) sans entraîner le client Supabase
// serveur dans le bundle navigateur.

export type NavLink = { label: string; href: string };
// href optionnel : un menu déroulant peut aussi mener quelque part en
// cliquant sur son propre libellé (ex. "Publications" → le hub), pas
// seulement dérouler ses liens au survol (retour du 30/08).
export type NavDropdown = { label: string; href?: string; links: NavLink[] };
export type NavItem = NavLink | NavDropdown;

export function isDropdown(item: NavItem): item is NavDropdown {
  return "links" in item;
}
