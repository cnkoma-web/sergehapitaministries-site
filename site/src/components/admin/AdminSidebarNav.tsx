"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/admin/livres", label: "Livres" },
  { href: "/admin/boutique", label: "Boutique" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/rosee-matinale", label: "Rosée Matinale" },
  { href: "/admin/videos", label: "Vidéos" },
  { href: "/admin/avis", label: "Avis" },
  { href: "/admin/ticker", label: "Ticker" },
  { href: "/admin/stats", label: "Statistiques" },
  { href: "/admin/textes", label: "Textes" },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <>
      {SECTIONS.map((s) => (
        <Link key={s.href} href={s.href} className={pathname.startsWith(s.href) ? "active" : undefined}>
          {s.label}
        </Link>
      ))}
    </>
  );
}
