import type { Metadata } from "next";
import Link from "next/link";
import { getRoseeDuJour, getRoseeArchive, incrementViewCount } from "@/lib/content/articles";
import ArticleMeta from "@/components/articles/ArticleMeta";
import ShareCartouche from "@/components/articles/ShareCartouche";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

export async function generateMetadata(): Promise<Metadata> {
  const today = await getRoseeDuJour();
  const dateLabel = today
    ? new Date(today.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "";
  const title = `Rosée Matinale${dateLabel ? ` — ${dateLabel}` : ""} | Serge Hapita Ministries`;
  const description = today?.verse_text || "Une nouvelle pensée chaque jour, directement inspirée de la Parole.";
  return {
    title,
    description,
    // Titre/description dynamiques (cahier §3.2) — générés depuis le contenu du
    // jour plutôt que codés en dur, mais l'URL reste fixe et permanente.
    alternates: { canonical: "/rosee-matinale" },
    openGraph: { type: "website", title, description, url: "/rosee-matinale", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoseeMatinalePage() {
  const [today, archive] = await Promise.all([getRoseeDuJour(), getRoseeArchive()]);

  if (!today) {
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

  incrementViewCount(today.id).catch(() => {});
  const pageUrl = `${SITE_URL}/rosee-matinale`;
  const paragraphs = (today.body || "").match(/<[a-z][^>]*>[\s\S]*?<\/[a-z]+>/gi) ?? (today.body ? [today.body] : []);

  return (
    <>
      <section
        className="rm-photo-hero"
        style={{ backgroundImage: "url(/rosee-matinale-hero.jpg)" }}
      >
        <div className="wrap">
          <div className="cat">Rosée Matinale</div>
          <div className="date">
            {new Date(today.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <ArticleMeta viewCount={today.view_count} readingTimeMinutes={today.reading_time_minutes} />
        </div>
      </section>

      {today.verse_text && (
        <section className="rm-quote-zone">
          <div className="wrap">
            <div className="rm-quote-wrap">
              <div className="rm-quote-mark">&quot;</div>
              <p className="rm-quote-text">{today.verse_text}</p>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap" style={{ maxWidth: 640 }}>
          {paragraphs.map((html, i) => (
            <div key={i} style={{ fontSize: 16.5, lineHeight: 1.85, marginBottom: 20 }} dangerouslySetInnerHTML={{ __html: html }} />
          ))}

          <div className="rm-nav-days">
            <span className="disabled">← Jour précédent</span>
            <a href="#archive" className="archive-link">Voir l&apos;archive ↓</a>
            <span className="disabled">Jour suivant →</span>
          </div>

          <ShareCartouche title={`Rosée Matinale — ${new Date(today.article_date).toLocaleDateString("fr-FR")}`} url={pageUrl} />
        </div>
      </section>

      <section className="rm-archive" id="archive">
        <div className="wrap">
          <h2>Les jours précédents</h2>
          <p className="sub">Chaque jour, une nouvelle pensée s&apos;ajoute à cette liste.</p>
          {archive.length === 0 ? (
            <p className="rm-empty">Ceci est la toute première pensée publiée — l&apos;archive se remplira à partir de demain.</p>
          ) : (
            <div className="rm-list">
              {archive.map((entry) => (
                <div className="rm-item" key={entry.id}>
                  <div className="date">
                    {new Date(entry.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </div>
                  <div className="excerpt">{entry.verse_text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rm-explore">
        <div className="wrap">
          <h2>Poursuivre la lecture</h2>
          <div className="explore-grid">
            <div className="explore-card">
              <div className="icon">QB</div>
              <h3>Que Dit la Bible ?</h3>
              <p>Un enseignement structuré, verset par verset.</p>
              <Link href="/publications#que-dit-la-bible">Découvrir →</Link>
            </div>
            <div className="explore-card">
              <div className="icon">VS</div>
              <h3>La Vie Supérieure</h3>
              <p>Un enseignement approfondi, pour aller plus loin.</p>
              <Link href="/publications#vie-superieure">Découvrir →</Link>
            </div>
            <div className="explore-card">
              <div className="icon">L</div>
              <h3>Les livres</h3>
              <p>Les ouvrages publiés sous amDG Éditions.</p>
              <Link href="/livres">Découvrir →</Link>
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
