// Types + helper purs (aucune dépendance serveur), pour pouvoir être importés
// depuis un Client Component (MobileNav.tsx) sans entraîner le client Supabase
// serveur dans le bundle navigateur.

export type NavLink = { label: string; href: string };
export type NavDropdown = { label: string; links: NavLink[] };
export type NavItem = NavLink | NavDropdown;

export function isDropdown(item: NavItem): item is NavDropdown {
  return "links" in item;
}
