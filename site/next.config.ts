import type { NextConfig } from "next";

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
};

export default nextConfig;
