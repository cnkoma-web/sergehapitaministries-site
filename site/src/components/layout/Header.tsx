import Image from "next/image";
import Link from "next/link";
import { getMainNav, isDropdown } from "@/lib/content/nav";
import { createClient } from "@/lib/supabase/server";
import { isRealUser } from "@/lib/supabase/realUser";
import { getCartCount } from "@/lib/cart/cart";
import MobileNav from "./MobileNav";

export default async function Header() {
  const supabase = await createClient();
  const [nav, { data }, cartCount] = await Promise.all([getMainNav(), supabase.auth.getUser(), getCartCount()]);
  const accountHref = isRealUser(data.user) ? "/mon-compte" : "/compte";

  return (
    <header>
      {/* Bascule de la zone de recherche en pur CSS (retour du 05/09) — pas
          de JS nécessaire, sur le même principe que le reste du site
          (Pagination en liens/formulaires purs). La case à cocher est
          invisible ; l'icône loupe est son <label>, et .header-search-row
          (plus bas, même parent <header>) réagit à :checked via ~. */}
      <input type="checkbox" id="header-search-toggle" className="header-search-toggle" />
      <div className="header-main">
        <div className="header-icon-zone">
          <label htmlFor="header-search-toggle" className="header-search-icon" title="Rechercher" aria-label="Rechercher sur le site">
            🔍
          </label>
        </div>
        <Link href="/" className="logo-center">
          <Image src="/logo.png" alt="Serge Hapita Ministries" width={207} height={78} priority />
        </Link>
        <div className="header-icon-zone right">
          <Link href={accountHref} title="Mon compte" style={{ color: "inherit" }}>
            👤
          </Link>
          <Link href="/panier" title="Panier" style={{ color: "inherit", position: "relative" }}>
            🛒
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -6,
                  right: -10,
                  background: "var(--purple)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 700,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
          <MobileNav nav={nav} />
        </div>
      </div>
      {/* Entre le logo et la barre de navigation, pleine largeur (retour du
          05/09, remplace le lien vers /recherche) — s'ouvre au clic sur la
          loupe. La soumission mène toujours à /recherche, qui fait la
          recherche réelle (publications, livres, goodies) : seul l'accès
          depuis l'en-tête change, pas la recherche elle-même. */}
      <div className="header-search-row">
        <form method="get" action="/recherche" className="header-search-form">
          <input type="search" name="q" placeholder="Rechercher un article, un livre…" aria-label="Rechercher sur le site" />
        </form>
      </div>
      <div className="nav-row">
        <nav className="main-nav">
          {nav.map((item) =>
            isDropdown(item) ? (
              <div key={item.label} className="dropdown">
                {item.href ? (
                  <Link href={item.href}>{item.label} ▾</Link>
                ) : (
                  <span>{item.label} ▾</span>
                )}
                <div className="dropdown-menu">
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
      </div>
    </header>
  );
}
