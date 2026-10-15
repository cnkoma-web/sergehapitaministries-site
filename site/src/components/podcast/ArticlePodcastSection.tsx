import Link from "next/link";
import { getPodcastEpisodeForArticle } from "@/lib/content/podcast";
import PodcastInlinePlayButton from "@/components/podcast/PodcastInlinePlayButton";

export default async function ArticlePodcastSection({
  articleId,
  podcastEpisodeId,
}: {
  articleId: string;
  podcastEpisodeId?: string | null;
}) {
  const episode = await getPodcastEpisodeForArticle(articleId, podcastEpisodeId);
  if (!episode) return null;

  return (
    <section className="v2-jc-audio" aria-label="Version audio de la publication">
      <div className="v2-wrap v2-jc-audio-inner">
        <PodcastInlinePlayButton src={episode.audio_url} title={episode.title} />
        <div>
          <p>Version audio</p>
          <h2>Écouter cette publication</h2>
          <span>Retrouve ce contenu dans la bibliothèque Podcast.</span>
        </div>
        <Link href={`/podcast/${episode.slug}`}>Écouter le podcast →</Link>
      </div>
    </section>
  );
}
