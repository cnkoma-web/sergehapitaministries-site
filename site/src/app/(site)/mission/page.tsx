import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

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
export default function MissionPage() {
  return (
    <div className="v2-mission-page">
      <section className="v2-mission-hero">
        <div className="v2-mission-orbit one" aria-hidden="true" />
        <div className="v2-mission-orbit two" aria-hidden="true" />
        <div className="v2-wrap v2-mission-hero-inner">
          <p className="v2-eyebrow light">
            <span /> La mission
          </p>
          <h1>
            Révéler Christ.
            <br />
            Affermir le chrétien.
            <br />
            <em>Manifester le Royaume.</em>
          </h1>
        </div>
      </section>

      <section className="v2-mission-opening">
        <div className="v2-wrap v2-mission-opening-grid">
          <div className="v2-section-index v2-mission-index">
            <span>01</span>
            <p>Le mandat</p>
          </div>
          <div className="v2-mission-copy v2-mission-opening-copy">
            <blockquote className="v2-mission-lead">
              « Ouvrir les yeux des hommes, les faire passer des ténèbres à la lumière et de la puissance de Satan à
              Dieu, afin qu&apos;ils reçoivent, par la foi en Jésus-Christ, le pardon des péchés et l&apos;héritage
              avec les sanctifiés. »
              <cite>Actes 26:15-18</cite>
            </blockquote>
            <p>Le ministère de Serge Hapita est né de ce mandat.</p>
            <p>
              Si tu ne connais pas encore Christ, ce mandat s&apos;adresse à toi en premier : la vie que Dieu te
              propose commence par cette rencontre, et rien de ce qui suit n&apos;a de sens sans elle.
            </p>
            <p>
              Ce mandat rejoint aussi celui qui croit déjà. Car il est possible d&apos;avoir cru, de lire les
              Écritures et de confesser sa foi, tout en demeurant prisonnier de réalités dont la vérité est pourtant
              venue nous affranchir.
            </p>
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
              <span /> 02 — La révélation
            </p>
            <h2>La vérité qui rend libre</h2>
            <p>
              Jésus s&apos;adressait à des Juifs qui avaient cru en Lui lorsqu&apos;Il leur déclara : « Si vous
              demeurez dans ma parole, vous êtes vraiment mes disciples ; vous connaîtrez la vérité, et la vérité
              vous affranchira » (Jean 8:31-32).
            </p>
            <p>
              Peut-être crois-tu sincèrement en Dieu, et pourtant tu restes enfermé dans la peur, la culpabilité, des
              traditions humaines, ou une image de toi-même que la nouvelle naissance a déjà rendue caduque. Tu
              possèdes dans les Écritures la vérité capable de te rendre libre — mais cette vérité doit encore être
              révélée à ton cœur. C&apos;est précisément là qu&apos;intervient ce ministère : non pas t&apos;apporter
              une information de plus, mais ouvrir en toi ce que tu n&apos;as pas encore vu.
            </p>
            <p>
              C&apos;est pourquoi Paul priait pour que les croyants reçoivent un esprit de sagesse et de révélation
              dans la connaissance de Dieu, et que les yeux de leur cœur soient éclairés (Éphésiens 1:17-18). Lorsque
              cette lumière se lève, tu reconnais ce que tu es devenu en Christ, ce que tu possèdes déjà en Lui, et la
              vie à laquelle Dieu t&apos;a appelé.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-mission-sonship">
        <div className="v2-wrap v2-mission-sonship-grid">
          <div className="v2-section-index v2-mission-index v2-mission-index-light">
            <span>03</span>
            <p>L&apos;identité</p>
          </div>
          <div className="v2-mission-copy v2-mission-sonship-copy">
            <h2>La conscience d&apos;être fils</h2>
            <p>
              Découvrir Christ te conduit à connaître Dieu comme ton Père. Tu prends conscience de la position que la
              grâce t&apos;a donnée, et tu apprends à vivre depuis cette réalité plutôt qu&apos;à la chercher.
            </p>
            <p>
              Cette conscience change ta manière de penser, de croire, de parler et d&apos;agir. Elle t&apos;établit
              dans la justice, renouvelle ton intelligence et fait naître en toi l&apos;assurance nécessaire pour
              accomplir ce que Dieu a préparé d&apos;avance pour toi.
            </p>
            <p className="v2-mission-sonship-emphasis">
              Le fils qui connaît le Père porte Son empreinte dans son monde. Jésus pouvait dire : « Celui qui m&apos;a
              vu a vu le Père » (Jean 14:9). C&apos;est cette même dynamique qui se poursuit à travers ceux que ce
              ministère accompagne.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-mission-kingdom">
        <div className="v2-wrap v2-mission-kingdom-grid">
          <div className="v2-mission-copy v2-mission-kingdom-copy">
            <p className="v2-eyebrow">
              <span /> 04 — La manifestation
            </p>
            <h2>Le Royaume rendu visible</h2>
            <p>
              Le Royaume de Dieu se manifeste lorsque Son règne atteint concrètement la vie des hommes : les captifs
              sont libérés, les malades guéris, les opprimés délivrés, les vies brisées restaurées. Ce n&apos;est pas
              une image — c&apos;est ce que le Salut accompli en Jésus-Christ produit quand il cesse d&apos;être une
              doctrine et devient une réalité expérimentée.
            </p>
            <p>
              Par l&apos;enseignement de la Parole, l&apos;annonce de l&apos;Évangile, la prière et l&apos;exercice de
              l&apos;autorité du Nom de Jésus, Serge Hapita Ministries œuvre pour que les hommes voient, comprennent
              et expérimentent ce que Dieu leur a déjà donné en Christ.
            </p>
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
            <span /> Et maintenant ?
          </p>
          <h2>Et maintenant ?</h2>
          <div className="v2-mission-next-links">
            <Link href="/connaitre-jesus">
              <span>Si tu ne connais pas encore Christ,</span>
              <strong>découvre qui Il est →</strong>
            </Link>
            <Link href="/contact">
              <span>Si ce que tu viens de lire résonne avec quelque chose que tu portes déjà,</span>
              <strong>contacte Serge →</strong>
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </div>
  );
}
