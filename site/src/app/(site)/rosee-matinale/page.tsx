import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles, incrementViewCount } from "@/lib/content/articles";
import ArticleMeta from "@/components/articles/ArticleMeta";
import ShareCartouche from "@/components/articles/ShareCartouche";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

const SITE_URL = "https://sergehapitaministries.org";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}): Promise<Metadata> {
  const { date } = await searchParams;
  const entries = await getPublishedArticles("rm");
  const current = (date ? entries.find((e) => e.article_date === date) : entries[0]) ?? entries[0];
  const dateLabel = current
    ? new Date(current.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })
    : "";
  const title = `Rosée Matinale${dateLabel ? ` — ${dateLabel}` : ""} | Serge Hapita Ministries`;
  const description = current?.verse_text || "Une nouvelle pensée chaque jour, directement inspirée de la Parole.";
  return {
    title,
    description,
    // Titre/description dynamiques (cahier §3.2) — générés depuis le contenu du
    // jour plutôt que codés en dur, mais l'URL de base reste fixe et permanente
    // (le paramètre ?date= navigue entre les jours sans créer de page séparée).
    alternates: { canonical: "/rosee-matinale" },
    openGraph: { type: "website", title, description, url: "/rosee-matinale", siteName: "Serge Hapita Ministries", locale: "fr_FR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function RoseeMatinalePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
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

  const requestedIndex = date ? entries.findIndex((e) => e.article_date === date) : 0;
  const currentIndex = requestedIndex >= 0 ? requestedIndex : 0;
  const current = entries[currentIndex];
  const isToday = currentIndex === 0;
  // Triées du plus récent au plus ancien : l'entrée "précédente" (plus ancienne)
  // est à l'index+1, la "suivante" (plus récente) est à l'index-1.
  const previous = entries[currentIndex + 1] ?? null;
  const next = entries[currentIndex - 1] ?? null;
  const archive = entries.filter((_, i) => i !== currentIndex);

  incrementViewCount(current.id).catch(() => {});
  const pageUrl = `${SITE_URL}/rosee-matinale${date ? `?date=${date}` : ""}`;
  const paragraphs = (current.body || "").match(/<[a-z][^>]*>[\s\S]*?<\/[a-z]+>/gi) ?? (current.body ? [current.body] : []);

  return (
    <>
      <section
        className="rm-photo-hero"
        style={{ backgroundImage: "url(/rosee-matinale-hero.jpg)" }}
      >
        <div className="wrap">
          <div className="cat">Rosée Matinale</div>
          <div className="date">
            {new Date(current.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <ArticleMeta viewCount={current.view_count} readingTimeMinutes={current.reading_time_minutes} />
          {!isToday && (
            <Link href="/rosee-matinale" style={{ color: "#fff", fontSize: 13, textDecoration: "underline" }}>
              ← Retour à la pensée du jour
            </Link>
          )}
        </div>
      </section>

      {current.verse_text && (
        <section className="rm-quote-zone">
          <div className="wrap">
            <div className="rm-quote-wrap">
              <div className="rm-quote-mark">&quot;</div>
              <p className="rm-quote-text">{current.verse_text}</p>
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
            {previous ? (
              <Link href={`/rosee-matinale?date=${previous.article_date}`}>← Jour précédent</Link>
            ) : (
              <span className="disabled">← Jour précédent</span>
            )}
            <a href="#archive" className="archive-link">Voir l&apos;archive ↓</a>
            {next ? (
              <Link href={`/rosee-matinale?date=${next.article_date}`}>Jour suivant →</Link>
            ) : (
              <span className="disabled">Jour suivant →</span>
            )}
          </div>

          <ShareCartouche title={`Rosée Matinale — ${new Date(current.article_date).toLocaleDateString("fr-FR")}`} url={pageUrl} />
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
                <Link href={`/rosee-matinale?date=${entry.article_date}`} className="rm-item" key={entry.id}>
                  <div className="date">
                    {new Date(entry.article_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                  </div>
                  <div className="excerpt">{entry.verse_text}</div>
                </Link>
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
