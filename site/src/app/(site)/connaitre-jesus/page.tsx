import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ShareCartouche from "@/components/articles/ShareCartouche";
import PrayerForm from "@/components/forms/PrayerForm";

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
const THEMES: { id?: string; wide?: boolean; variant?: "dark" | "accent"; title: string; text: string }[] = [
  { id: "naissance", wide: true, title: "Sa naissance miraculeuse", text: "Jésus est né d'une vierge. Cela constitue un miracle et un signe." },
  { id: "oeuvre", title: "Ses actes miraculeux", text: "Jésus montra, par de nombreux actes extraordinaires, qu'il venait de Dieu." },
  { title: "Ses apparitions", text: "Jésus apparut à plus de cinq cents personnes après sa mort." },
  { title: "Dieu témoigne de Jésus", text: "Par sa naissance, sa vie, sa mort volontaire, sa résurrection et son ascension visible." },
  { wide: true, variant: "dark", title: "Sa déclaration personnelle", text: "Jésus déclara lui-même qu'il avait été envoyé de Dieu comme Fils de Dieu." },
  { title: "Sa mort sacrificielle", text: "Jésus mourut pour nous comme un sacrifice, conformément à ce que la Bible annonçait." },
  { id: "resurrection", title: "Sa résurrection", text: "Dieu le ressuscita le troisième jour — la preuve qu'il venait de Dieu." },
  { title: "Son ascension physique", text: "Il monta au ciel à travers les nuages, sous les yeux d'environ cent vingt personnes." },
  { wide: true, variant: "accent", title: "Son nom aujourd'hui", text: "Dieu a investi de la puissance dans le nom de Jésus, qui agit encore aujourd'hui." },
  { title: "La nature de Dieu donnée", text: "Celui qui croit en Lui reçoit la vie éternelle dans son cœur, par la foi." },
  { title: "La purification du péché", text: "La vie éternelle entre dans le cœur, et la nature du péché disparaît." },
];

export default function ConnaitreJesusPage() {
  return (
    <div className="v2-cj-page">
      <section className="v2-cj-hero">
        <div className="v2-cj-orbit one" aria-hidden="true" />
        <div className="v2-cj-orbit two" aria-hidden="true" />
        <div className="v2-wrap v2-cj-hero-inner">
          <p className="v2-eyebrow light">
            <span /> Découvrez celui qui donne la vie
          </p>
          <h1>
            Connaître
            <br />
            <em>Jésus</em>
          </h1>
          <p>Une histoire incroyable. Et pourtant…</p>
          <a className="v2-cj-scroll" href="#commencer">
            Commencer le parcours <span>↓</span>
          </a>
        </div>
      </section>

      <nav className="v2-cj-subnav" aria-label="Parcours Connaître Jésus">
        <div className="v2-wrap">
          <a href="#commencer">Son histoire</a>
          <a href="#pourquoi">Pourquoi il est venu</a>
          <a href="#decouvrir">Le découvrir</a>
          <a href="#recevoir">Recevoir Jésus</a>
        </div>
      </nav>

      <section className="v2-cj-story v2-wrap" id="commencer">
        <div className="v2-cj-story-heading">
          <p className="v2-eyebrow">
            <span /> Le récit intégral
          </p>
          <h2>
            Qui est cet homme
            <br />
            appelé Jésus ?
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
            <p>
              Il y a presque deux mille ans, un homme du nom de <strong>Jésus est né d&apos;une vierge.</strong>
            </p>
          </div>
        </div>

        <div className="v2-cj-journey" aria-label="Le cheminement du récit de Jésus">
          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>01</span>
              <small>Sa venue</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>Jésus est né d&apos;une vierge.</h3>
              <p>
                Il a déclaré qu&apos;il avait été envoyé de Dieu pour donner sa vie en rançon des péchés de
                l&apos;humanité. Sa naissance elle-même était un miracle, parce qu&apos;il est venu au monde sans
                intervention d&apos;un homme. Et tout au long de sa vie, il a montré, par plusieurs signes
                extraordinaires, qu&apos;il venait réellement de Dieu et qu&apos;il apportait un message venant de
                Dieu.
              </p>
            </div>
          </article>

          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>02</span>
              <small>Son sacrifice</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>Jésus est mort pour nous comme un sacrifice.</h3>
              <p>
                La Bible raconte que Jésus est mort pour nous comme un sacrifice. Cela veut dire qu&apos;il a pris sur
                lui la condamnation qui revenait à l&apos;humanité. Il a porté la séparation, la culpabilité et le
                poids du péché à notre place. Il est mort comme celui qui assume la faute afin que nous puissions
                recevoir le pardon.
              </p>
              <blockquote>
                « Christ est mort pour nos péchés, selon les Écritures ; il a été enseveli, et il est ressuscité le
                troisième jour, selon les Écritures. »
                <cite>1 Corinthiens 15:3-4</cite>
              </blockquote>
              <blockquote>
                « Lui qui a été livré pour nos offenses et est ressuscité pour notre justification. »
                <cite>Romains 4:25</cite>
              </blockquote>
            </div>
          </article>

          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>03</span>
              <small>Sa résurrection</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>Le troisième jour, Dieu l&apos;a ressuscité.</h3>
              <p>
                Il a été enterré. Et le troisième jour, Dieu a confirmé qu&apos;il venait véritablement de Lui en le
                ressuscitant d&apos;entre les morts. Sa résurrection était la preuve que sa mort avait accompli sa
                mission : ouvrir à l&apos;humanité un chemin de pardon et de réconciliation avec Dieu.
              </p>
            </div>
          </article>

          <article className="v2-cj-journey-step">
            <div className="v2-cj-step-marker">
              <span>04</span>
              <small>Son ascension</small>
            </div>
            <div className="v2-cj-step-copy">
              <h3>Il est monté au ciel.</h3>
              <p>
                Après cela, Jésus est apparu à de nombreuses personnes : plus de cinq cents témoins l&apos;ont vu
                vivant après sa résurrection. Puis il est monté au ciel devant cent vingt personnes qui ont vu son
                ascension de leurs propres yeux. Il est monté physiquement, à travers les nuages — une preuve
                supplémentaire qu&apos;il était réellement le Fils de Dieu.
              </p>
              <p>
                Et c&apos;est pour cela que nous parlons de Jésus. Parce qu&apos;il était plus qu&apos;un simple
                leader religieux. Dieu Tout-Puissant a témoigné de Lui par sa naissance miraculeuse, par sa vie
                extraordinaire, par sa mort — où il a volontairement remis son esprit — par sa résurrection, et enfin
                par son ascension au ciel. Il n&apos;a pas disparu : des témoins l&apos;ont vu monter et traverser les
                nuées sous leurs yeux. Et ces mêmes témoins, pour la plupart, ont préféré être exécutés plutôt que de
                renoncer à ce qu&apos;ils avaient vu.
              </p>
              <blockquote>
                « Après avoir dit cela, il fut élevé pendant qu&apos;ils le regardaient, et une nuée le déroba à leurs
                yeux. […] »
                <cite>Actes 1:9</cite>
              </blockquote>
              <blockquote>
                « …déclaré Fils de Dieu avec puissance, selon l&apos;Esprit de sainteté, par sa résurrection
                d&apos;entre les morts… »
                <cite>Romains 1:4</cite>
              </blockquote>
            </div>
          </article>
        </div>
      </section>

      <section className="v2-cj-purpose" id="pourquoi">
        <div className="v2-wrap v2-cj-purpose-grid">
          <div>
            <p className="v2-eyebrow light">
              <span /> Ce que cela change aujourd&apos;hui
            </p>
            <h2>Son nom agit encore.</h2>
          </div>
          <div className="v2-cj-purpose-copy">
            <p>
              Mais il y a plus encore : Dieu a investi de la puissance dans son nom et a élevé ce nom au-dessus de
              tout autre nom. Aujourd&apos;hui, presque deux mille ans après ces événements, le nom de Jésus agit
              encore en faveur de quiconque croit et invoque ce nom. À la mention de son nom, il se produit des
              miracles. À la mention de son nom, les esprits mauvais tremblent. Son nom possède toujours la même
              puissance.
            </p>
            <p>
              Et si quelqu&apos;un croit en ce Jésus de Nazareth, Jésus lui donne la vie éternelle en le transférant
              du domaine des ténèbres, du domaine de la mort, au royaume de la vie : le royaume du Fils de Dieu.
            </p>
            <p>
              Pas besoin de le voir avec les yeux physiques. Il suffit de croire. On croit avec le cœur. Dieu a doté
              chaque être humain de la capacité de croire en un Dieu invisible. C&apos;est pourquoi croire est un
              choix. Personne ne pourra se tenir devant Dieu et dire qu&apos;il n&apos;a pas pu croire. C&apos;est une
              vérité simple, mais d&apos;une puissance immense. Aujourd&apos;hui, tu peux recevoir la vie que ce Jésus
              offre en confessant sa Seigneurie : Lui seul est Dieu.
            </p>
            <blockquote>
              « Si tu confesses de ta bouche le Seigneur Jésus, et si tu crois dans ton cœur que Dieu l&apos;a
              ressuscité des morts, tu seras sauvé. Car c&apos;est en croyant du cœur qu&apos;on devient juste, et
              c&apos;est en confessant de la bouche qu&apos;on parvient au salut. »
              <br />
              <br />
              « Car quiconque invoquera le nom du Seigneur sera sauvé. »
              <cite>Romains 10:9-10, 13</cite>
            </blockquote>
            <p className="v2-cj-grace-note">
              Par sa grâce, Dieu a déjà fait tout ce qu&apos;il fallait pour réconcilier l&apos;humanité avec Lui. Ta
              part est simplement de croire et de recevoir son pardon.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-cj-discover v2-wrap" id="decouvrir">
        <div className="v2-section-heading">
          <div>
            <p className="v2-eyebrow">
              <span /> Les repères du récit
            </p>
            <h2>Découvrir Jésus</h2>
          </div>
          <p>Onze repères permettent de relire le même récit, sans remplacer le texte qui en constitue le cœur.</p>
        </div>
        <div className="v2-cj-theme-grid">
          {THEMES.map((theme, i) => (
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
            title="Connaître Jésus"
            url={PAGE_URL}
            invite="Partage ce message avec une personne qui désire connaître Jésus."
          />
        </div>
      </section>

      <section className="v2-cj-receive" id="recevoir">
        <div className="v2-wrap v2-cj-receive-grid">
          <div className="v2-cj-receive-copy">
            <p className="v2-eyebrow light">
              <span /> Une décision personnelle
            </p>
            <h2>Je veux recevoir Jésus</h2>
            <p>
              Aujourd&apos;hui peut marquer un jour historique pour vous. Vous pouvez recevoir la vie que Jésus offre
              en croyant dans votre cœur et en invoquant son nom.
            </p>
            <p className="v2-cj-promise">
              « Car quiconque invoquera le nom du Seigneur sera sauvé. » <span>Romains 10:13</span>
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
