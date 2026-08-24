import Image from "next/image";
import Link from "next/link";
import { getMainNav, isDropdown } from "@/lib/content/nav";
import MobileNav from "./MobileNav";

export default async function Header() {
  const nav = await getMainNav();

  return (
    <header>
      <div className="header-main">
        <div className="header-icon-zone">
          <span title="Rechercher">🔍</span>
        </div>
        <Link href="/" className="logo-center">
          <Image src="/logo.png" alt="Serge Hapita Ministries" width={207} height={78} priority />
        </Link>
        <div className="header-icon-zone right">
          <Link href="/compte" title="Mon compte" style={{ color: "inherit" }}>
            👤
          </Link>
          <span title="Panier">🛒</span>
          <MobileNav nav={nav} />
        </div>
      </div>
      <div className="nav-row">
        <nav className="main-nav">
          {nav.map((item) =>
            isDropdown(item) ? (
              <div key={item.label} className="dropdown">
                <span>{item.label} ▾</span>
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
