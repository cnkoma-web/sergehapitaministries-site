import type { Metadata } from "next";
import { officialUrl, socialImageUrl } from "@/lib/socialMetadata";
import { notFound } from "next/navigation";
import { getPublishedArticles, getLatestNonRoseeArticles } from "@/lib/content/articles";
import ViewTracker from "@/components/articles/ViewTracker";
import RoseeMatinaleContent from "../RoseeMatinaleContent";

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const entries = await getPublishedArticles("rm");
  const current = entries.find((e) => e.article_date === date);
  if (!current) return {};
  // current.title (retour du 07/09) — remplace un titre reconstruit ici même
  // depuis la date, trouvé pendant la revue du nouveau champ "Titre" Rosée
  // Matinale : un endroit de plus qui utilisait la date en guise de titre
  // sans que Serge s'en aperçoive (page inchangée à l'écran, seul l'onglet
  // du navigateur/le partage sur les réseaux le montraient).
  const title = `${current.title} | Serge Hapita Ministries`;
  const description = current.verse_text || "Une nouvelle pensée chaque jour, directement inspirée de la Parole.";
  const socialImage = await socialImageUrl(`/rosee-matinale/${date}/opengraph-image`);
  return {
    title,
    description,
    keywords: current.seo_keywords.length > 0 ? current.seo_keywords : undefined,
    // Une vraie URL par jour (retour du 05/09, restructuration) — chaque
    // entrée de l'archive a désormais sa propre adresse permanente, donc sa
    // propre image de partage générée (voir opengraph-image.tsx ici), enfin
    // fidèle au jour réellement partagé.
    alternates: { canonical: officialUrl(`/rosee-matinale/${date}`) },
    openGraph: { type: "website", title, description, url: officialUrl(`/rosee-matinale/${date}`), siteName: "Serge Hapita Ministries", locale: "fr_FR", images: [{ url: socialImage, width: 1200, height: 630, type: "image/png" }] },
    twitter: { card: "summary_large_image", title, description, images: [{ url: socialImage, width: 1200, height: 630, type: "image/png" }] },
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
  // "Autres articles similaires" (retour du 07/09) — jamais d'autres entrées
  // Rosée Matinale, uniquement Que Dit la Bible / La Vie Supérieure.
  const relatedArticles = await getLatestNonRoseeArticles(3);

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
        relatedArticles={relatedArticles}
      />
    </>
  );
}
