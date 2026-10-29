import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { getBooks } from "@/lib/content/books";
import { formatPrice } from "@/lib/format";
import { getPageContent } from "@/lib/content/pageContent";

const title = "De Serge | Serge Hapita Ministries";
const description =
  "Prophète de la révélation de Christ et de la conscience filiale. Découvrez le parcours de Serge Hapita.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/de-serge" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/de-serge",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 2) — reproduit prototype-html/de-serge/index.html
// + styles.css § .ds-*. Réhabillage visuel uniquement : seule donnée
// dynamique (getBooks pour "Dernière parution") inchangée. Texte repris tel
// quel du prototype, jamais réécrit (hiérarchie des références du dossier,
// §3 : le prototype fait autorité sur les textes validés par Serge).
export default async function DeSergePage() {
  const [books, content] = await Promise.all([getBooks(), getPageContent("de-serge")]);
  const latestBook = books[0] ?? null;

  return (
    <div className="v2-ds-page">
      <section className="v2-ds-hero">
        <div className="v2-ds-hero-photo" aria-hidden="true" />
        <div className="v2-ds-hero-orbit" aria-hidden="true" />
        <div className="v2-wrap v2-ds-hero-inner">
          <div className="v2-ds-hero-copy">
            <p className="v2-eyebrow light">
              <span /> {content.hero_eyebrow}
            </p>
            <h1>
              {content.hero_title_1}
              <br />
              {content.hero_title_2} <em>{content.hero_title_emphasis}</em>
            </h1>
            {/* Une seule citation continue, guillemet fermant après
                "vivre." (retour du 11/09, bug réel signalé par Serge) —
                le prototype refermait par erreur après "sa vie." puis
                repartait sur un second paragraphe sans guillemets, alors
                que c'est une seule et même citation, sur 2 niveaux de
                police (la phrase-clé, puis son développement, plus
                petit). */}
            <blockquote>
              {content.hero_quote}
              <span className="v2-ds-hero-quote-secondary">
                {content.hero_quote_secondary}
              </span>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="v2-ds-opening">
        <div className="v2-wrap v2-ds-opening-grid">
          <Link href="/mission" className="v2-section-index v2-ds-mission-index">
            <span>01</span>
            <p>{content.mission_link}</p>
          </Link>
          <div className="v2-ds-lead" dangerouslySetInnerHTML={{ __html: content.opening_body }} />
        </div>
      </section>

      <section className="v2-ds-portrait">
        <div className="v2-wrap v2-ds-portrait-grid">
          <div className="v2-ds-portrait-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/portrait-serge.jpg" alt="Portrait de Serge Hapita" />
            <span>{content.portrait_caption}</span>
          </div>
          <div className="v2-ds-portrait-copy">
            <p className="v2-eyebrow light">
              <span /> {content.portrait_eyebrow}
            </p>
            <p>{content.portrait_paragraph_1}</p>
            <p>{content.portrait_paragraph_2}</p>
          </div>
        </div>
      </section>

      <section className="v2-ds-story">
        <div className="v2-wrap">
          <div className="v2-ds-story-heading">
            <div className="v2-section-index">
              <span>02</span>
              <p>{content.story_label}</p>
            </div>
            <h2>
              {content.story_title_1}
              <br />
              {content.story_title_2}
            </h2>
          </div>

          <div className="v2-ds-timeline">
            <article className="v2-ds-milestone">
              <div>
                <strong>{content.milestone_1_year}</strong>
                <span>{content.milestone_1_title}</span>
              </div>
              <p>{content.milestone_1_body}</p>
            </article>

            <article className="v2-ds-milestone">
              <div>
                <strong>{content.milestone_2_year}</strong>
                <span>{content.milestone_2_title}</span>
              </div>
              <div className="v2-ds-milestone-copy" dangerouslySetInnerHTML={{ __html: content.milestone_2_body }} />
            </article>
          </div>

          <blockquote className="v2-ds-scripture">
            {content.scripture_quote}
            <cite>{content.scripture_reference}</cite>
          </blockquote>

          <div className="v2-ds-today">
            <div className="v2-ds-today-mark">{content.today_label}</div>
            <div dangerouslySetInnerHTML={{ __html: content.today_body }} />
          </div>

          <article className="v2-ds-formation">
            <div className="v2-ds-formation-years" aria-label="Années de formation">
              <span>{content.formation_start}</span>
              <i />
              <span>{content.formation_end}</span>
            </div>
            <div>
              <p className="v2-eyebrow">
                <span /> {content.formation_eyebrow}
              </p>
              <div className="v2-ds-formation-copy" dangerouslySetInnerHTML={{ __html: content.formation_body }} />
            </div>
          </article>

          <blockquote className="v2-ds-closing-signature">
            <p>
              {content.closing_quote}
            </p>
            <footer>{content.closing_signature}</footer>
          </blockquote>
        </div>
      </section>

      <section className="v2-ds-invite">
        <div className="v2-wrap v2-ds-invite-inner">
          <div>
            <p className="v2-eyebrow light">
              <span /> {content.invite_eyebrow}
            </p>
            <p className="v2-ds-invite-copy">{content.invite_text}</p>
            <h2>{content.invite_title}</h2>
          </div>
          <Link href="/invitation" className="v2-button v2-button-light">
            {content.invite_action} <span>→</span>
          </Link>
        </div>
      </section>

      <section className="v2-ds-stats" aria-label="Repères du parcours">
        <div className="v2-wrap v2-ds-stats-grid">
          <div>
            <strong>{content.stat_1_value}</strong>
            <span>{content.stat_1_label}</span>
          </div>
          <div>
            <strong>{content.stat_2_value}</strong>
            <span>{content.stat_2_label}</span>
          </div>
          <div>
            <strong>{content.stat_3_value}</strong>
            <span>{content.stat_3_label}</span>
          </div>
          <div>
            <strong>{content.stat_4_value}</strong>
            <span>{content.stat_4_label}</span>
          </div>
        </div>
      </section>

      <section className="v2-ds-association">
        <div className="v2-wrap v2-ds-association-grid">
          <div>
            <p className="v2-eyebrow">
              <span /> {content.association_eyebrow}
            </p>
            <h2>
              {content.association_title_1}
              <br />
              {content.association_title_2}
            </h2>
          </div>
          <div className="v2-ds-association-copy">
            <div dangerouslySetInnerHTML={{ __html: content.association_body }} />
            <a
              href="https://www.actesdesfilsdedieu.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="v2-button v2-button-outline"
            >
              {content.association_action} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      {latestBook && (
        <section className="v2-ds-book v2-wrap">
          <div className="v2-ds-book-cover">
            {latestBook.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={latestBook.cover_url} alt={latestBook.title} />
            ) : (
              <div style={{ aspectRatio: "2/3", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,var(--v2-violet),var(--v2-violet-deep))", padding: 14, textAlign: "center" }}>
                <div style={{ fontFamily: "var(--v2-serif)", fontWeight: 600, color: "#fff", fontSize: 18, lineHeight: 1.3 }}>{latestBook.title}</div>
              </div>
            )}
          </div>
          <div className="v2-ds-book-copy">
            <p className="v2-eyebrow">
              <span /> {content.book_eyebrow}
            </p>
            <h2>{latestBook.title}</h2>
            <p>
              {latestBook.price_cents != null
                ? `${formatPrice(latestBook.price_cents)} — publié sous ${latestBook.publisher}.`
                : `Publié sous ${latestBook.publisher}.`}
            </p>
            <Link href="/livres" className="v2-button v2-button-primary">
              {content.book_action} <span>→</span>
            </Link>
          </div>
        </section>
      )}

      <section className="v2-support-section" id="soutenir">
        <div className="v2-support-orb" aria-hidden="true" />
        <div className="v2-wrap v2-support-grid">
          <div className="v2-support-copy">
            <p className="v2-eyebrow light">
              <span /> {content.support_eyebrow}
            </p>
            <h2>{content.support_title}</h2>
            <p>{content.support_body}</p>
            <Link href="/partenariat" className="v2-button v2-button-light">
              {content.support_action} <span>→</span>
            </Link>
          </div>
          <div className="v2-support-points">
            <div>
              <b>I</b>
              <p>
                <strong>{content.support_point_1_title}</strong>
                <span>{content.support_point_1_text}</span>
              </p>
            </div>
            <div>
              <b>II</b>
              <p>
                <strong>{content.support_point_2_title}</strong>
                <span>{content.support_point_2_text}</span>
              </p>
            </div>
            <div>
              <b>III</b>
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
            {content.community_title_1}
            <br />
            {content.community_title_2}
          </h2>
        </div>
        <div className="v2-social-list">
          <a href="https://www.youtube.com/@sergehapita" target="_blank" rel="noopener noreferrer">
            <span>▶</span>
            <div>
              <strong>YouTube</strong>
              <small>@sergehapita</small>
            </div>
            <b>→</b>
          </a>
          <a href="https://www.instagram.com/sergehapitaministries/" target="_blank" rel="noopener noreferrer">
            <span>◎</span>
            <div>
              <strong>Instagram</strong>
              <small>@sergehapitaministries</small>
            </div>
            <b>→</b>
          </a>
          <a href="https://www.tiktok.com/@sergehapitaministries" target="_blank" rel="noopener noreferrer">
            <span>♪</span>
            <div>
              <strong>TikTok</strong>
              <small>@sergehapitaministries</small>
            </div>
            <b>→</b>
          </a>
          <a href="https://www.facebook.com/profile.php?id=61582211394401" target="_blank" rel="noopener noreferrer">
            <span>f</span>
            <div>
              <strong>Facebook</strong>
              <small>Serge Hapita Ministries</small>
            </div>
            <b>→</b>
          </a>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}

