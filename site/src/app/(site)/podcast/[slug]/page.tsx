import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPodcastEpisodeBySlug } from "@/lib/content/podcast";
import { getArticlesByIds, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import PodcastShareActions from "@/components/podcast/PodcastShareActions";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

// Lien vers le contenu écrit associé (cahier §Lot 9) — chaque type
// d'article a sa propre route, pas un seul gabarit /publications/[slug]
// pour tous (Rosée Matinale et Je Confesse ont chacun leur route dédiée).
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
  return {
    title,
    description,
    alternates: { canonical: `/podcast/${episode.slug}` },
    openGraph: { type: "website", title, description, url: `/podcast/${episode.slug}`, siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PodcastEpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = await getPodcastEpisodeBySlug(slug);
  if (!episode) notFound();

  const [linkedArticle] = episode.linked_article_id ? await getArticlesByIds([episode.linked_article_id]) : [null];
  const episodeUrl = `${SITE_URL}/podcast/${episode.slug}`;
  const shareMessage = `Serge Hapita partage avec toi ${ARTICLE_TYPE_LABEL[episode.universe]} : ${episode.title}. ${episodeUrl}`;

  return (
    // V2 (Lot 9, 11/09) — pas de maquette dédiée pour la fiche détail dans
    // le dossier (la maquette ne montre que la bibliothèque avec ses
    // cartes) : gabarit cohérent avec le reste du site (même héros sombre
    // que .v2-article-page), à signaler si Serge souhaite un écran dédié.
    <div className="v2-podcast-page">
      <section className="v2-podcast-detail-hero">
        <div className="v2-wrap">
          <span className={`feed-badge ${episode.universe}`}>{ARTICLE_TYPE_LABEL[episode.universe]}</span>
          <h1>{episode.title}</h1>
          {episode.theme && <p>{episode.theme}</p>}
        </div>
      </section>

      <section className="v2-podcast-detail-body">
        <div className="v2-wrap v2-podcast-detail-player">
          <audio className="v2-podcast-audio" controls src={episode.audio_url} preload="none">
            <track kind="captions" />
          </audio>

          <div className="v2-podcast-card-bottom">
            {linkedArticle ? (
              <Link href={linkedContentHref(linkedArticle.type, linkedArticle.slug, linkedArticle.article_date)} className="v2-podcast-detail-link">
                Lire le contenu écrit associé →
              </Link>
            ) : (
              <span />
            )}
            <PodcastShareActions title={episode.title} message={shareMessage} url={episodeUrl} />
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
