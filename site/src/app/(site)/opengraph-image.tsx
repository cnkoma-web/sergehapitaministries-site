import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Serge Hapita Ministries";

// Image par défaut pour toutes les pages du site public qui n'ont pas leur
// propre opengraph-image.tsx plus spécifique (livres/boutique/articles).
export default function Image() {
  return renderOgImage({
    eyebrow: "Prophète · Enseignant · Auteur",
    title: "Un ministère qui révèle Christ au croyant et affermit le chrétien dans l'identité de fils.",
  });
}
