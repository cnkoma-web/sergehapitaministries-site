import type { Metadata } from "next";
import Link from "next/link";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import { getBooks } from "@/lib/content/books";
import { formatPrice } from "@/lib/format";

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
  const books = await getBooks();
  const latestBook = books[0] ?? null;

  return (
    <div className="v2-ds-page">
      <section className="v2-ds-hero">
        <div className="v2-ds-hero-photo" aria-hidden="true" />
        <div className="v2-ds-hero-orbit" aria-hidden="true" />
        <div className="v2-wrap v2-ds-hero-inner">
          <div className="v2-ds-hero-copy">
            <p className="v2-eyebrow light">
              <span /> À propos de Serge
            </p>
            <h1>
              Une vie façonnée
              <br />
              par la <em>Parole de Dieu.</em>
            </h1>
            <blockquote>« C&apos;est bien de réussir dans la vie, mais c&apos;est encore mieux de réussir sa vie. »</blockquote>
            <p>
              Dieu a prévu pour chaque être humain une vie qui trouve sa plénitude en Christ. La véritable réussite,
              c&apos;est de la découvrir et de la vivre.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-ds-opening">
        <div className="v2-wrap v2-ds-opening-grid">
          <Link href="/mission" className="v2-section-index v2-ds-mission-index">
            <span>01</span>
            <p>Sa mission →</p>
          </Link>
          <div className="v2-ds-lead">
            <p>
              Dans un temps où beaucoup de justes ne marchent plus par la foi mais par le sensationnel, où la
              conscience de l&apos;identité divine a été remplacée par l&apos;activisme religieux — le prophète Serge
              Hapita ramène l&apos;Église à l&apos;essentiel : Christ en nous, l&apos;espérance de la gloire.
            </p>
            <p>
              <strong>Entrepreneur, écrivain-éditeur, orateur,</strong> il est avant tout <strong>ministre de la
              Parole, ambassadeur du Royaume,</strong> animé d&apos;une passion brûlante : porter le Salut de Dieu au
              monde, révéler Christ aux croyants et établir les chrétiens dans leur identité de fils, afin que tous
              manifestent la vie de Dieu, le Père céleste dans leur monde.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-ds-portrait">
        <div className="v2-wrap v2-ds-portrait-grid">
          <div className="v2-ds-portrait-image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/portrait-serge.jpg" alt="Portrait de Serge Hapita" />
            <span>Porter le salut de Christ jusqu&apos;aux extrémités de la terre.</span>
          </div>
          <div className="v2-ds-portrait-copy">
            <p className="v2-eyebrow light">
              <span /> Portrait
            </p>
            <p>
              Serge Hapita est un prophète de la révélation et de la conscience filiale. Son ministère porte une
              onction qui ravive la foi, restaure la communion avec Dieu le Père et la conscience de l&apos;identité
              de fils. Quand il partage la Parole, c&apos;est plus qu&apos;un discours, c&apos;est une rencontre avec
              l&apos;Esprit : la vie se manifeste, l&apos;esprit se réveille, la foi se met à l&apos;œuvre.
            </p>
            <p>
              Marié et père de famille, il vit la Parole et la rend visible, jusqu&apos;à faire ressentir le cœur du
              Père derrière chaque mot. Ce qu&apos;il annonce, il l&apos;incarne, et le transmet avec feu.
            </p>
          </div>
        </div>
      </section>

      <section className="v2-ds-story">
        <div className="v2-wrap">
          <div className="v2-ds-story-heading">
            <div className="v2-section-index">
              <span>02</span>
              <p>Son parcours</p>
            </div>
            <h2>
              Une marche
              <br />
              par l&apos;Esprit.
            </h2>
          </div>

          <div className="v2-ds-timeline">
            <article className="v2-ds-milestone">
              <div>
                <strong>1992</strong>
                <span>Révélation de Christ</span>
              </div>
              <p>
                Son parcours avec Dieu a commencé en 1992, lors d&apos;une croisade de l&apos;évangéliste Reinhard
                Bonnke dans un pays à majorité musulmane. Ce jour-là, il a rencontré le Seigneur et s&apos;est
                accroché à la Parole de Dieu. Depuis, elle n&apos;a cessé de guider sa marche en Christ, devenant
                vivante et active, façonnant son quotidien pour le conformer aux plans de Dieu pour sa vie.
              </p>
            </article>

            <article className="v2-ds-milestone">
              <div>
                <strong>2017</strong>
                <span>Mis à part pour l&apos;œuvre du ministère</span>
              </div>
              <div className="v2-ds-milestone-copy">
                <p>
                  En 2017, un moment décisif a changé sa manière de vivre sa foi en Christ. Alors qu&apos;il célébrait
                  ses réussites professionnelles, il a réalisé qu&apos;elles ne lui apportaient pas la paix et la
                  tranquillité qu&apos;il espérait. Dans cette remise en question,{" "}
                  <strong>
                    le Saint-Esprit lui a révélé que la paix véritable vient du repos en Christ (Matthieu 11:28), ce
                    repos que l&apos;on expérimente lorsqu&apos;on découvre la volonté de Dieu pour sa vie — Psaumes
                    139:15-16. On peut réussir dans la vie, mais c&apos;est encore mieux de réussir sa vie.
                  </strong>
                </p>
                <p>
                  Ce fut une révélation profonde : marcher avec Dieu ne consiste pas à accomplir de grandes choses
                  pour Lui ou en son Nom, mais à réaliser les œuvres que Dieu a préparées pour chacun de nous, comme
                  le dit Éphésiens 2:10 :
                </p>
              </div>
            </article>
          </div>

          <blockquote className="v2-ds-scripture">
            « Nous sommes son ouvrage, créés en Jésus-Christ pour de bonnes œuvres que Dieu a préparées d&apos;avance,
            afin que nous marchions en elles. »
            <cite>Éphésiens 2:10</cite>
          </blockquote>

          <div className="v2-ds-today">
            <div className="v2-ds-today-mark">Aujourd&apos;hui</div>
            <div>
              <p>
                Cette découverte a transformé sa vie spirituelle. Il a appris à écouter la voix de Dieu et à marcher
                comme un fils, <strong>expérimentant la vie divine dans la confiance et la dépendance
                quotidienne.</strong> Là où il y avait des murs d&apos;impossibilités, la provision de Dieu se
                manifesta — notamment par la naissance de son second enfant, un miracle pour sa famille.
              </p>
              <p>
                <strong>
                  Aujourd&apos;hui, son ministère est centré sur la révélation de Christ, l&apos;éveil de la
                  conscience filiale et la manifestation du Royaume de Dieu.
                </strong>{" "}
                Il accompagne de nombreuses personnes à connaître Christ, à découvrir leur identité en Lui, et à
                marcher dans ce pour quoi elles ont été faites : les œuvres que Dieu a préparées d&apos;avance pour
                elles.
              </p>
            </div>
          </div>

          <article className="v2-ds-formation">
            <div className="v2-ds-formation-years" aria-label="Années de formation">
              <span>2022</span>
              <i />
              <span>2024</span>
            </div>
            <div>
              <p className="v2-eyebrow">
                <span /> Formation spirituelle
              </p>
              <p>
                Serge a approfondi sa formation spirituelle à travers un cursus à <strong>ISM — l&apos;International
                School of Ministry</strong> du Pastor Chris Oyakhilome et au <strong>Charis Bible College</strong>{" "}
                d&apos;Andrew Wommack. Ces enseignements ont renforcé sa compréhension du message de la grâce, de la
                foi et de la vie de Christ en nous.
              </p>
            </div>
          </article>

          <blockquote className="v2-ds-closing-signature">
            <p>
              Chaque livre écrit, chaque message prêché, chaque action entreprise devient un appel au réveil, à la
              restauration, à l&apos;affermissement — et surtout, un cri pour ramener les cœurs à Dieu, le Père.
            </p>
            <footer>Serge Hapita</footer>
          </blockquote>
        </div>
      </section>

      <section className="v2-ds-invite">
        <div className="v2-wrap v2-ds-invite-inner">
          <div>
            <p className="v2-eyebrow light">
              <span /> Invitation
            </p>
            <p className="v2-ds-invite-copy">Vous souhaitez entendre et partager le message que Dieu lui a confié&nbsp;?</p>
            <h2>Invitez Serge</h2>
          </div>
          <Link href="/invitation" className="v2-button v2-button-light">
            J&apos;invite Serge <span>→</span>
          </Link>
        </div>
      </section>

      <section className="v2-ds-stats" aria-label="Repères du parcours">
        <div className="v2-wrap v2-ds-stats-grid">
          <div>
            <strong>1992</strong>
            <span>Révélation de Christ</span>
          </div>
          <div>
            <strong>7</strong>
            <span>Livres publiés</span>
          </div>
          <div>
            <strong>2017</strong>
            <span>Mis à part pour l&apos;œuvre du ministère</span>
          </div>
          <div>
            <strong>2</strong>
            <span>amDG · ActesDesFilsDeDieu</span>
          </div>
        </div>
      </section>

      <section className="v2-ds-association">
        <div className="v2-wrap v2-ds-association-grid">
          <div>
            <p className="v2-eyebrow">
              <span /> ActesDesFilsDeDieu
            </p>
            <h2>
              L&apos;association
              <br />
              qu&apos;il porte.
            </h2>
          </div>
          <div className="v2-ds-association-copy">
            <p>
              À travers l&apos;association ActesDesFilsDeDieu, il forme, exhorte et équipe les chrétiens pour
              manifester les vertus du Royaume dans leur génération (1 Pierre 2:9-10).{" "}
              <strong>
                Par l&apos;enseignement de la Parole, la prédication de l&apos;Évangile et la guérison des malades, il
                exerce son ministère dans la simplicité et la puissance de l&apos;Esprit.
              </strong>
            </p>
            <a
              href="https://www.actesdesfilsdedieu.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="v2-button v2-button-outline"
            >
              Découvrir ActesDesFilsDeDieu <span>↗</span>
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
              <span /> Le dernier livre de Serge Hapita
            </p>
            <h2>{latestBook.title}</h2>
            <p>
              {latestBook.price_cents != null
                ? `${formatPrice(latestBook.price_cents)} — publié sous ${latestBook.publisher}.`
                : `Publié sous ${latestBook.publisher}.`}
            </p>
            <Link href="/livres" className="v2-button v2-button-primary">
              Découvrir le dernier livre <span>→</span>
            </Link>
          </div>
        </section>
      )}

      <section className="v2-support-section" id="soutenir">
        <div className="v2-support-orb" aria-hidden="true" />
        <div className="v2-wrap v2-support-grid">
          <div className="v2-support-copy">
            <p className="v2-eyebrow light">
              <span /> Partenariat
            </p>
            <h2>Soutenir ce ministère</h2>
            <p>
              Votre soutien permet de continuer à écrire, enseigner et diffuser la Parole. Chaque don est une pierre
              ajoutée à cette œuvre.
            </p>
            <Link href="/partenariat" className="v2-button v2-button-light">
              Devenir partenaire <span>→</span>
            </Link>
          </div>
          <div className="v2-support-points">
            <div>
              <b>I</b>
              <p>
                <strong>Ouvrages</strong>
                <span>Soutenir l&apos;écriture et la publication de livres qui édifient.</span>
              </p>
            </div>
            <div>
              <b>II</b>
              <p>
                <strong>Enseignements</strong>
                <span>Financer les conférences et les publications hebdomadaires.</span>
              </p>
            </div>
            <div>
              <b>III</b>
              <p>
                <strong>Rayonnement</strong>
                <span>Faire porter le message au-delà des frontières, en France et à l&apos;international.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="v2-community-section v2-wrap">
        <div className="v2-community-title">
          <p className="v2-eyebrow">
            <span /> Communauté
          </p>
          <h2>
            Suivre
            <br />
            Serge Hapita.
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
