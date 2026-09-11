import Image from "next/image";
import Link from "next/link";
import { getMainNav, isDropdown } from "@/lib/content/nav";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import { getCartCount } from "@/lib/cart/cart";
import MobileNav from "./MobileNav";

// V2 (retour du 11/09, Lot 1) — reproduit prototype-html/index.html §
// .site-header/.main-nav : logo à gauche, menu centré, icônes réelles (SVG)
// au lieu des émojis 🔍/👤/🛒. Données inchangées (getMainNav, isRealUser,
// getCartCount).
//
// Sous-menus en <div>+:hover/:focus-within, PAS en <details>/<summary>
// natifs comme le prototype (bug réel trouvé en vérifiant le résultat
// réel, pas seulement le code) : le rendu interne de <details> fermé dans
// les navigateurs Chromium récents s'appuie sur une boîte interne
// (::details-content) qui garde le contenu à hauteur/largeur 0 même si
// l'attribut "open" est absent et qu'un display:block est forcé par CSS
// sur l'enfant — confirmé en testant les deux états (open=true : 210×212,
// fermé + survolé : 0×0). Le survol/focus sur un simple <div> est la
// technique CSS-only fiable, sans ce piège.
export default async function Header() {
  const supabase = await createClient();
  const [nav, { data }, cartCount] = await Promise.all([getMainNav(), supabase.auth.getUser(), getCartCount()]);
  const accountHref = isRealUser(data.user) ? "/mon-compte" : "/compte";

  return (
    <header className="v2-site-header">
      <input type="checkbox" id="v2-search-toggle" className="v2-search-toggle" />
      <div className="v2-wrap v2-main-nav">
        <Link href="/" className="v2-brand" aria-label="Accueil Serge Hapita Ministries">
          <Image src="/logo.png" alt="Serge Hapita Ministries" width={170} height={64} priority />
        </Link>
        <nav className="v2-desktop-menu" aria-label="Navigation principale">
          {nav.map((item) =>
            isDropdown(item) ? (
              <div key={item.label} className="v2-nav-dropdown">
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
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            )
          )}
        </nav>
        <div className="v2-nav-actions">
          <label htmlFor="v2-search-toggle" className="v2-icon-button v2-action-icon" title="Rechercher" aria-label="Rechercher sur le site">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 4 4" />
            </svg>
          </label>
          <Link href={accountHref} className="v2-icon-button v2-action-icon" title="Mon compte" aria-label="Mon compte">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="8" r="4" />
              <path d="M4.5 21c.7-4.3 3.2-6.5 7.5-6.5s6.8 2.2 7.5 6.5" />
            </svg>
          </Link>
          <Link href="/panier" className="v2-icon-button v2-action-icon v2-cart-action" title="Panier" aria-label="Panier">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 4h2l2.1 10.1a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20 8H6" />
              <circle cx="9.5" cy="19" r="1" />
              <circle cx="17" cy="19" r="1" />
            </svg>
            {cartCount > 0 && <span className="v2-cart-count">{cartCount}</span>}
          </Link>
          <MobileNav nav={nav} />
        </div>
      </div>
      <div className="v2-search-panel">
        <form method="get" action="/recherche" className="v2-wrap v2-search-panel-inner">
          <label htmlFor="v2-search-input">Rechercher sur le site</label>
          <input id="v2-search-input" type="search" name="q" placeholder="Un enseignement, un livre, un thème…" />
          <button type="submit">
            Rechercher <span>→</span>
          </button>
        </form>
      </div>
    </header>
  );
}
