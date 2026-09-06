import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedArticles } from "@/lib/content/articles";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ViewTracker from "@/components/articles/ViewTracker";
import RoseeMatinaleContent from "./RoseeMatinaleContent";

export async function generateMetadata(): Promise<Metadata> {
  const entries = await getPublishedArticles("rm");
  const current = entries[0];
  const dateLabel = current
    ? new Date(current.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "";
  const title = `Rosée Matinale${dateLabel ? ` — ${dateLabel}` : ""} | Serge Hapita Ministries`;
  const description = current?.verse_text || "Une nouvelle pensée chaque jour, directement inspirée de la Parole.";
  // Toujours l'entrée du jour courant, jamais un jour précis (cette route n'a
  // pas de segment de date — voir /rosee-matinale/[date] pour l'archive,
  // retour du 05/09, restructuration en URL par jour). L'image de partage
  // générée par opengraph-image.tsx reflète donc, elle aussi, toujours
  // aujourd'hui — cohérent avec le sens de cette URL fixe et permanente.
  return {
    title,
    description,
    keywords: current?.seo_keywords && current.seo_keywords.length > 0 ? current.seo_keywords : undefined,
    alternates: { canonical: "/rosee-matinale" },
    openGraph: { type: "website", title, description, url: "/rosee-matinale", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoseeMatinalePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; archivePage?: string }>;
}) {
  const { date, archivePage } = await searchParams;
  // Ancien lien "?date=" (avant la restructuration en URL par jour, retour du
  // 05/09) — redirigé vers la nouvelle URL propre pour que les liens déjà
  // partagés continuent de fonctionner, et pour que l'image de partage
  // générée reflète enfin le bon jour (impossible tant que le jour restait
  // dans la query string plutôt que dans l'URL elle-même).
  if (date) {
    redirect(`/rosee-matinale/${date}${archivePage ? `?archivePage=${archivePage}` : ""}`);
  }

  const entries = await getPublishedArticles("rm"); // triées du plus récent au plus ancien

  if (entries.length === 0) {
    return (
      <>
        <section className="util-hero">
          <div className="wrap">
            <h1>Rosée Matinale</h1>
            <p>Une nouvelle pensée chaque jour.</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <p className="empty-state">La première entrée arrive bientôt.</p>
          </div>
        </section>
        <Newsletter />
        <Footer variant="light" />
      </>
    );
  }

  const current = entries[0];
  const previous = entries[1] ?? null;
  const archive = entries.slice(1);
  const archivePageNum = Math.max(1, Number(archivePage) || 1);

  return (
    <>
      {/* Vue comptabilisée côté client, une fois par visiteur/jour (retour
          du 06/09) — voir ViewTracker. Remplace l'ancien incrementViewCount()
          appelé pendant le rendu serveur, qui comptait aussi les
          rechargements de vérification. */}
      <ViewTracker articleId={current.id} />
      <RoseeMatinaleContent
        current={current}
        previous={previous}
        next={null}
        archive={archive}
        archivePageNum={archivePageNum}
        basePath="/rosee-matinale"
      />
    </>
  );
}
