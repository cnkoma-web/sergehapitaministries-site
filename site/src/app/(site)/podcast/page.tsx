import type { Metadata } from "next";
import Link from "next/link";
import { getPodcastEpisodes, type PodcastUniverse } from "@/lib/content/podcast";
import { ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import PodcastShareActions from "@/components/podcast/PodcastShareActions";
import Pagination from "@/components/admin/Pagination";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Podcast | Serge Hapita Ministries";
const description = "Je Confesse, Que dit la Bible ?, Rosée Matinale et La Vie Supérieure à écouter.";
const PER_PAGE = 8; // Fixe (cahier §Lot 9, comme prototype-html/podcast/index.html data-page-size="8").

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/podcast" },
  openGraph: { type: "website", title, description, url: "/podcast", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

// Ordre + libellés des filtres = prototype-html/podcast/index.html §
// .podcast-filters : Tous, Je Confesse, Que dit la Bible ?, Rosée Matinale,
// La Vie Supérieure.
const FILTERS: { value: PodcastUniverse | "all"; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "jc", label: ARTICLE_TYPE_LABEL.jc },
  { value: "qdlb", label: ARTICLE_TYPE_LABEL.qdlb },
  { value: "rm", label: ARTICLE_TYPE_LABEL.rm },
  { value: "vs", label: ARTICLE_TYPE_LABEL.vs },
];

const SITE_URL = "https://sergehapitaministries.org";

export default async function PodcastPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; univers?: string }>;
}) {
  const { page: pageParam, univers } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const universe = (["qdlb", "vs", "rm", "jc"] as const).includes(univers as PodcastUniverse)
    ? (univers as PodcastUniverse)
    : undefined;

  const { episodes, total } = await getPodcastEpisodes(page, PER_PAGE, universe);

  return (
    // V2 (Lot 9, 11/09) — reproduit prototype-html/podcast/index.html §
    // .podcast-hero/.podcast-filters/.podcast-library/.podcast-grid. Les
    // filtres sont de vrais liens (?univers=…), pas un bouton JS côté
    // client (même principe que Pagination — fonctionne sans hydratation).
    // Pas de synchronisation Ausha (pas encore souscrit, confirmé le
    // 11/09) : épisodes saisis à la main dans /admin/podcast.
    <div className="v2-podcast-page">
      <section className="v2-podcast-hero">
        <div className="v2-wrap v2-podcast-hero-inner">
          <p className="v2-eyebrow light">
            <span /> Audio
          </p>
          <h1>Podcast</h1>
          <p>{description}</p>
          <nav className="v2-podcast-filters" aria-label="Filtrer les podcasts">
            {FILTERS.map((f) => (
              <Link
                key={f.value}
                href={f.value === "all" ? "/podcast" : `/podcast?univers=${f.value}`}
                className={(f.value === "all" && !universe) || f.value === universe ? "active" : undefined}
              >
                {f.label}
              </Link>
            ))}
          </nav>
        </div>
      </section>

      <section className="v2-podcast-library">
        <div className="v2-wrap">
          <div className="v2-podcast-library-head">
            <h2>La bibliothèque audio</h2>
            <p>Choisis un univers, retrouve un thème et lance l&apos;écoute.</p>
          </div>

          {episodes.length === 0 ? (
            <p className="empty-state">Les premiers épisodes arrivent bientôt.</p>
          ) : (
            <div className="v2-podcast-grid">
              {episodes.map((e) => {
                const episodeUrl = `${SITE_URL}/podcast/${e.slug}`;
                const shareMessage = `Serge Hapita partage avec toi ${ARTICLE_TYPE_LABEL[e.universe]} : ${e.title}. ${episodeUrl}`;
                return (
                  <article className={`v2-podcast-card ${e.universe}`} key={e.id}>
                    <div className="v2-podcast-share-card" aria-label={`Aperçu de la carte de partage ${ARTICLE_TYPE_LABEL[e.universe]}`}>
                      {e.cover_url && (
                        // eslint-disable-next-line @next/next/no-img-element -- fond décoratif en aplat de couleur, jamais l'image principale du contenu.
                        <img src={e.cover_url} alt="" />
                      )}
                      <span>{ARTICLE_TYPE_LABEL[e.universe]}</span>
                      <strong>{e.title}</strong>
                      <small>Serge Hapita Ministries</small>
                    </div>
                    <div className="v2-podcast-card-content">
                      <span className={`feed-badge ${e.universe}`}>{ARTICLE_TYPE_LABEL[e.universe]}</span>
                      <h3>
                        <Link href={`/podcast/${e.slug}`}>{e.title}</Link>
                      </h3>
                      {e.theme && <p>{e.theme}</p>}
                      <div className="v2-podcast-card-meta">
                        <span>{new Date(e.episode_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</span>
                        {e.duration_seconds ? <span>{Math.round(e.duration_seconds / 60)} min</span> : null}
                      </div>
                      <div className="v2-podcast-player-preview" aria-label="Aperçu du lecteur audio">
                        <span className="v2-podcast-play" aria-hidden="true">
                          ▶
                        </span>
                        <div className="v2-podcast-progress">
                          <span />
                        </div>
                        <time>{e.duration_seconds ? `${Math.round(e.duration_seconds / 60)}:00` : "0:00"}</time>
                      </div>
                      <div className="v2-podcast-card-bottom">
                        {e.linked_article_id ? (
                          <Link href={`/podcast/${e.slug}`} className="v2-podcast-detail-link">
                            Écouter l&apos;épisode →
                          </Link>
                        ) : (
                          <Link href={`/podcast/${e.slug}`}>Écouter l&apos;épisode →</Link>
                        )}
                        <PodcastShareActions title={e.title} message={shareMessage} url={episodeUrl} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {total > 0 && (
            <div className="v2-podcast-pagination">
              <Pagination
                page={page}
                perPage={PER_PAGE}
                total={total}
                basePath="/podcast"
                showPerPageSelector={false}
                extraParams={universe ? { univers: universe } : undefined}
              />
            </div>
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
