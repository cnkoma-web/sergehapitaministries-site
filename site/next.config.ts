import type { NextConfig } from "next";

const legacyRedirects = [
  { source: "/à-propos", destination: "/de-serge" },
  { source: "/a-propos", destination: "/de-serge" },
  { source: "/category/livres-chretiens", destination: "/livres" },
  { source: "/services-4-1", destination: "/videos" },
  { source: "/blog", destination: "/publications" },
  { source: "/category/all-products", destination: "/boutique" },
  { source: "/shop", destination: "/boutique" },
  {
    source: "/product-page/tu-deviens-ce-que-tu-connais",
    destination: "/livres/tu-deviens-ce-que-tu-connais",
  },
  {
    source: "/product-page/pourquoi-suis-je-ne-de-nouveau",
    destination: "/livres/pourquoi-suis-je-ne-de-nouveau",
  },
  {
    source: "/product-page/manifester-ce-que-dieu-a-prevu",
    destination: "/livres/manifester-ce-que-dieu-a-prevu",
  },
  {
    source: "/product-page/les-hauts-lieux-dans-le-culte-moderne",
    destination: "/livres/les-hauts-lieux-dans-le-culte-moderne",
  },
  {
    source: "/product-page/ton-corps-t-ecoute-quand-la-parole-recree-l-adn",
    destination: "/livres/ton-corps-t-ecoute",
  },
  {
    source:
      "/product-page/david-le-fugitif-du-royaume-l-invisible-ascension",
    destination: "/livres/david-le-fugitif-du-royaume-vol-1",
  },
  {
    source: "/product-page/marcher-dans-la-foi-qui-plait-a-dieu-volet-2",
    destination: "/livres/marcher-dans-la-foi-volet-2",
  },
  { source: "/product-page/:slug*", destination: "/livres" },
  { source: "/post/:slug*", destination: "/publications" },
] as const;

const nextConfig: NextConfig = {
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
  async redirects() {
    return legacyRedirects.map((redirect) => ({
      ...redirect,
      permanent: true,
    }));
  },
};

export default nextConfig;
