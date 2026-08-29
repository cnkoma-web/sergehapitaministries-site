"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/admin", label: "Tableau de bord", exact: true },
  { href: "/admin/livres", label: "Livres" },
  { href: "/admin/boutique", label: "Boutique" },
  { href: "/admin/publications", label: "Publications" },
  { href: "/admin/categories", label: "Catégories" },
  { href: "/admin/rosee-matinale", label: "Rosée Matinale" },
  { href: "/admin/videos", label: "Vidéos" },
  { href: "/admin/avis", label: "Avis" },
  { href: "/admin/commandes", label: "Commandes" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/invitations", label: "Invitations" },
  { href: "/admin/ticker", label: "Ticker" },
  { href: "/admin/stats", label: "Statistiques" },
  { href: "/admin/textes", label: "Textes" },
  { href: "/admin/navigation", label: "Navigation" },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();
  return (
    <>
      {SECTIONS.map((s) => (
        <Link key={s.href} href={s.href} className={(s.exact ? pathname === s.href : pathname.startsWith(s.href)) ? "active" : undefined}>
          {s.label}
        </Link>
      ))}
    </>
  );
}
