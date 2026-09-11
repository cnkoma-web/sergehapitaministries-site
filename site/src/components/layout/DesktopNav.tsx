"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isDropdown, type NavItem } from "@/lib/content/navTypes";

// V2 (retour du 11/09, bug réel signalé par Serge) — le trait violet sous
// l'entrée de menu (.v2-desktop-menu > a::after / .v2-nav-dropdown-trigger::after)
// n'apparaissait qu'au survol : le prototype (`.desktop-menu .active::after`,
// `.nav-dropdown.active summary::after`) le garde aussi affiché en
// permanence sur la page courante — chaque maquette statique portait la
// classe "active" codée en dur selon le fichier. Ici, une seule vraie page
// dynamique par route : l'état actif se calcule au moment du rendu, en
// comparant le chemin réel (usePathname) aux liens du menu — d'où un
// composant client dédié (même principe que MobileNav.tsx), le Header
// (server) ne pouvant pas connaître le chemin courant lui-même.
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DesktopNav({ nav }: { nav: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="v2-desktop-menu" aria-label="Navigation principale">
      {nav.map((item) =>
        isDropdown(item) ? (
          <div
            key={item.label}
            className={`v2-nav-dropdown${item.links.some((l) => isActive(pathname, l.href)) || (item.href && isActive(pathname, item.href)) ? " active" : ""}`}
          >
            {item.href ? (
              <Link href={item.href} className="v2-nav-dropdown-trigger">
                {item.label} <span aria-hidden="true">⌄</span>
              </Link>
            ) : (
              <button type="button" className="v2-nav-dropdown-trigger">
                {item.label} <span aria-hidden="true">⌄</span>
              </button>
            )}
            <div className="v2-nav-dropdown-menu">
              {item.links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Link key={item.href} href={item.href} className={isActive(pathname, item.href) ? "active" : undefined}>
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
