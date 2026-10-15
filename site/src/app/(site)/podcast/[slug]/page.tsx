import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPodcastEpisodeBySlug } from "@/lib/content/podcast";
import { getArticlesByIds, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import PodcastImmersivePlayer from "@/components/podcast/PodcastImmersivePlayer";
import PodcastShareActions from "@/components/podcast/PodcastShareActions";
import { buildPodcastShareMessage, formatPodcastDate } from "@/lib/podcast/shareMessage";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

/** Les robots sociaux téléchargent cette URL sans passer par le lecteur.
 * On leur sert une variante 1200 px, nettement plus légère que les PNG
 * originaux parfois proches de 3 Mo, tout en gardant la pochette originale
 * intacte dans la page d\'écoute. */
function socialCoverUrl(source: string): string {
  return `${SITE_URL}/_next/image?url=${encodeURIComponent(source)}&w=1200&q=75`;
}

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
  const originalImage = episode.share_image_url || episode.cover_url || episode.linked_article_cover_url || undefined;
  const image = originalImage ? socialCoverUrl(originalImage) : undefined;
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
      images: image ? [{ url: image, width: 1200, height: 1200, alt: `Pochette de ${episode.title}` }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function PodcastEpisodePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ecouter?: string }>;
}) {
  const [{ slug }, { ecouter }] = await Promise.all([params, searchParams]);
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) notFound();

  const [linkedArticle] = episode.linked_article_id ? await getArticlesByIds([episode.linked_article_id]) : [null];
  const episodeUrl = `${SITE_URL}/podcast/${episode.slug}`;
  const sharedEpisodeUrl = `${episodeUrl}?ecouter=1`;
  const shareMessage = buildPodcastShareMessage({
    universe: episode.universe,
    title: episode.title,
    episodeDate: episode.episode_date,
    theme: episode.theme,
    verseReference: linkedArticle?.verse_reference,
  });
  const listenMode = ecouter === "1";
  const coverUrl = episode.cover_url || episode.linked_article_cover_url;
  const formattedDate = formatPodcastDate(episode.episode_date);
  const pageStyle = coverUrl
    ? ({ "--podcast-cover-environment": `url("${coverUrl}")` } as CSSProperties)
    : undefined;

  return (
    <div
      className={`v2-podcast-page v2-podcast-listening-page ${episode.universe}${coverUrl ? " has-cover-environment" : ""}${listenMode ? " is-share-listen-mode" : ""}`}
      style={pageStyle}
    >
      <main className="v2-podcast-listening-stage">
        <div className="v2-wrap v2-podcast-listening-shell">
          <div className="v2-podcast-listening-topbar">
            <Link href="/podcast" className="v2-podcast-listening-back">
              <span aria-hidden="true">←</span> Bibliothèque audio
            </Link>
            <PodcastShareActions title={episode.title} message={shareMessage} url={sharedEpisodeUrl} />
          </div>

          <div className="v2-podcast-listening-layout">
            <PodcastImmersivePlayer src={episode.audio_url} title={episode.title} coverUrl={coverUrl} autoPlay={listenMode} />

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
