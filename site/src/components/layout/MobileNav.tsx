"use client";

import { useState } from "react";
import { isDropdown, type NavItem } from "@/lib/content/navTypes";

// V2 (retour du 11/09, Lot 1) — même mécanisme React qu'avant (panneau
// déroulant listant tous les liens, y compris les sous-menus à plat),
// habillage seul changé (.v2-mobile-menu). `nav` reste chargé côté serveur
// (Header) et transmis en prop — les libellés viennent toujours de la base
// (table nav_items).
export default function MobileNav({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="v2-icon-button v2-menu-button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <nav className="v2-mobile-menu" aria-label="Navigation mobile">
          {nav.map((item) =>
            isDropdown(item) ? (
              <div key={item.label} className="v2-nav-dropdown">
                {item.href ? (
                  <a href={item.href} onClick={() => setOpen(false)}>
                    {item.label} <span aria-hidden="true">⌄</span>
                  </a>
                ) : (
                  <span>
                    {item.label} <span aria-hidden="true">⌄</span>
                  </span>
                )}
                <div className="v2-nav-dropdown-menu">
                  {item.links.map((link) => (
                    <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            )
          )}
        </nav>
      )}
    </>
  );
}
