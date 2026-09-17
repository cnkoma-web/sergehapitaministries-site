import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // Branche v2-interface : la préversion doit montrer la maquette
      // normative elle-même avant son raccordement définitif aux données.
      // Ces réécritures n'existent pas sur la branche de production.
      beforeFiles: [
        { source: "/", destination: "/maquette-root.html" },
        { source: "/auth/confirm", destination: "/auth/confirm/index.html" },
        { source: "/boutique", destination: "/boutique/index.html" },
        { source: "/boutique/t-shirt-voix-prophetique", destination: "/boutique/t-shirt-voix-prophetique/index.html" },
        { source: "/compte", destination: "/compte/index.html" },
        { source: "/compte/compte-active", destination: "/compte/compte-active/index.html" },
        { source: "/compte/email-envoye", destination: "/compte/email-envoye/index.html" },
        { source: "/compte/mot-de-passe-modifie", destination: "/compte/mot-de-passe-modifie/index.html" },
        { source: "/compte/mot-de-passe-oublie", destination: "/compte/mot-de-passe-oublie/index.html" },
        { source: "/compte/nouveau-mot-de-passe", destination: "/compte/nouveau-mot-de-passe/index.html" },
        { source: "/compte/verification-email", destination: "/compte/verification-email/index.html" },
        { source: "/confirmation", destination: "/confirmation/index.html" },
        { source: "/connaitre-jesus", destination: "/connaitre-jesus/index.html" },
        { source: "/contact", destination: "/contact/index.html" },
        { source: "/de-serge", destination: "/de-serge/index.html" },
        { source: "/invitation", destination: "/invitation/index.html" },
        { source: "/livres", destination: "/livres/index.html" },
        { source: "/livres/manifester-ce-que-dieu-a-prevu", destination: "/livres/manifester-ce-que-dieu-a-prevu/index.html" },
        { source: "/mentions-legales", destination: "/mentions-legales/index.html" },
        { source: "/mission", destination: "/mission/index.html" },
        { source: "/mon-compte", destination: "/mon-compte/index.html" },
        { source: "/panier", destination: "/panier/index.html" },
        { source: "/partenariat", destination: "/partenariat/index.html" },
        { source: "/podcast", destination: "/podcast/index.html" },
        { source: "/politique-de-confidentialite", destination: "/politique-de-confidentialite/index.html" },
        { source: "/politique-de-cookies", destination: "/politique-de-cookies/index.html" },
        { source: "/publications", destination: "/publications/index.html" },
        { source: "/publications/je-confesse-et-declare", destination: "/publications/je-confesse-et-declare/index.html" },
        { source: "/publications/la-vie-superieure", destination: "/publications/la-vie-superieure/index.html" },
        { source: "/publications/nouvel-article-61cdg", destination: "/publications/nouvel-article-61cdg/index.html" },
        { source: "/publications/nouvel-article-ozsqc", destination: "/publications/nouvel-article-ozsqc/index.html" },
        { source: "/publications/que-dit-la-bible", destination: "/publications/que-dit-la-bible/index.html" },
        { source: "/rosee-matinale", destination: "/rosee-matinale/index.html" },
        { source: "/termes-et-conditions", destination: "/termes-et-conditions/index.html" },
        { source: "/videos", destination: "/videos/index.html" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Supabase Storage — couvertures de livres et photos produits uploadées
        // via l'admin (buckets book-covers / product-photos, cahier §1.4).
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
