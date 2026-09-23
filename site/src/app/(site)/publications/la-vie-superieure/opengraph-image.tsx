import { getPublishedArticles } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "La Vie Supérieure";
export default async function Image() {
  const entry = (await getPublishedArticles("vs"))[0];
  return renderOgImage({ category: "vs", title: entry?.title ?? "La Vie Supérieure", coverImageUrl: entry?.cover_url ?? undefined });
}
