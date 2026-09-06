import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedArticles } from "@/lib/content/articles";
import ViewTracker from "@/components/articles/ViewTracker";
import RoseeMatinaleContent from "../RoseeMatinaleContent";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const entries = await getPublishedArticles("rm");
  const current = entries.find((e) => e.article_date === date);
  if (!current) return {};
  const dateLabel = new Date(current.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
  const title = `Rosée Matinale — ${dateLabel} | Serge Hapita Ministries`;
  const description = current.verse_text || "Une nouvelle pensée chaque jour, directement inspirée de la Parole.";
  return {
    title,
    description,
    keywords: current.seo_keywords.length > 0 ? current.seo_keywords : undefined,
    // Une vraie URL par jour (retour du 05/09, restructuration) — chaque
    // entrée de l'archive a désormais sa propre adresse permanente, donc sa
    // propre image de partage générée (voir opengraph-image.tsx ici), enfin
    // fidèle au jour réellement partagé.
    alternates: { canonical: `/rosee-matinale/${date}` },
    openGraph: { type: "website", title, description, url: `/rosee-matinale/${date}`, siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoseeMatinaleDatePage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ archivePage?: string }>;
}) {
  const { date } = await params;
  const { archivePage } = await searchParams;
  const entries = await getPublishedArticles("rm"); // triées du plus récent au plus ancien
  const currentIndex = entries.findIndex((e) => e.article_date === date);
  // Contrairement à l'ancien "?date=" (qui retombait silencieusement sur le
  // jour courant si la valeur ne correspondait à rien), une URL dédiée à un
  // jour précis qui n'existe pas est une vraie 404 — même principe que
  // /publications/[slug] pour un slug inconnu.
  if (currentIndex === -1) notFound();

  const current = entries[currentIndex];
  // Triées du plus récent au plus ancien : l'entrée "précédente" (plus
  // ancienne) est à l'index+1, la "suivante" (plus récente) est à l'index-1.
  const previous = entries[currentIndex + 1] ?? null;
  const next = entries[currentIndex - 1] ?? null;
  const archive = entries.filter((_, i) => i !== currentIndex);
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
        next={next}
        archive={archive}
        archivePageNum={archivePageNum}
        basePath={`/rosee-matinale/${date}`}
      />
    </>
  );
}
