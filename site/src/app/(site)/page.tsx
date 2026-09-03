import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { getBooks } from "@/lib/content/books";
import { getHomeFeed, getRoseeDuJour } from "@/lib/content/articles";
import { getActiveStats } from "@/lib/content/stats";
import { getSocialLinks } from "@/lib/content/footer";
import { getInterfaceTexts } from "@/lib/content/interfaceTexts";
import CoverRollover from "@/components/shop/CoverRollover";
import PublisherLink from "@/components/shop/PublisherLink";
import PublicationFeedItem from "@/components/articles/PublicationFeedItem";
import Pagination from "@/components/admin/Pagination";

// Règle fixe (retour du 05/09, point 6) — même règle que les hubs : 4
// publications par page, partout où ce flux apparaît (accueil compris).
const PUBS_PER_PAGE = 4;

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

const HERO_IMAGES = ["/de-serge-hero.jpg", "/rosee-matinale-hero.jpg", "/hero-3.jpg"];

const SOCIAL_ICON: Record<string, string> = { YouTube: "▶", Instagram: "◎", TikTok: "♪", Facebook: "f" };
const SOCIAL_HANDLE: Record<string, string> = {
  YouTube: "@sergehapita",
  Instagram: "@sergehapitaministries",
  TikTok: "@sergehapitaministries",
  Facebook: "Serge Hapita Ministries",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const [books, roseeDuJour, stats, socialLinks, texts] = await Promise.all([
    getBooks(),
    getRoseeDuJour(),
    getActiveStats(),
    getSocialLinks(),
    getInterfaceTexts(),
  ]);

  const latestBooks = books.slice(0, 3);
  // Flux unique, toutes catégories mélangées, trié par date (point 5,
  // retour du 05/09) — prêt à accueillir une 3e catégorie d'articles sans
  // modification de code : voir le commentaire de getHomeFeed. Paginé
  // (point 6, retour du 05/09) : 4 par page, comme les hubs — remplace le
  // réglage admin "home.publications_per_category" (devenu sans effet,
  // cette limite est désormais une règle fixe partagée avec les hubs).
  const { articles: homeFeed, total: homeFeedTotal } = await getHomeFeed(page, PUBS_PER_PAGE);
  // Réglage admin (retour du 03/09) — nombre de lignes d'extrait affichées
  // sur les cartes, pas une valeur fixée dans le code.
  const excerptLines = Number(texts["publications.excerpt_lines"]) || 2;

  return (
    <>
      <section className="hero">
        {HERO_IMAGES.map((src, i) => (
          <div key={src} className={i === 0 ? "hero-slide active" : "hero-slide"} style={{ backgroundImage: `url('${src}')` }} />
        ))}
        <div className="wrap hero-inner">
          <div>
            <div className="eyebrow">Prophète · Enseignant · Auteur</div>
            <h1>Un ministère qui révèle Christ au croyant et affermit le chrétien dans l&apos;identité de fils.</h1>
            <p className="hero-lede">
              Serge Hapita porte une onction d&apos;impartation qui repositionne dans la vérité de l&apos;Évangile.
              Enseignement de la Parole, messages prophétiques et publications, pour que l&apos;Église marche dans
              la vie divine.
            </p>
            <div className="hero-cta">
              <Link href="/connaitre-jesus" className="btn btn-primary">
                Je désire connaître Jésus →
              </Link>
              <Link href="/invitation" className="btn btn-outline">
                J&apos;invite Serge
              </Link>
            </div>
          </div>
          <div className="book-feature">
            <div className="book-card">
              {roseeDuJour ? (
                <>
                  {/* Badge seul, date séparée en dessous (retour du 05/09) —
                      auparavant combinés dans le même badge ("ROSÉE MATINALE
                      · 1er septembre"), ce qui l'allongeait au point de
                      parfois passer sur 2 lignes et empiéter sur le texte en
                      dessous. Date au format complet avec l'année, comme
                      partout ailleurs sur le site. */}
                  <span className="tag">Rosée Matinale</span>
                  <div className="book-date">
                    {new Date(roseeDuJour.article_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  {/* 4 lignes minimum, "…" automatique si le texte continue
                      au-delà (retour du 05/09) — via line-clamp plutôt
                      qu'une coupure à un nombre de caractères fixe, plus
                      fiable d'une largeur de carte à l'autre. */}
                  <p className="book-sub">{(roseeDuJour.verse_text || roseeDuJour.body || "").slice(0, 400)}</p>
                </>
              ) : (
                <p className="book-sub">La pensée du jour arrive bientôt.</p>
              )}
              <div className="book-actions">
                <Link href="/rosee-matinale" className="btn btn-primary">
                  Lire la pensée du jour
                </Link>
                <Link href="/publications" className="btn btn-ghost">
                  Publications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap video-feature-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
            <div className="eyebrow">Vidéo à la une</div>
            <h2 style={{ fontSize: 26, margin: "10px 0 14px" }}>Connaître Jésus</h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.55 }}>
              Le cœur du message de Jésus : sa mission, sa mort, sa résurrection, et ce qu&apos;il offre à chacun
              aujourd&apos;hui.
            </p>
          </div>
          <div style={{ aspectRatio: "16/9", borderRadius: 12, overflow: "hidden" }}>
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/_8Iucad0hFg"
              title="Connaître Jésus"
              style={{ border: 0, display: "block" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="stats">
          <div className="wrap">
            {stats.map((s) => (
              <div className="stat" key={s.key}>
                <div className="num">{s.value}</div>
                <div className="label">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Flux unique, toutes catégories mélangées, trié par date (point 5,
          retour du 05/09) — remplace les deux blocs séparés par catégorie
          d'avant : sur mobile/tablette, l'utilisateur voyait tout le bloc
          "Que Dit la Bible" avant "La Vie Supérieure" au lieu d'un vrai
          mélange chronologique. Même composant que le hub Publications
          (PublicationFeedItem), prêt à accueillir une 3e catégorie future
          sans développement supplémentaire (voir getHomeFeed). */}
      <section className="pubs" id="publications">
        <div className="wrap pubs-inner-pad">
          <div className="section-head">
            <h2>Publications</h2>
            <Link href="/publications" className="see-all">
              Toutes les publications →
            </Link>
          </div>

          {homeFeed.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14 }}>Les premières publications arrivent bientôt.</p>
          ) : (
            <div className="feed-list">
              {homeFeed.map((a) => (
                <PublicationFeedItem article={a} excerptLines={excerptLines} variant="home" key={a.id} />
              ))}
            </div>
          )}
          {homeFeedTotal > 0 && (
            <Pagination page={page} perPage={PUBS_PER_PAGE} total={homeFeedTotal} basePath="/" showPerPageSelector={false} />
          )}
        </div>
      </section>

      <section className="section" id="livres">
        <div className="wrap">
          <div className="section-head">
            <h2>
              Dernières <em>parutions</em>
            </h2>
            <Link href="/livres" className="see-all">
              Voir tout le catalogue →
            </Link>
          </div>
          {/* Livres en premier, capsule amDG en dernier (retour du 05/09) —
              particulièrement sensible sur mobile où l'ordre du DOM devient
              l'ordre d'empilement vertical : il fallait auparavant faire
              défiler toute la capsule avant de voir un seul livre.
              gridTemplateColumns inversé en même temps (2fr .85fr) pour
              garder les livres dans la colonne large. */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr .85fr", gap: 32, alignItems: "start" }} className="livres-split">
            {latestBooks.length === 0 ? (
              <p className="empty-state">Le catalogue est en cours de préparation.</p>
            ) : (
              <div className="books-grid" style={{ gridTemplateColumns: `repeat(${latestBooks.length}, 1fr)` }}>
                {latestBooks.map((book) => (
                  <div className="book" key={book.id}>
                    {book.cover_url ? (
                      <Link href={`/livres/${book.slug}`} className="book-thumb">
                        {book.badge && <span className="badge">{book.badge}</span>}
                        <CoverRollover src={book.cover_url} hoverSrc={book.hover_cover_url} alt={book.title} />
                      </Link>
                    ) : (
                      <Link href={`/livres/${book.slug}`} className="book-thumb placeholder">
                        {book.badge && <span className="badge">{book.badge}</span>}
                        <div>
                          <div className="ph-collection">{book.publisher}</div>
                          <div className="ph-title">{book.title}</div>
                        </div>
                      </Link>
                    )}
                    <div className="book-body">
                      <div className="publisher">
                        <PublisherLink publisher={book.publisher} />
                      </div>
                      <h4>
                        <Link href={`/livres/${book.slug}`}>{book.title}</Link>
                      </h4>
                      <Link href="/de-serge" className="author">{book.author}</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{ background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 14, padding: "28px 24px" }}>
              <div className="eyebrow" style={{ textTransform: "none" }}>
                amDG Éditions
              </div>
              <h3 style={{ fontSize: 20, margin: "10px 0 12px", lineHeight: 1.3 }}>Une collection en pleine croissance</h3>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 18 }}>
                {books.length} ouvrage{books.length > 1 ? "s" : ""} publié{books.length > 1 ? "s" : ""} à ce jour, entre
                enseignement, prophétie et vie chrétienne. Chaque livre prolonge le message porté sur ce site.
              </p>
              <Link href="/livres" className="btn btn-outline" style={{ width: "100%", justifyContent: "center" }}>
                Voir le catalogue →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="give" id="partenariat">
        <div className="wrap">
          <div>
            <div className="eyebrow">Soutenir</div>
            <h2>Associez-vous à cette œuvre du Royaume de Dieu</h2>
            <p>
              Depuis des générations, la Parole de Dieu a apporté la guérison, le salut et la lumière dans la vie de
              milliers de personnes. Ce n&apos;est possible que grâce à votre générosité.
            </p>
            <Link href="/partenariat" className="btn btn-primary">
              Devenir semeur de la Parole →
            </Link>
          </div>
          <div className="give-points">
            <div className="give-point">
              <div className="num">I</div>
              <div>
                <h5>Un ministère libre</h5>
                <p>Sans dépendance, entièrement soutenu par la générosité.</p>
              </div>
            </div>
            <div className="give-point">
              <div className="num">II</div>
              <div>
                <h5>Des publications exigeantes</h5>
                <p>Votre soutien rend possible chaque nouvel ouvrage.</p>
              </div>
            </div>
            <div className="give-point">
              <div className="num">III</div>
              <div>
                <h5>Un don unique, mensuel ou annuel</h5>
                <p>Vous choisissez le montant et la fréquence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="reseaux">
        <div className="wrap">
          <div className="section-head">
            <h2>
              Suivre <em>Serge Hapita</em>
            </h2>
          </div>
          <div className="social-grid">
            {socialLinks.map((link) => (
              <a className="social-card" key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
                <div className="icon">{SOCIAL_ICON[link.label] ?? "★"}</div>
                <h5>{link.label}</h5>
                <span>{SOCIAL_HANDLE[link.label] ?? ""}</span>
                <span className="btn btn-ghost" style={{ padding: "8px 16px", fontSize: 12.5 }}>
                  Suivre →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
