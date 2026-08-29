import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const title = "Publications | Serge Hapita Ministries";
const description = "Rosée Matinale, Que Dit la Bible ? et La Vie Supérieure — trois formats, un seul message.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/publications" },
  openGraph: { type: "website", title, description, url: "/publications", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
  twitter: { card: "summary_large_image", title, description },
};

export default async function PublicationsPage() {
  const [qdlbArticles, vsArticles] = await Promise.all([getPublishedArticles("qdlb"), getPublishedArticles("vs")]);

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Publications</h1>
          <p>{description}</p>
        </div>
      </section>

      <section className="pub-category" id="que-dit-la-bible">
        <div className="wrap">
          <div className="pub-cat-head">
            <div>
              <h2><span className="cat-badge">QB</span> Que Dit la Bible ?</h2>
              <p className="desc">Une exhortation structurée : verset clé, enseignement, confession et application concrète.</p>
            </div>
          </div>

          {qdlbArticles.length === 0 ? (
            <p className="empty-state">Les premiers articles arrivent bientôt.</p>
          ) : (
            <div className="qdlb-grid">
              {qdlbArticles.map((a) => (
                <div className="qdlb-card" key={a.id}>
                  <div className="date">
                    {new Date(a.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </div>
                  <h3>{a.title}</h3>
                  {a.excerpt && <p>{a.excerpt}</p>}
                  <Link href={`/publications/${a.slug}`}>Lire l&apos;article →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="pub-category" id="vie-superieure">
        <div className="wrap">
          <div className="pub-cat-head">
            <div>
              <h2><span className="cat-badge">VS</span> La Vie Supérieure</h2>
              <p className="desc">Un enseignement approfondi, réservé aux membres connectés.</p>
            </div>
          </div>

          {vsArticles.length === 0 ? (
            <p className="empty-state">Les premiers enseignements arrivent bientôt.</p>
          ) : (
            <div className="vs-grid">
              {vsArticles.map((a) => (
                <div className="vs-card" key={a.id}>
                  <h3>{a.title}</h3>
                  <p>{a.excerpt || (a.body ? stripHtml(a.body).slice(0, 130) + "…" : "")}</p>
                  <Link href={`/publications/${a.slug}`}>Découvrir →</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
