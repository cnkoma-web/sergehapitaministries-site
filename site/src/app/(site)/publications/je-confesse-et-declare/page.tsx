import type { Metadata } from "next";
import { officialUrl, socialImageUrl } from "@/lib/socialMetadata";
import { redirect } from "next/navigation";
import { getPublishedArticles, getLatestNonRoseeArticles } from "@/lib/content/articles";
import { getPageContent } from "@/lib/content/pageContent";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ViewTracker from "@/components/articles/ViewTracker";
import JeConfesseContent from "./JeConfesseContent";

// V2 (Lot 4, 11/09) — calqué sur rosee-matinale/page.tsx (même principe
// exact : route fixe "aujourd'hui" + /[date] pour l'archive).
export async function generateMetadata(): Promise<Metadata> {
  const [entries, pageContent] = await Promise.all([
    getPublishedArticles("jc"),
    getPageContent("je-confesse"),
  ]);
  const current = entries[0];
  const title = `${current?.title ?? "Je Confesse"} | Serge Hapita Ministries`;
  const description = current?.verse_text || "La proclamation du jour — Je Confesse.";
  const socialImage = await socialImageUrl(`/publications/je-confesse-et-declare/opengraph-image`);
  return {
    title,
    description,
    keywords: current?.seo_keywords && current.seo_keywords.length > 0 ? current.seo_keywords : undefined,
    alternates: { canonical: officialUrl("/publications/je-confesse-et-declare") },
    openGraph: {
      type: "website",
      title,
      description,
      url: officialUrl("/publications/je-confesse-et-declare"),
      siteName: "Serge Hapita Ministries",
      locale: "fr_FR",
      images: [socialImage],
    },
    twitter: { card: "summary_large_image", title, description, images: [socialImage] },
  };
}

export default async function JeConfessePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; archivePage?: string }>;
}) {
  const { date, archivePage } = await searchParams;
  if (date) {
    redirect(`/publications/je-confesse-et-declare/${date}${archivePage ? `?archivePage=${archivePage}` : ""}`);
  }

  const [entries, pageContent] = await Promise.all([
    getPublishedArticles("jc"),
    getPageContent("je-confesse"),
  ]);

  if (entries.length === 0) {
    return (
      <>
        <section className="util-hero">
          <div className="wrap">
            <h1>{pageContent.title}</h1>
            <p>{pageContent.intro}</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <p className="empty-state">{pageContent.empty_state}</p>
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
  // "Autres articles similaires" — jamais d'autres entrées Je Confesse,
  // même principe que Rosée Matinale (getLatestNonRoseeArticles renvoie
  // Que Dit la Bible / La Vie Supérieure, valable pour les deux capsules
  // du jour).
  const relatedArticles = await getLatestNonRoseeArticles(3);

  return (
    <>
      <ViewTracker articleId={current.id} />
      <JeConfesseContent
        current={current}
        previous={previous}
        next={null}
        archive={archive}
        archivePageNum={archivePageNum}
        basePath="/publications/je-confesse-et-declare"
        relatedArticles={relatedArticles}
      />
    </>
  );
}
