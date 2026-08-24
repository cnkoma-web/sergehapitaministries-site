"use client";

import { useState } from "react";
import { isDropdown, type NavItem } from "@/lib/content/navTypes";

// Le burger existe visuellement dans les maquettes statiques mais n'a aucun comportement
// (le menu principal disparaît simplement sous 640px, sans alternative de navigation —
// repéré à l'audit). Ce composant lui donne un vrai comportement : panneau déroulant
// listant tous les liens (y compris ceux des sous-menus "À propos"/"Publications" à plat),
// sans changer la charte graphique déjà validée. `nav` est chargé côté serveur (Header)
// et transmis en prop, car les libellés viennent de la base (interface_texts).
export default function MobileNav({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="burger"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <div className="mobile-nav-panel">
          {nav.map((item) =>
            isDropdown(item) ? (
              <div key={item.label} className="mobile-nav-group">
                <span className="mobile-nav-group-label">{item.label}</span>
                {item.links.map((link) => (
                  <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
                    {link.label}
                  </a>
                ))}
              </div>
            ) : (
              <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </a>
            )
          )}
        </div>
      )}
    </>
  );
}
