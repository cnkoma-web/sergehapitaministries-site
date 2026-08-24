import { getInterfaceTexts } from "./interfaceTexts";

// Structure des colonnes du footer : reste dans le code (architecture du site),
// comme pour nav.ts. Description, copyright et liens réseaux sont pilotables
// via `interface_texts`.

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
      links: [] as FooterLink[], // rempli dynamiquement par getSocialLinks()
    },
  ];
}

export async function getSocialLinks(): Promise<FooterLink[]> {
  const texts = await getInterfaceTexts();
  const defaults: Record<string, string> = {
    "social.youtube": "https://www.youtube.com/@sergehapita",
    "social.instagram": "https://www.instagram.com/sergehapitaministries/",
    "social.tiktok": "https://www.tiktok.com/@sergehapitaministries",
    "social.facebook": "https://www.facebook.com/profile.php?id=61582211394401",
  };
  const labels: Record<string, string> = {
    "social.youtube": "YouTube",
    "social.instagram": "Instagram",
    "social.tiktok": "TikTok",
    "social.facebook": "Facebook",
  };
  return Object.keys(defaults).map((key) => ({
    label: labels[key],
    href: texts[key] ?? defaults[key],
    external: true,
  }));
}

export async function getFooterTexts(): Promise<{ description: string; copyright: string }> {
  const texts = await getInterfaceTexts();
  const year = new Date().getFullYear();
  return {
    description:
      texts["footer.description"] ??
      "Levallois-Perret, France — un ministère qui révèle Christ au croyant, affermit le chrétien dans l'identité de fils, manifeste Dieu, le Père céleste.",
    copyright: (texts["footer.copyright"] ?? "© {year} Serge Hapita Ministries — Levallois-Perret, France").replace(
      "{year}",
      String(year)
    ),
  };
}

export function getLegalLinks(): FooterLink[] {
  return [
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
    { label: "Politique de cookies", href: "/politique-de-cookies" },
    { label: "Termes et conditions", href: "/termes-et-conditions" },
  ];
}
