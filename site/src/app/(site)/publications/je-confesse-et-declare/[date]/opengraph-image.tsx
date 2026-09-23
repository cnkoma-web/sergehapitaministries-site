import { headers } from "next/headers";
import { getPublishedArticles } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const dynamic = "force-dynamic";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Je Confesse";

// V2 (Lot 4, 11/09) — calqué sur rosee-matinale/[date]/opengraph-image.tsx.
export default async function Image({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const entries = await getPublishedArticles("jc");
  const entry = entries.find((e) => e.article_date === date);
  return renderOgImage({
    category: "jc",
    title: entry?.title ?? "Je Confesse",
    coverImageUrl: entry?.cover_url ?? undefined,
  });
}
