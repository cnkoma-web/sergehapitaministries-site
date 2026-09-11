import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPublishedArticles, getLatestNonRoseeArticles } from "@/lib/content/articles";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ViewTracker from "@/components/articles/ViewTracker";
import JeConfesseContent from "./JeConfesseContent";

// V2 (Lot 4, 11/09) — calqué sur rosee-matinale/page.tsx (même principe
// exact : route fixe "aujourd'hui" + /[date] pour l'archive).
export async function generateMetadata(): Promise<Metadata> {
  const entries = await getPublishedArticles("jc");
  const current = entries[0];
  const title = `${current?.title ?? "Je Confesse"} | Serge Hapita Ministries`;
  const description = current?.verse_text || "La proclamation du jour — Je Confesse.";
  return {
    title,
    description,
    keywords: current?.seo_keywords && current.seo_keywords.length > 0 ? current.seo_keywords : undefined,
    alternates: { canonical: "/publications/je-confesse-et-declare" },
    openGraph: {
      type: "website",
      title,
      description,
      url: "/publications/je-confesse-et-declare",
      siteName: "Serge Hapita Ministries",
      locale: "fr_FR",
    },
    twitter: { card: "summary_large_image", title, description },
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

  const entries = await getPublishedArticles("jc");

  if (entries.length === 0) {
    return (
      <>
        <section className="util-hero">
          <div className="wrap">
            <h1>Je Confesse</h1>
            <p>Une proclamation chaque jour.</p>
          </div>
        </section>
        <section className="section">
          <div className="wrap" style={{ textAlign: "center" }}>
            <p className="empty-state">La première proclamation arrive bientôt.</p>
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
