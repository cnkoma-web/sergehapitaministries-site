import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { getPageContent } from "@/lib/content/pageContent";

const title = "Mission | Serge Hapita Ministries";
const description =
  "Découvrez la mission de Serge Hapita Ministries : révéler Christ, affermir le chrétien dans son identité de fils et manifester le Royaume de Dieu.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mission" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/mission",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 2) — nouvelle page, n'existait pas avant.
// Reproduit prototype-html/mission/index.html + styles.css § .mission-*.
// Texte verrouillé, repris tel quel du prototype (le mandat "La vérité
// qui rend libre" ouvre sur Actes 26:15-18) — page statique, sans CMS,
// sur le modèle de De Serge.
export default async function MissionPage() {
  const content = await getPageContent("mission");

  return (
    <div className="v2-mission-page">
      <section className="v2-mission-hero">
        <div className="v2-mission-orbit one" aria-hidden="true" />
        <div className="v2-mission-orbit two" aria-hidden="true" />
        <div className="v2-wrap v2-mission-hero-inner">
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
        </div>
      </section>

      <section className="v2-mission-opening">
        <div className="v2-wrap v2-mission-opening-grid">
          <div className="v2-section-index v2-mission-index">
            <span>01</span>
            <p>{content.mandate_label}</p>
          </div>
          <div className="v2-mission-copy v2-mission-opening-copy">
            <blockquote className="v2-mission-lead">
              {content.mandate_quote}
              <cite>{content.mandate_reference}</cite>
            </blockquote>
            <div dangerouslySetInnerHTML={{ __html: content.mandate_body }} />
          </div>
        </div>
        <figure className="v2-wrap v2-mission-wide-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/v2/mission-bapteme.jpg" alt="Serge Hapita accompagnant un homme lors d'un baptême" />
        </figure>
      </section>

      <section className="v2-mission-truth">
        <div className="v2-wrap v2-mission-truth-grid">
          <figure className="v2-mission-truth-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/mission-proclamation.jpg" alt="Serge Hapita proclamant la Parole avec un microphone" />
          </figure>
          <div className="v2-mission-copy v2-mission-truth-copy">
            <p className="v2-eyebrow light">
              <span /> {content.revelation_eyebrow}
            </p>
            <h2>{content.revelation_title}</h2>
            <div dangerouslySetInnerHTML={{ __html: content.revelation_body }} />
          </div>
        </div>
      </section>

      <section className="v2-mission-sonship">
        <div className="v2-wrap v2-mission-sonship-grid">
          <div className="v2-section-index v2-mission-index v2-mission-index-light">
            <span>03</span>
            <p>{content.identity_label}</p>
          </div>
          <div className="v2-mission-copy v2-mission-sonship-copy">
            <h2>{content.identity_title}</h2>
            <div dangerouslySetInnerHTML={{ __html: content.identity_body }} />
            <p
              className="v2-mission-sonship-emphasis"
              dangerouslySetInnerHTML={{ __html: content.identity_emphasis }}
            />
          </div>
        </div>
      </section>

      <section className="v2-mission-kingdom">
        <div className="v2-wrap v2-mission-kingdom-grid">
          <div className="v2-mission-copy v2-mission-kingdom-copy">
            <p className="v2-eyebrow">
              <span /> {content.manifestation_eyebrow}
            </p>
            <h2>{content.manifestation_title}</h2>
            <div dangerouslySetInnerHTML={{ __html: content.manifestation_body }} />
          </div>
          <figure className="v2-mission-kingdom-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/mission-envoi.jpg" alt="Serge Hapita enseignant la Parole devant une assemblée" />
          </figure>
        </div>
      </section>

      <section className="v2-mission-next">
        <div className="v2-wrap v2-mission-next-inner">
          <p className="v2-eyebrow light">
            <span /> {content.next_eyebrow}
          </p>
          <h2>{content.next_title}</h2>
          <div className="v2-mission-next-links">
            <Link href="/connaitre-jesus">
              <span>{content.next_first_intro}</span>
              <strong>{content.next_first_action}</strong>
            </Link>
            <Link href="/contact">
              <span>{content.next_second_intro}</span>
              <strong>{content.next_second_action}</strong>
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
