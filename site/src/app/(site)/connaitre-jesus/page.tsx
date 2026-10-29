import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ShareCartouche from "@/components/articles/ShareCartouche";
import PrayerForm from "@/components/forms/PrayerForm";
import { getPageContent } from "@/lib/content/pageContent";

const title = "Connaître Jésus | Serge Hapita Ministries";
const description = "Découvrez qui est Jésus, pourquoi il est venu et la vie qu'il offre aujourd'hui.";
const PAGE_URL = "https://sergehapitaministries.org/connaitre-jesus";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/connaitre-jesus" },
  openGraph: {
    type: "website",
    title,
    description,
    url: "/connaitre-jesus",
    siteName: "Serge Hapita Ministries",
    locale: "fr_FR",
  },
  twitter: { card: "summary_large_image", title, description },
};

// V2 (retour du 11/09, Lot 2) — reproduit prototype-html/connaitre-jesus/
// index.html + publications.css § .cj-*. Texte repris tel quel du
// prototype (le récit intégral en 4 étapes + les 11 repères). Le YouTube
// embed garde la même vidéo que la version actuelle (id inchangé), la
// zone de partage (ShareCartouche) et le formulaire de prière (PrayerForm)
// restent les vrais composants déjà câblés — jamais les faux boutons
// statiques du prototype.
const THEME_LAYOUT: { id?: string; wide?: boolean; variant?: "dark" | "accent" }[] = [
  { id: "naissance", wide: true },
  { id: "oeuvre" },
  {},
  {},
  { wide: true, variant: "dark" },
  {},
  { id: "resurrection" },
  {},
  { wide: true, variant: "accent" },
  {},
  {},
];

export default async function ConnaitreJesusPage() {
  const content = await getPageContent("connaitre-jesus");
  const themes = THEME_LAYOUT.map((layout, index) => ({
    ...layout,
    title: content[`theme_${index + 1}_title`],
    text: content[`theme_${index + 1}_text`],
  }));
  return (
    <div className="v2-cj-page">
      <section className="v2-cj-hero">
        <div className="v2-cj-orbit one" aria-hidden="true" />
        <div className="v2-cj-orbit two" aria-hidden="true" />
        <div className="v2-wrap v2-cj-hero-inner">
          <p className="v2-eyebrow light">
            <span /> {content.hero_eyebrow}
          </p>
          <h1>
            {content.hero_title_1}
            <br />
            <em>{content.hero_title_2}</em>
          </h1>
          <p>{content.hero_intro}</p>
          <a className="v2-cj-scroll" href="#commencer">
            {content.hero_action} <span>↓</span>
          </a>
        </div>
      </section>

      <nav className="v2-cj-subnav" aria-label="Parcours Connaître Jésus">
        <div className="v2-wrap">
          <a href="#commencer">{content.nav_story}</a>
          <a href="#pourquoi">{content.nav_purpose}</a>
          <a href="#decouvrir">{content.nav_discover}</a>
          <a href="#recevoir">{content.nav_receive}</a>
        </div>
      </nav>

      <section className="v2-cj-story v2-wrap" id="commencer">
        <div className="v2-cj-story-heading">
          <p className="v2-eyebrow">
            <span /> {content.story_eyebrow}
          </p>
          <h2>
            {content.story_title_1}
            <br />
            {content.story_title_2}
          </h2>
        </div>
        <div className="v2-cj-story-body">
          <div className="v2-video-frame">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/_8Iucad0hFg"
              title="Connaître Jésus"
              style={{ border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="v2-cj-lead">
            <div dangerouslySetInnerHTML={{ __html: content.story_lead }} />
          </div>
        </div>

        <div className="v2-cj-journey" aria-label="Le cheminement du récit de Jésus">
          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>01</span>
              <small>{content.step_1_label}</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>{content.step_1_title}</h3>
              <p>{content.step_1_body}</p>
            </div>
          </article>

          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>02</span>
              <small>{content.step_2_label}</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>{content.step_2_title}</h3>
              <p>{content.step_2_body}</p>
              <blockquote>
                {content.step_2_quote_1}
                <cite>{content.step_2_ref_1}</cite>
              </blockquote>
              <blockquote>
                {content.step_2_quote_2}
                <cite>{content.step_2_ref_2}</cite>
              </blockquote>
            </div>
          </article>

          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>03</span>
              <small>{content.step_3_label}</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>{content.step_3_title}</h3>
              <p>{content.step_3_body}</p>
            </div>
          </article>

          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>04</span>
              <small>{content.step_4_label}</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>{content.step_4_title}</h3>
              <p>{content.step_4_body_1}</p>
              <p>{content.step_4_body_2}</p>
              <blockquote>
                {content.step_4_quote_1}
                <cite>{content.step_4_ref_1}</cite>
              </blockquote>
              <blockquote>
                {content.step_4_quote_2}
                <cite>{content.step_4_ref_2}</cite>
              </blockquote>
            </div>
          </article>
        </div>
      </section>

      <section className="v2-cj-purpose" id="pourquoi">
        <div className="v2-wrap v2-cj-purpose-grid">
          <div>
            <p className="v2-eyebrow light">
              <span /> {content.purpose_eyebrow}
            </p>
            <h2>{content.purpose_title}</h2>
          </div>
          <div className="v2-cj-purpose-copy">
            <p>{content.purpose_paragraph_1}</p>
            <p>{content.purpose_paragraph_2}</p>
            <p>{content.purpose_paragraph_3}</p>
            <blockquote>
              {content.purpose_quote.split("\n").map((line, index) => (
                <span key={`${index}-${line}`}>
                  {line}
                  {index < content.purpose_quote.split("\n").length - 1 && <br />}
                </span>
              ))}
              <cite>{content.purpose_reference}</cite>
            </blockquote>
            <p className="v2-cj-grace-note">
              {content.purpose_grace}
            </p>
          </div>
        </div>
      </section>

      <section className="v2-cj-discover v2-wrap" id="decouvrir">
        <div className="v2-section-heading">
          <div>
            <p className="v2-eyebrow">
              <span /> {content.discover_eyebrow}
            </p>
            <h2>{content.discover_title}</h2>
          </div>
          <p>{content.discover_intro}</p>
        </div>
        <div className="v2-cj-theme-grid">
          {themes.map((theme, i) => (
            <article
              key={theme.title}
              id={theme.id}
              className={`v2-cj-theme${theme.wide ? " wide" : ""}${theme.variant ? ` ${theme.variant}` : ""}`}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{theme.title}</h3>
                <p>{theme.text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Zone de partage — composant partagé (ShareCartouche), habillage
          réaligné sur publications.css § .share-zone (retour de validation
          humaine : la maquette prévoit bien un style propre ici, pas
          l'ancien design de production). Fonctionnement du composant
          inchangé, seule l'invite affichée est propre à cette page (pas de
          catégorie ici). */}
      <section className="share-zone">
        <div className="content-col">
          <ShareCartouche
            title={`${content.hero_title_1} ${content.hero_title_2}`}
            url={PAGE_URL}
            invite={content.share_invite}
          />
        </div>
      </section>

      <section className="v2-cj-receive" id="recevoir">
        <div className="v2-wrap v2-cj-receive-grid">
          <div className="v2-cj-receive-copy">
            <p className="v2-eyebrow light">
              <span /> {content.receive_eyebrow}
            </p>
            <h2>{content.receive_title}</h2>
            <p>{content.receive_body}</p>
            <p className="v2-cj-promise">
              {content.receive_promise} <span>{content.receive_reference}</span>
            </p>
          </div>
          <PrayerForm />
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}

