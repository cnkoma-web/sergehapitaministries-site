// ⚠️ TEMPORAIRE (Phase 1) — voir nav.ts : à migrer vers `interface_texts` en Phase 2.

export type FooterLink = { label: string; href: string; external?: boolean };

export function getFooterColumns(): { title: string; links: FooterLink[] }[] {
  return [
    {
      title: "Le site",
      links: [
        { label: "De Serge", href: "/de-serge" },
        { label: "Livres", href: "/livres" },
        { label: "Publications", href: "/publications" },
        { label: "Boutique", href: "/boutique" },
      ],
    },
    {
      title: "Ministère",
      links: [
        { label: "Invitation", href: "/invitation" },
        { label: "Partenariat", href: "/partenariat" },
        { label: "Connaître Jésus", href: "/connaitre-jesus" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Réseaux",
      links: [
        { label: "YouTube", href: "https://www.youtube.com/@sergehapita", external: true },
        { label: "Instagram", href: "https://www.instagram.com/sergehapitaministries/", external: true },
        { label: "TikTok", href: "https://www.tiktok.com/@sergehapitaministries", external: true },
        { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61582211394401", external: true },
      ],
    },
  ];
}

export function getLegalLinks(): FooterLink[] {
  return [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
    { label: "Politique de cookies", href: "/politique-de-cookies" },
    { label: "Termes et conditions", href: "/termes-et-conditions" },
  ];
}
