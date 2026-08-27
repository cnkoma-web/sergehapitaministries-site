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
    images: ["/assets/og/de-serge.jpg"],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/assets/og/de-serge.jpg"] },
};

export default async function DeSergePage() {
  const books = await getBooks();
  const latestBook = books[0] ?? null;

  return (
    <>
      <section className="page-hero" style={{ backgroundImage: "url('/de-serge-hero.jpg')" }}>
        <div className="wrap">
          <h1>Prophète de la révélation de Christ et de la conscience filiale.</h1>
          <p>Une onction d&apos;impartation qui repositionne dans la vérité de l&apos;Évangile.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap bio-block">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            Biographie
          </div>
          <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 28 }}>
            Une vie façonnée par la Parole de Dieu
          </h2>
          <p>
            Dans un temps où beaucoup de justes ne marchent plus par la foi mais par le sensationnel, où la
            conscience de l&apos;identité divine a été remplacée par l&apos;activisme réligieux — le prophète Serge
            Hapita ramène l&apos;Église à l&apos;essentiel : Christ en nous, l&apos;espérance de la gloire.
          </p>
          <p>
            Entrepreneur, écrivain-éditeur, orateur, il est avant tout ministre de la Parole, ambassadeur du
            Royaume, animé d&apos;une passion brûlante : porter le Salut de Dieu au monde, révéler Christ aux
            croyants et établir les chrétiens dans leur identité de fils, afin que tous manifestent la vie de Dieu,
            le Père céleste dans leur monde.
          </p>
        </div>
      </section>

      <section className="pullquote" style={{ minHeight: 360, backgroundImage: "url('/rosee-matinale-hero.jpg')" }}>
        <div className="wrap" style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              background: "rgba(255,255,255,.55)",
              backdropFilter: "blur(2px)",
              WebkitBackdropFilter: "blur(2px)",
              borderRadius: 16,
              padding: 36,
              borderLeft: "4px solid var(--purple)",
              maxWidth: 760,
              boxShadow: "0 20px 50px -20px rgba(20,16,42,.4)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
            }}
          >
            <div>
              <div className="eyebrow" style={{ marginBottom: 12 }}>
                Portrait
              </div>
              <p style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: "var(--ink)" }}>
                Serge Hapita est un prophète de la révélation et de la conscience filiale. Son ministère porte une
                onction qui réveille la foi, restaure la communion avec Dieu le Père. Quand il partage la Parole,
                c&apos;est plus qu&apos;un simple discours, c&apos;est une rencontre avec l&apos;Esprit de Dieu : la
                vie se manifeste, l&apos;esprit se réveille, et la foi se met en action.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ fontFamily: "'Fraunces',serif", fontStyle: "italic", fontSize: 17, lineHeight: 1.55, color: "var(--ink)" }}>
                Marié et père de famille, il vit la Parole et la rend visible, jusqu&apos;à faire ressentir le cœur
                du Père derrière chaque mot. Ce qu&apos;il annonce, il l&apos;incarne, et le transmet avec feu.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap bio-block">
          <p>
            Son parcours avec Dieu a commencé en 1992, lors d&apos;une croisade de l&apos;évangéliste Reinhard
            Bonnke dans un pays à majorité musulman. Ce jour-là, il a rencontré le Seigneur et s&apos;est accroché à
            la Parole de Dieu. Depuis, elle n&apos;a cessé de guider sa marche en Christ, devenant vivante et
            active, façonnant son quotidien pour le conformer aux plans de Dieu pour sa vie.
          </p>
          <p>
            En 2017, un moment décisif a changé sa manière de vivre sa foi en Christ. Alors qu&apos;il célébrait ses
            réussites professionnelles, il a réalisé qu&apos;elles ne lui apportaient pas la paix et la
            tranquillité qu&apos;il espérait. Dans cette remise en question, le Saint-Esprit lui a révélé que la
            paix véritable vient du repos en Christ (Matthieu 11:28) — ce repos que l&apos;on expérimente lorsqu&apos;on
            découvre la volonté de Dieu pour sa vie (Psaumes 139:15-16). On peut réussir dans la vie, mais c&apos;est
            encore mieux de réussir sa vie.
          </p>
          <p>
            Ce fut une révélation profonde : marcher avec Dieu ne consiste pas à accomplir de grandes choses pour
            Lui ou en son Nom, mais à réaliser les œuvres que Dieu a préparées pour chacun de nous.
          </p>
          <blockquote
            style={{
              borderLeft: "3px solid var(--purple)",
              paddingLeft: 20,
              margin: "26px 0",
              fontFamily: "'Fraunces',serif",
              fontStyle: "italic",
              fontSize: 17,
              color: "var(--purple)",
              lineHeight: 1.5,
            }}
          >
            « Nous sommes son ouvrage, créés en Jésus-Christ pour de bonnes œuvres que Dieu a préparées d&apos;avance,
            afin que nous marchions en elles. »
            <br />
            <span style={{ fontStyle: "normal", fontSize: 13, color: "var(--ink-soft)" }}>— Éphésiens 2:10</span>
          </blockquote>
          <p>
            Cette découverte a transformé sa vie spirituelle. Il a appris à écouter la voix de Dieu et à marcher
            comme un fils, expérimentant la vie divine dans la confiance et la dépendance quotidienne. Là où il y
            avait des murs d&apos;impossibilités, la provision de Dieu se manifesta — notamment par la naissance de
            son second enfant, un miracle pour sa famille.
          </p>
          <p style={{ color: "var(--ink)", fontWeight: 500, marginTop: 26 }}>
            Aujourd&apos;hui, son ministère est centré sur la révélation de Christ, l&apos;éveil de la conscience
            filiale et la manifestation du Royaume de Dieu. Il accompagne de nombreuses personnes à connaître
            Christ, à découvrir leur identité en Lui, et à marcher dans ce pour quoi elles ont été faites : les
            œuvres que Dieu a préparées d&apos;avance pour elles. Chaque livre qu&apos;il écrit, chaque message
            qu&apos;il porte, chaque action qu&apos;il entreprend devient ainsi un appel au réveil, à la
            restauration, à l&apos;affermissement — un cri pour ramener les cœurs à Dieu, le Père.
          </p>
        </div>
      </section>

      <section className="stats">
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", textAlign: "center", padding: "44px 28px", gap: 20 }}>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 600, color: "var(--purple)" }}>1992</div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-soft)", marginTop: 4 }}>
              Année de l&apos;appel
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 600, color: "var(--purple)" }}>7</div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-soft)", marginTop: 4 }}>
              Livres publiés
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 600, color: "var(--purple)" }}>2017</div>
            <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--ink-soft)", marginTop: 4 }}>
              Tournant du ministère
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Fraunces',serif", fontSize: 30, fontWeight: 600, color: "var(--purple)" }}>2</div>
            <div style={{ fontSize: 12, textTransform: "none", letterSpacing: ".05em", color: "var(--ink-soft)", marginTop: 4 }}>
              amDG · ActesDesFilsDeDieu
            </div>
          </div>
        </div>
      </section>

      <section className="section editions-block">
        <div className="wrap">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            ActesDesFilsDeDieu
          </div>
          <h2 style={{ fontSize: 26, marginBottom: 16 }}>L&apos;association qu&apos;il porte</h2>
          <p>
            À travers ActesDesFilsDeDieu, Serge Hapita forme, exhorte et équipe les chrétiens pour manifester les
            vertus du Royaume dans leur génération (1 Pierre 2:9-10). Par l&apos;enseignement de la Parole, la
            prédication de l&apos;Évangile et la guérison des malades, il exerce son ministère dans la simplicité
            et la puissance de l&apos;Esprit.
          </p>
          <a href="http://www.actedesfilsdedieu.fr" className="btn btn-outline">
            Découvrir ActesDesFilsDeDieu →
          </a>
        </div>
      </section>

      {latestBook && (
        <section className="section">
          <div className="wrap" style={{ maxWidth: 680 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "140px 1fr",
                gap: 28,
                alignItems: "center",
                background: "var(--lavender)",
                borderRadius: 18,
                padding: 28,
              }}
            >
              <div
                style={{
                  aspectRatio: "2/3",
                  borderRadius: 10,
                  overflow: "hidden",
                  background: latestBook.cover_url ? undefined : "linear-gradient(135deg,var(--blue),var(--purple))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: latestBook.cover_url ? 0 : 14,
                  textAlign: "center",
                }}
              >
                {latestBook.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={latestBook.cover_url} alt={latestBook.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,.7)", textTransform: "none", letterSpacing: ".05em", marginBottom: 6 }}>
                      {latestBook.publisher}
                    </div>
                    <div style={{ fontFamily: "'Fraunces',serif", fontWeight: 600, color: "#fff", fontSize: 15, lineHeight: 1.3 }}>
                      {latestBook.title}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="eyebrow">Dernière parution</div>
                <h3 style={{ fontSize: 20, margin: "8px 0 10px" }}>{latestBook.title}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>
                  {latestBook.price_cents != null
                    ? `${formatPrice(latestBook.price_cents)} — publié sous ${latestBook.publisher}.`
                    : `Le dernier livre de Serge Hapita, publié sous ${latestBook.publisher}.`}
                </p>
                <Link href={`/livres/${latestBook.slug}`} className="btn btn-outline">
                  Découvrir le livre →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="give">
        <div className="wrap" style={{ padding: "56px 28px" }}>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 30px" }}>
            <div className="eyebrow" style={{ justifyContent: "center", color: "rgba(255,255,255,.7)" }}>
              Partenariat
            </div>
            <h2 style={{ color: "#fff", fontSize: 26, margin: "6px 0 10px" }}>Soutenir ce ministère</h2>
            <p style={{ color: "rgba(255,255,255,.85)", marginBottom: 20 }}>
              Votre soutien permet de continuer à écrire, enseigner et diffuser la Parole. Chaque don est une
              pierre ajoutée à cette œuvre.
            </p>
            <Link href="/partenariat" className="btn" style={{ background: "#fff", color: "var(--purple)", padding: "11px 22px", fontSize: 13.5 }}>
              Devenir partenaire →
            </Link>
          </div>
          <div className="give-points" style={{ maxWidth: 560, margin: "0 auto" }}>
            <div className="give-point">
              <div className="num">I</div>
              <div>
                <h5>Ouvrages</h5>
                <p>Soutenir l&apos;écriture et la publication de livres qui édifient.</p>
              </div>
            </div>
            <div className="give-point">
              <div className="num">II</div>
              <div>
                <h5>Enseignements</h5>
                <p>Financer les conférences et les publications hebdomadaires.</p>
              </div>
            </div>
            <div className="give-point">
              <div className="num">III</div>
              <div>
                <h5>Rayonnement</h5>
                <p>Faire porter le message au-delà des frontières, en France et à l&apos;international.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="eyebrow" style={{ justifyContent: "center" }}>
            Communauté
          </div>
          <h2 style={{ textAlign: "center", fontSize: 28, marginBottom: 32 }}>Suivre Serge Hapita</h2>
          <div className="social-grid">
            <a href="https://www.youtube.com/@sergehapita" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              ▶️ YouTube
            </a>
            <a href="https://www.instagram.com/sergehapitaministries/" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              📷 Instagram
            </a>
            <a href="https://www.tiktok.com/@sergehapitaministries" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              🎵 TikTok
            </a>
            <a href="https://www.facebook.com/profile.php?id=61582211394401" className="btn btn-ghost" style={{ justifyContent: "center" }}>
              👍 Facebook
            </a>
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
