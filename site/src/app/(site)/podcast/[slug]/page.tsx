import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPodcastEpisodeBySlug } from "@/lib/content/podcast";
import { getArticlesByIds, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import PodcastImmersivePlayer from "@/components/podcast/PodcastImmersivePlayer";
import PodcastShareActions from "@/components/podcast/PodcastShareActions";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

function linkedContentHref(type: string, slug: string, articleDate: string): string {
  if (type === "rm") return `/rosee-matinale/${articleDate}`;
  if (type === "jc") return "/publications/je-confesse-et-declare";
  return `/publications/${slug}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) return { title: "Podcast | Serge Hapita Ministries" };
  const title = `${episode.title} | Podcast | Serge Hapita Ministries`;
  const description = episode.theme || `${ARTICLE_TYPE_LABEL[episode.universe]} à écouter — Serge Hapita Ministries.`;
  const image = episode.share_image_url || episode.cover_url || episode.linked_article_cover_url || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/podcast/${episode.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/podcast/${episode.slug}`,
      siteName: "Serge Hapita Ministries",
      locale: "fr_FR",
      images: image ? [{ url: image }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function PodcastEpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) notFound();

  const [linkedArticle] = episode.linked_article_id ? await getArticlesByIds([episode.linked_article_id]) : [null];
  const episodeUrl = `${SITE_URL}/podcast/${episode.slug}`;
  const shareMessage = `Serge Hapita partage avec toi ${ARTICLE_TYPE_LABEL[episode.universe]} : ${episode.title}. ${episodeUrl}`;
  const coverUrl = episode.cover_url || episode.linked_article_cover_url;
  const formattedDate = new Date(episode.episode_date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className={`v2-podcast-page v2-podcast-listening-page ${episode.universe}`}>
      <main className="v2-podcast-listening-stage">
        <div className="v2-wrap v2-podcast-listening-shell">
          <div className="v2-podcast-listening-topbar">
            <Link href="/podcast" className="v2-podcast-listening-back">
              <span aria-hidden="true">←</span> Bibliothèque audio
            </Link>
            <PodcastShareActions title={episode.title} message={shareMessage} url={episodeUrl} />
          </div>

          <div className="v2-podcast-listening-layout">
            <PodcastImmersivePlayer src={episode.audio_url} title={episode.title} coverUrl={coverUrl} />

            <div className="v2-podcast-listening-copy">
              <div className="v2-podcast-listening-meta">
                <span>{ARTICLE_TYPE_LABEL[episode.universe]}</span>
                <time dateTime={episode.episode_date}>{formattedDate}</time>
              </div>
              <h1>{episode.title}</h1>
              {episode.theme && <p>{episode.theme}</p>}
              {linkedArticle && (
                <Link
                  href={linkedContentHref(linkedArticle.type, linkedArticle.slug, linkedArticle.article_date)}
                  className="v2-podcast-written-link"
                >
                  Lire le contenu écrit associé <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
