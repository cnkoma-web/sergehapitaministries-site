import { getConfessionDuJour } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Je Confesse";

// V2 (Lot 4, 11/09) — calqué sur rosee-matinale/opengraph-image.tsx.
export default async function Image() {
  const entry = await getConfessionDuJour();
  return renderOgImage({
    category: "jc",
    title: entry?.title ?? "Je Confesse",
    coverImageUrl: entry?.cover_url ?? undefined,
  });
}
