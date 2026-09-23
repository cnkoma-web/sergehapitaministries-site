import { getPublishedArticles } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Que dit la Bible ?";
export default async function Image() {
  const entry = (await getPublishedArticles("qdlb"))[0];
  return renderOgImage({ category: "qdlb", title: entry?.title ?? "Que dit la Bible ?", coverImageUrl: entry?.cover_url ?? undefined });
}
