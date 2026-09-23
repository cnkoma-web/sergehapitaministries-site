import { getRoseeDuJour } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const dynamic = "force-dynamic";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Rosée Matinale";

// Cette route (sans segment de date) ne représente qu'une seule chose :
// l'entrée du jour courant — reflète donc toujours "aujourd'hui" par
// conception, jamais un autre jour (voir /rosee-matinale/[date]/
// opengraph-image.tsx pour l'archive, retour du 05/09, restructuration en
// URL par jour qui a résolu la limitation qui existait ici auparavant).
export default async function Image() {
  const entry = await getRoseeDuJour();
  return renderOgImage({
    category: "rm",
    title: entry?.title ?? "Rosée Matinale",
    coverImageUrl: entry?.cover_url ?? undefined,
  });
}
