import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { getBooks } from "@/lib/content/books";
import { getActiveStats } from "@/lib/content/stats";
import { getSocialLinks } from "@/lib/content/footer";
import { getNextEvent, getPastEvents, formatEventDateRange } from "@/lib/content/events";
import CoverRollover from "@/components/shop/CoverRollover";
import PublisherLink from "@/components/shop/PublisherLink";
import HomeLatestPublications from "@/components/home/HomeLatestPublications";
import { getPageContent } from "@/lib/content/pageContent";

const title = "Serge Hapita Ministries — Révéler Christ au croyant";
const description =
  "Serge Hapita Ministries — un ministère qui révèle Christ au croyant, affermit le chrétien dans l'identité de fils, manifeste Dieu, le Père céleste.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const SOCIAL_ICON: Record<string, string> = { YouTube: "▶", Instagram: "◎", TikTok: "♪", Facebook: "f" };
const SOCIAL_HANDLE: Record<string, string> = {
  YouTube: "@sergehapita",
  Instagram: "@sergehapitaministries",
  TikTok: "@sergehapitaministries",
  Facebook: "Serge Hapita Ministries",
};

export default async function HomePage() {
  const [books, stats, socialLinks, nextEvent, pastEvents, content] = await Promise.all([
    getBooks(),
    getActiveStats(),
    getSocialLinks(),
    getNextEvent(),
    getPastEvents(2), // 2 événements passés (cahier/maquette § .past-events).
    getPageContent("accueil"),
  ]);

  const latestBooks = books.slice(0, 3);

  return (
    // V2 (retour du 11/09, Lot 3) — reproduit prototype-html/index.html
    // (styles.css § .hero/.dew-*/.jesus-*/.publications-section/
    // .category-*/.events-*/.books-*), à l'identique de la maquette : pas
    // de flux chronologique mélangé sur l'accueil (annulé le 11/09, décision
    // explicite de Serge — les capsules du jour + la vitrine de catégories
    // suffisent ici, contrairement au hub Publications qui garde le sien).
    // Agenda désormais branché sur de vraies données (Lot 11, 11/09) — voir
    // src/lib/content/events.ts.
    <div className="v2-home">
      <section className="v2-home-hero" id="ministere">
        <div className="v2-home-hero-photo" style={{ backgroundImage: "url('/v2/home-hero-community.jpg')" }} aria-hidden="true" />
        <div className="v2-home-hero-glow" aria-hidden="true" />
        <div className="v2-wrap v2-home-hero-inner">
          <div className="v2-home-hero-copy">
            <p className="v2-eyebrow light">
              <span /> {content.hero_eyebrow}
            </p>
            <h1>
              {content.hero_line_1}
              <br />
              {content.hero_line_2}
              <br />
              <em>{content.hero_line_3}</em>
            </h1>
            <p className="v2-home-hero-text">
              <span className="v2-home-hero-summary">
                {content.hero_summary}
              </span>{" "}
              <Link href="/mission">{content.hero_more}</Link>
            </p>
            <div className="v2-home-hero-actions">
              <Link href="/connaitre-jesus" className="v2-button v2-button-primary">
                {content.hero_jesus_action} <span>→</span>
              </Link>
              <Link href="/invitation" className="v2-button v2-button-ghost">
                {content.hero_invite_action} <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <HomeLatestPublications />

      {/* Passerelle Connaître Jésus (§ .jesus-gateway) — miniature + lien
          vers la page dédiée, qui porte elle la vraie vidéo intégrée (voir
          connaitre-jesus/page.tsx) : traitement volontairement différent de
          cette page-là, pas un oubli — une vignette d'appel suffit sur
          l'accueil, la même vidéo reste à un clic. */}
      <section className="v2-jesus-gateway" id="jesus">
        <div className="v2-wrap">
          <div className="v2-section-heading">
            <div>
              <p className="v2-eyebrow">
                <span /> {content.jesus_eyebrow}
              </p>
              <h2>{content.jesus_title}</h2>
            </div>
            <p>{content.jesus_intro}</p>
          </div>

          <div className="v2-jesus-stage">
            <Link href="/connaitre-jesus" className="v2-jesus-video-frame" aria-label="Découvrir la présentation Connaître Jésus">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/home-video-thumb.jpg" alt="Miniature de la vidéo Connaître Jésus" />
              <span className="play" aria-hidden="true">▶</span>
            </Link>
            <div className="v2-jesus-intro">
              <p className="micro-label">{content.jesus_micro}</p>
              <h3>{content.jesus_question}</h3>
              <p>
                {content.jesus_text}
              </p>
              <Link href="/connaitre-jesus" className="v2-button v2-button-primary">
                {content.jesus_action} <span>→</span>
              </Link>
            </div>
          </div>

          <div className="v2-jesus-topics" aria-label="Découvrir Jésus">
            <Link href="/connaitre-jesus#naissance">
              <span>01</span>
              <strong>{content.jesus_topic_1}</strong>
              <b>→</b>
            </Link>
            <Link href="/connaitre-jesus#oeuvre">
              <span>02</span>
              <strong>{content.jesus_topic_2}</strong>
              <b>→</b>
            </Link>
            <Link href="/connaitre-jesus#resurrection">
              <span>03</span>
              <strong>{content.jesus_topic_3}</strong>
              <b>→</b>
            </Link>
            <Link href="/connaitre-jesus#recevoir">
              <span>04</span>
              <strong>{content.jesus_topic_4}</strong>
              <b>→</b>
            </Link>
          </div>
        </div>
      </section>

      {/* Vitrine statique par catégorie (§ .publications-section/
          .category-grid) — menu de navigation, pas un aperçu de contenu
          (voir la note en tête de section dans globals.css). 4 cartes
          depuis le Lot 4 (Je Confesse ajoutée). */}
      <section className="v2-category-section" id="publications">
        <div className="v2-wrap">
          <div className="v2-dark-heading">
            <div>
              <p className="v2-eyebrow light">
                <span /> {content.publications_eyebrow}
              </p>
              <h2>{content.publications_title}</h2>
            </div>
            <Link href="/publications">{content.publications_action}</Link>
          </div>

          <div className="v2-category-grid">
            <article className="v2-category-card dew">
              <div className="v2-category-number">01</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">{content.dew_name}</p>
                <h3>{content.dew_title}</h3>
                <p>{content.dew_text}</p>
              </div>
              <Link href="/rosee-matinale">{content.dew_action}</Link>
            </article>
            <article className="v2-category-card bible">
              <div className="v2-category-number">02</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">{content.bible_name}</p>
                <h3>{content.bible_title}</h3>
                <p>{content.bible_text}</p>
              </div>
              <Link href="/publications/que-dit-la-bible">{content.bible_action}</Link>
            </article>
            <article className="v2-category-card confess">
              <div className="v2-category-number">03</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">{content.confess_name}</p>
                <h3>{content.confess_title}</h3>
                <p>{content.confess_text}</p>
              </div>
              <Link href="/publications/je-confesse-et-declare">{content.confess_action}</Link>
            </article>
            <article className="v2-category-card life">
              <div className="v2-category-number">04</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">{content.life_name}</p>
                <h3>{content.life_title}</h3>
                <p>{content.life_text}</p>
              </div>
              <Link href="/publications/la-vie-superieure">{content.life_action}</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="v2-books-section v2-wrap" id="livres">
        <div className="v2-section-heading">
          <div>
            <p className="v2-eyebrow v2-brand-case">
              <span /> {content.books_eyebrow}
            </p>
            <h2>
              {content.books_title_prefix} <em>{content.books_title_emphasis}</em>
            </h2>
          </div>
          <Link href="/livres" className="v2-catalogue-link">
            {content.books_action}
          </Link>
        </div>
        {latestBooks.length === 0 ? (
          <p className="empty-state">{content.books_empty}</p>
        ) : (
          <div className="v2-books-grid">
            {latestBooks.map((book, i) => (
              <article className={`v2-book-card${i === 0 ? " main" : ""}`} key={book.id}>
                {book.cover_url ? (
                  <Link href={`/livres/${book.slug}`} className="v2-book-cover">
                    <CoverRollover src={book.cover_url} hoverSrc={book.hover_cover_url} alt={book.title} />
                  </Link>
                ) : (
                  <Link href={`/livres/${book.slug}`} className="v2-book-cover" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--v2-violet),var(--v2-violet-deep))", padding: 14, textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--v2-serif)", fontWeight: 600, color: "#fff", fontSize: 16, lineHeight: 1.3 }}>{book.title}</div>
                  </Link>
                )}
                <div className="v2-book-info">
                  {book.badge && <span>{book.badge}</span>}
                  <h3>{book.title}</h3>
                  {i === 0 && (
                    <p>
                      <PublisherLink publisher={book.publisher} />
                    </p>
                  )}
                  <Link href={`/livres/${book.slug}`}>{i === 0 ? content.book_discover_featured : content.book_discover} →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Agenda / Événements (§ .events-section) — branché sur de vraies
          données (Lot 11, 11/09, nouvelle table + admin CRUD dédiés) :
          prochain rendez-vous calculé (événement visible le plus proche non
          encore passé), 2 derniers événements passés. Repli sur le texte de
          la maquette ("Prochaines dates annoncées ici") tant qu'aucun
          événement à venir n'est saisi — jamais de contenu fictif affiché
          comme réel. Un événement passé sans lien externe s'affiche sans
          être cliquable (retour du 11/09) — jamais un href="#" qui ne mène
          nulle part. */}
      <section className="v2-events-section" id="evenements">
        <div className="v2-wrap">
          <div className="v2-section-heading">
            <div>
              <p className="v2-eyebrow">
                <span /> {content.events_eyebrow}
              </p>
              <h2>{content.events_title}</h2>
            </div>
            <p>{content.events_intro}</p>
          </div>

          <div className="v2-events-grid">
            <article className="v2-next-event">
              <div className="v2-event-kicker">{content.events_next_label}</div>
              <div className="v2-event-date">
                <strong>{nextEvent ? formatEventDateRange(nextEvent.start_date, nextEvent.end_date) : content.events_coming}</strong>
                {!nextEvent && <span>{content.events_coming_note}</span>}
              </div>
              <div className="v2-event-body">
                <p>{nextEvent?.type ?? content.events_default_type}</p>
                <h3>{nextEvent?.title ?? content.events_default_title}</h3>
                <span>
                  {nextEvent?.description ?? content.events_default_text}
                </span>
              </div>
              {nextEvent?.external_url && (
                <a href={nextEvent.external_url} target="_blank" rel="noopener noreferrer">
                  Découvrir le site de l&apos;événement ↗
                </a>
              )}
            </article>
            <div className="v2-past-events">
              <p className="micro-label">{content.events_replay_label}</p>
              {pastEvents.length === 0 ? (
                <p className="empty-state">{content.events_past_empty}</p>
              ) : (
                pastEvents.map((e) => {
                  const content = (
                    <>
                      <time dateTime={e.start_date}>{formatEventDateRange(e.start_date, e.end_date)}</time>
                      <div>
                        <strong>{e.title}</strong>
                        {e.location && <span>{e.location}</span>}
                      </div>
                      {e.external_url && <b>→</b>}
                    </>
                  );
                  return e.external_url ? (
                    <a className="v2-past-event" href={e.external_url} target="_blank" rel="noopener noreferrer" key={e.id}>
                      {content}
                    </a>
                  ) : (
                    <div className="v2-past-event" key={e.id}>
                      {content}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Repères chiffrés (getActiveStats) — fonctionnalité réelle,
          réglable dans l'admin, sans emplacement dans la maquette de
          l'accueil : réutilise l'habillage déjà posé pour De Serge
          (.v2-ds-stats, Lot 2) plutôt que d'en inventer un nouveau. */}
      {stats.length > 0 && (
        <section className="v2-ds-stats" aria-label="Repères du ministère">
          <div className="v2-wrap v2-ds-stats-grid">
            {stats.map((s) => (
              <div key={s.key}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="v2-support-section" id="partenariat">
        <div className="v2-support-orb" aria-hidden="true" />
        <div className="v2-wrap v2-support-grid">
          <div className="v2-support-copy">
            <p className="v2-eyebrow light">
              <span /> {content.support_eyebrow}
            </p>
            <h2>{content.support_title}</h2>
            <p>
              {content.support_text}
            </p>
            <Link href="/partenariat" className="v2-button v2-button-light">
              {content.support_action} <span>→</span>
            </Link>
          </div>
          <div className="v2-support-points">
            <div>
              <b>01</b>
              <p>
                <strong>{content.support_point_1_title}</strong>
                <span>{content.support_point_1_text}</span>
              </p>
            </div>
            <div>
              <b>02</b>
              <p>
                <strong>{content.support_point_2_title}</strong>
                <span>{content.support_point_2_text}</span>
              </p>
            </div>
            <div>
              <b>03</b>
              <p>
                <strong>{content.support_point_3_title}</strong>
                <span>{content.support_point_3_text}</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-community-section v2-wrap">
        <div className="v2-community-title">
          <p className="v2-eyebrow">
            <span /> {content.community_eyebrow}
          </p>
          <h2>
            {content.community_title.split("\n").map((line, index) => (
              <Fragment key={line}>
                {index > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </h2>
        </div>
        <div className="v2-social-list">
          {socialLinks.map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              <span>{SOCIAL_ICON[link.label] ?? "★"}</span>
              <div>
                <strong>{link.label}</strong>
                <small>{SOCIAL_HANDLE[link.label] ?? ""}</small>
              </div>
              <b>→</b>
            </a>
          ))}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}

