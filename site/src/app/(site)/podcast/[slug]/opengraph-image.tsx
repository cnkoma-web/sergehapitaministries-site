import { getPodcastEpisodeBySlug } from "@/lib/content/podcast";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Podcast";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) return renderOgImage({ eyebrow: "Podcast", title: "Podcast" });
  return renderOgImage({
    category: episode.universe,
    title: episode.title,
    coverImageUrl: episode.share_image_url ?? episode.cover_url ?? undefined,
  });
}
