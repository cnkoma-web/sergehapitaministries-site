import type { MetadataRoute } from "next";

const SITE_URL = "https://sergehapitaministries.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Pages utilitaires/privées sans intérêt éditorial pour un moteur de
      // recherche (compte, panier, confirmation de paiement, admin).
      disallow: ["/admin", "/mon-compte", "/panier", "/confirmation", "/compte/nouveau-mot-de-passe"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
