"use client";

import { useState } from "react";
import { isDropdown, type NavItem } from "@/lib/content/navTypes";

export default function MobileNav({ nav }: { nav: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  function closeMenu() {
    setOpen(false);
    setOpenDropdown(null);
  }

  function toggleMenu() {
    setOpen((current) => {
      if (current) setOpenDropdown(null);
      return !current;
    });
  }

  function toggleDropdown(label: string) {
    setOpenDropdown((current) => (current === label ? null : label));
  }

  return (
    <>
      <button
        className="v2-icon-button v2-menu-button"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={open}
        onClick={toggleMenu}
      >
        {open ? "✕" : "☰"}
      </button>
      {open && (
        <nav className="v2-mobile-menu" aria-label="Navigation mobile">
          {nav.map((item) =>
            isDropdown(item) ? (
              <div
                key={item.label}
                className={`v2-nav-dropdown${openDropdown === item.label ? " is-open" : ""}`}
              >
                <div className="v2-mobile-dropdown-heading">
                  {item.href ? (
                    <a href={item.href} onClick={closeMenu}>
                      {item.label}
                    </a>
                  ) : (
                    <button type="button" onClick={() => toggleDropdown(item.label)}>
                      {item.label}
                    </button>
                  )}
                  <button
                    type="button"
                    className="v2-mobile-dropdown-toggle"
                    aria-label={`${openDropdown === item.label ? "Fermer" : "Ouvrir"} le sous-menu ${item.label}`}
                    aria-expanded={openDropdown === item.label}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>
                {openDropdown === item.label && (
                  <div className="v2-nav-dropdown-menu">
                    {item.links.map((link) => (
                      <a key={link.href} href={link.href} onClick={closeMenu}>
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            )
          )}
        </nav>
      )}
    </>
  );
}
