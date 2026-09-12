import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { getBooks } from "@/lib/content/books";
import { getRoseeDuJour, getConfessionDuJour } from "@/lib/content/articles";
import { stripHtml } from "@/lib/richtext";
import { getActiveStats } from "@/lib/content/stats";
import { getSocialLinks } from "@/lib/content/footer";
import { getNextEvent, getPastEvents, formatEventDateRange } from "@/lib/content/events";
import CoverRollover from "@/components/shop/CoverRollover";
import PublisherLink from "@/components/shop/PublisherLink";

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
  const [books, roseeDuJour, confessionDuJour, stats, socialLinks, nextEvent, pastEvents] = await Promise.all([
    getBooks(),
    getRoseeDuJour(),
    getConfessionDuJour(),
    getActiveStats(),
    getSocialLinks(),
    getNextEvent(),
    getPastEvents(2), // 2 événements passés (cahier/maquette § .past-events).
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
              <span /> Porter le salut de Christ jusqu&apos;aux extrémités de la terre
            </p>
            <h1>
              Révéler Christ.
              <br />
              Affermir le chrétien.
              <br />
              <em>Manifester le Royaume.</em>
            </h1>
            <p className="v2-home-hero-text">
              <span className="v2-home-hero-summary">
                Serge Hapita est un prophète de la révélation et de la conscience filiale. Son ministère porte une
                onction qui ravive la foi, restaure la communion avec Dieu le Père et la conscience de
                l&apos;identité de fils. Quand il partage la Parole, c&apos;est une rencontre avec l&apos;Esprit : la
                vie se manifeste, l&apos;esprit se réveille, la foi se met à l&apos;œuvre.
              </span>{" "}
              <Link href="/mission">Lire davantage</Link>
            </p>
            <div className="v2-home-hero-actions">
              <Link href="/connaitre-jesus" className="v2-button v2-button-primary">
                Je désire connaître Jésus <span>→</span>
              </Link>
              <Link href="/invitation" className="v2-button v2-button-ghost">
                J&apos;invite Serge <span>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rosée matinale du jour — carte flottante sur la charnière hero →
          contenu (§ .dew-wrap). Donnée réelle inchangée (getRoseeDuJour). */}
      <section className="v2-wrap" aria-label="Rosée matinale du jour">
        <div className="v2-dew-wrap">
          <article className="v2-dew-card">
            <div className="v2-dew-label">Rosée Matinale</div>
            {roseeDuJour ? (
              <>
                <div className="v2-dew-date">
                  <span>Édition du jour</span>
                  <time dateTime={roseeDuJour.article_date}>
                    {new Date(roseeDuJour.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </time>
                </div>
                <div className="v2-dew-content">
                  <h2>{roseeDuJour.title}</h2>
                  <p>{(roseeDuJour.verse_text || roseeDuJour.body || "").slice(0, 220)}</p>
                </div>
                <Link href="/rosee-matinale">Lire la pensée du jour →</Link>
              </>
            ) : (
              <>
                <div className="v2-dew-date">
                  <span>Édition du jour</span>
                </div>
                <div className="v2-dew-content">
                  <p>La pensée du jour arrive bientôt.</p>
                </div>
                <Link href="/publications">Publications →</Link>
              </>
            )}
          </article>
        </div>
      </section>

      {/* Je Confesse du jour (Lot 4, 11/09) — même principe que la capsule
          Rosée Matinale ci-dessus (§ .confession-wrap). Donnée réelle
          (getConfessionDuJour). Extrait du corps de la proclamation du jour
          (corrigé le 11/09) — le verset d'en-tête et la signature de
          clôture sont désormais des réglages fixes de la rubrique (voir
          JeConfesseContent.tsx), jamais affichés ici : cette carte montre
          un aperçu de la déclaration du jour, comme la carte Rosée
          Matinale voisine. */}
      <section className="v2-wrap" aria-label="Proclamation du jour — Je Confesse">
        <div className="v2-confession-wrap">
          <article className="v2-confession-card">
            <div className="v2-confession-label">Je Confesse</div>
            <div className="v2-confession-meta">Proclamation du jour</div>
            {confessionDuJour ? (
              <>
                <div className="v2-confession-content">
                  <blockquote>« {stripHtml(confessionDuJour.body ?? "").slice(0, 160)} »</blockquote>
                </div>
                <Link href="/publications/je-confesse-et-declare">Lire et proclamer →</Link>
              </>
            ) : (
              <>
                <div className="v2-confession-content">
                  <blockquote>La proclamation du jour arrive bientôt.</blockquote>
                </div>
                <Link href="/publications">Publications →</Link>
              </>
            )}
          </article>
        </div>
      </section>

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
                <span /> La porte vers la vie
              </p>
              <h2>Connaître Jésus</h2>
            </div>
            <p>Découvrez pourquoi Jésus est venu, ce qu&apos;il a accompli et la vie qu&apos;il offre aujourd&apos;hui à celui qui croit en lui.</p>
          </div>

          <div className="v2-jesus-stage">
            <Link href="/connaitre-jesus" className="v2-jesus-video-frame" aria-label="Découvrir la présentation Connaître Jésus">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/home-video-thumb.jpg" alt="Miniature de la vidéo Connaître Jésus" />
              <span className="play" aria-hidden="true">▶</span>
            </Link>
            <div className="v2-jesus-intro">
              <p className="micro-label">Une histoire incroyable. Et pourtant…</p>
              <h3>Pourquoi Jésus est-il venu ?</h3>
              <p>
                Il y a presque deux mille ans, Jésus de Nazareth est venu porter le salut, révéler le Père et donner
                la vie éternelle à quiconque croit.
              </p>
              <Link href="/connaitre-jesus" className="v2-button v2-button-primary">
                Entrer dans cet univers <span>→</span>
              </Link>
            </div>
          </div>

          <div className="v2-jesus-topics" aria-label="Découvrir Jésus">
            <Link href="/connaitre-jesus#naissance">
              <span>01</span>
              <strong>Sa naissance miraculeuse</strong>
              <b>→</b>
            </Link>
            <Link href="/connaitre-jesus#oeuvre">
              <span>02</span>
              <strong>Sa mission et ses œuvres</strong>
              <b>→</b>
            </Link>
            <Link href="/connaitre-jesus#resurrection">
              <span>03</span>
              <strong>Sa mort et sa résurrection</strong>
              <b>→</b>
            </Link>
            <Link href="/connaitre-jesus#recevoir">
              <span>04</span>
              <strong>Recevoir la vie en Jésus</strong>
              <b>→</b>
            </Link>
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

      {/* Vitrine statique par catégorie (§ .publications-section/
          .category-grid) — menu de navigation, pas un aperçu de contenu
          (voir la note en tête de section dans globals.css). 4 cartes
          depuis le Lot 4 (Je Confesse ajoutée). */}
      <section className="v2-category-section" id="publications">
        <div className="v2-wrap">
          <div className="v2-dark-heading">
            <div>
              <p className="v2-eyebrow light">
                <span /> Quatre expressions de la Parole
              </p>
              <h2>Une Parole pour chaque besoin</h2>
            </div>
            <Link href="/publications">Toutes les publications →</Link>
          </div>

          <div className="v2-category-grid">
            <article className="v2-category-card dew">
              <div className="v2-category-number">01</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">Rosée Matinale</p>
                <h3>Mieux penser, mieux choisir et mieux vivre.</h3>
                <p>Des pensées courtes et percutantes qui apportent sagesse, recul et inspiration pour la vie quotidienne.</p>
              </div>
              <Link href="/rosee-matinale">Lire la pensée du jour →</Link>
            </article>
            <article className="v2-category-card bible">
              <div className="v2-category-number">02</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">Que dit la Bible ?</p>
                <h3>Dieu a dit, alors nous disons aussi</h3>
                <p>Un examen quotidien des Écritures pour construire la véritable connaissance de Dieu dans la vie de ceux qui nous suivent.</p>
              </div>
              <Link href="/publications/que-dit-la-bible">Examiner les Écritures →</Link>
            </article>
            <article className="v2-category-card confess">
              <div className="v2-category-number">03</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">Je Confesse</p>
                <h3>La Parole de Dieu dans votre bouche.</h3>
                <p>Des déclarations et des proclamations fondées sur la Parole de Dieu, à affirmer avec foi sur votre vie.</p>
              </div>
              <Link href="/publications/je-confesse-et-declare">Découvrir Je Confesse →</Link>
            </article>
            <article className="v2-category-card life">
              <div className="v2-category-number">04</div>
              <div className="v2-category-copy">
                <p className="v2-category-name">La Vie Supérieure</p>
                <h3>Une connaissance destinée à devenir l&apos;expérience de la vie en Christ.</h3>
                <p>Des enseignements approfondis consacrés aux réalités de la nouvelle création et à leur manifestation dans la vie du chrétien.</p>
              </div>
              <Link href="/publications/la-vie-superieure">Entrer dans l&apos;enseignement →</Link>
            </article>
          </div>
        </div>
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
                <span /> Agenda
              </p>
              <h2>Rencontres et conférences</h2>
            </div>
            <p>Retrouvez les prochains rendez-vous du ministère et revivez les événements qui ont marqué La Vie Supérieure.</p>
          </div>

          <div className="v2-events-grid">
            <article className="v2-next-event">
              <div className="v2-event-kicker">Prochain rendez-vous</div>
              <div className="v2-event-date">
                <strong>{nextEvent ? formatEventDateRange(nextEvent.start_date, nextEvent.end_date) : "À venir"}</strong>
                {!nextEvent && <span>Prochaines dates annoncées ici</span>}
              </div>
              <div className="v2-event-body">
                <p>{nextEvent?.type ?? "Conférence"}</p>
                <h3>{nextEvent?.title ?? "La Vie Supérieure"}</h3>
                <span>
                  {nextEvent?.description ?? "Un temps d'enseignement consacré aux réalités de la vie en Christ."}
                </span>
              </div>
              {nextEvent?.external_url && (
                <a href={nextEvent.external_url} target="_blank" rel="noopener noreferrer">
                  Découvrir le site de l&apos;événement ↗
                </a>
              )}
            </article>
            <div className="v2-past-events">
              <p className="micro-label">À revivre</p>
              {pastEvents.length === 0 ? (
                <p className="empty-state">Les premiers événements passés apparaîtront ici.</p>
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

      <section className="v2-books-section v2-wrap" id="livres">
        <div className="v2-section-heading">
          <div>
            <p className="v2-eyebrow v2-brand-case">
              <span /> amDG Éditions
            </p>
            <h2>
              Dernières <em>parutions</em>
            </h2>
          </div>
          <Link href="/livres" className="v2-catalogue-link">
            Voir tout le catalogue →
          </Link>
        </div>
        {latestBooks.length === 0 ? (
          <p className="empty-state">Le catalogue est en cours de préparation.</p>
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
                  <Link href={`/livres/${book.slug}`}>Découvrir {i === 0 ? "le livre" : ""} →</Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="v2-support-section" id="partenariat">
        <div className="v2-support-orb" aria-hidden="true" />
        <div className="v2-wrap v2-support-grid">
          <div className="v2-support-copy">
            <p className="v2-eyebrow light">
              <span /> Soutenir
            </p>
            <h2>Associez-vous à cette œuvre du Royaume de Dieu</h2>
            <p>
              Depuis des générations, la Parole de Dieu apporte la guérison, le salut et la lumière dans la vie de
              milliers de personnes. Votre générosité permet à cette œuvre de poursuivre sa mission.
            </p>
            <Link href="/partenariat" className="v2-button v2-button-light">
              Devenir semeur de la Parole <span>→</span>
            </Link>
          </div>
          <div className="v2-support-points">
            <div>
              <b>01</b>
              <p>
                <strong>Un ministère libre</strong>
                <span>Entièrement soutenu par la générosité.</span>
              </p>
            </div>
            <div>
              <b>02</b>
              <p>
                <strong>Une Parole accessible</strong>
                <span>Des enseignements diffusés au plus grand nombre.</span>
              </p>
            </div>
            <div>
              <b>03</b>
              <p>
                <strong>Une œuvre en mouvement</strong>
                <span>Des livres, des missions et des actions concrètes.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-community-section v2-wrap">
        <div className="v2-community-title">
          <p className="v2-eyebrow">
            <span /> Rester connecté
          </p>
          <h2>
            La Parole continue
            <br />
            au fil de la semaine.
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
