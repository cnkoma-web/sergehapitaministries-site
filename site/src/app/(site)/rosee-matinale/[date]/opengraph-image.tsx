import { getPublishedArticles } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Rosée Matinale";

// Correctif (retour du 05/09, restructuration en URL par jour) — jusqu'ici,
// /rosee-matinale/opengraph-image.tsx ne pouvait refléter que l'entrée du
// jour courant : un fichier spécial Next.js ne reçoit que les segments de
// route (params), jamais la query string ("?date="). Avec une vraie URL par
// jour, [date] est un paramètre de route, donc disponible ici — l'image
// générée montre enfin le jour réellement partagé.
export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const entries = await getPublishedArticles("rm");
  const entry = entries.find((e) => e.article_date === date);
  return renderOgImage({
    category: "rm",
    title: entry?.verse_text?.slice(0, 140) ?? "La pensée du jour",
  });
}
