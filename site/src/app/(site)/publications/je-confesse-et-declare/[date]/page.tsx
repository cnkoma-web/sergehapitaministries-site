import type { Metadata } from "next";
import { officialUrl, socialImageUrl } from "@/lib/socialMetadata";
import { notFound } from "next/navigation";
import { getPublishedArticles, getLatestNonRoseeArticles } from "@/lib/content/articles";
import ViewTracker from "@/components/articles/ViewTracker";
import JeConfesseContent from "../JeConfesseContent";

// V2 (Lot 4, 11/09) — calqué sur rosee-matinale/[date]/page.tsx.
export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const entries = await getPublishedArticles("jc");
  const current = entries.find((e) => e.article_date === date);
  if (!current) return {};
  const title = `${current.title} | Serge Hapita Ministries`;
  const description = current.verse_text || "La proclamation du jour — Je Confesse.";
  const socialImage = await socialImageUrl(`/publications/je-confesse-et-declare/${date}/opengraph-image`);
  return {
    title,
    description,
    keywords: current.seo_keywords.length > 0 ? current.seo_keywords : undefined,
    alternates: { canonical: officialUrl(`/publications/je-confesse-et-declare/${date}`) },
    openGraph: {
      type: "website",
      title,
      description,
      url: officialUrl(`/publications/je-confesse-et-declare/${date}`),
      siteName: "Serge Hapita Ministries",
      locale: "fr_FR",
      images: [socialImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default async function JeConfesseDatePage({
  params,
  searchParams,
}: {
  params: Promise<{ date: string }>;
  searchParams: Promise<{ archivePage?: string }>;
}) {
  const { date } = await params;
  const { archivePage } = await searchParams;
  const entries = await getPublishedArticles("jc");
  const currentIndex = entries.findIndex((e) => e.article_date === date);
  if (currentIndex === -1) notFound();

  const current = entries[currentIndex];
  const previous = entries[currentIndex + 1] ?? null;
  const next = entries[currentIndex - 1] ?? null;
  const archive = entries.filter((_, i) => i !== currentIndex);
  const archivePageNum = Math.max(1, Number(archivePage) || 1);
  const relatedArticles = await getLatestNonRoseeArticles(3);

  return (
    <>
      <ViewTracker articleId={current.id} />
      <JeConfesseContent
        current={current}
        previous={previous}
        next={next}
        archive={archive}
        archivePageNum={archivePageNum}
        basePath={`/publications/je-confesse-et-declare/${date}`}
        relatedArticles={relatedArticles}
      />
    </>
  );
}
