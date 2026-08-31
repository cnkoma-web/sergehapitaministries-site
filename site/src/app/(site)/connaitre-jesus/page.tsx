import type { Metadata } from "next";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";
import ShareCartouche from "@/components/articles/ShareCartouche";
import PrayerForm from "@/components/forms/PrayerForm";

const title = "Connaître Jésus | Serge Hapita Ministries";
const description = "Une histoire incroyable. Et pourtant… découvrez qui est Jésus et comment le recevoir.";
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

const FACTS = [
  { badge: "✦", title: "Sa naissance miraculeuse", text: "Jésus est né d'une vierge. Cela constitue un miracle et un signe." },
  { badge: "⚡", title: "Ses actes miraculeux", text: "Jésus montra, par de nombreux actes extraordinaires, qu'il venait de Dieu." },
  { badge: "◈", title: "Ses apparitions", text: "Jésus apparut à plus de cinq cents personnes après sa mort." },
  { badge: "†", title: "Dieu témoigne de Jésus", text: "Par sa naissance, sa vie, sa mort volontaire, sa résurrection et son ascension visible." },
  { badge: "○", title: "Sa déclaration personnelle", text: "Jésus déclara lui-même qu'il avait été envoyé de Dieu comme Fils de Dieu." },
  { badge: "✚", title: "Sa mort sacrificielle", text: "Jésus mourut pour nous comme un sacrifice, conformément à ce que la Bible annonçait." },
  { badge: "↑", title: "Son ascension physique", text: "Il monta au ciel à travers les nuages, sous les yeux d'environ cent vingt personnes." },
  { badge: "♡", title: "La nature de Dieu donnée", text: "Celui qui croit en Lui reçoit la vie éternelle dans son cœur, par la foi." },
  { badge: "☀", title: "Sa résurrection", text: "Dieu le ressuscita le troisième jour — la preuve qu'il venait de Dieu." },
  { badge: "✶", title: "Son nom aujourd'hui", text: "Dieu a investi de la puissance dans le nom de Jésus, qui agit encore aujourd'hui." },
  { badge: "◇", title: "La purification du péché", text: "La vie éternelle entre dans le cœur, et la nature du péché disparaît." },
];

export default function ConnaitreJesusPage() {
  return (
    <>
      <section className="cj-hero">
        <div className="wrap">
          <h1>Connaître Jésus</h1>
          <p>Une histoire incroyable. Et pourtant…</p>
        </div>
      </section>

      <section className="section" style={{ padding: "44px 0" }}>
        <div className="wrap">
          <div style={{ aspectRatio: "16/9", maxWidth: "var(--content-col)", margin: "0 auto", borderRadius: 12, overflow: "hidden" }}>
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

      <section className="cj-body">
        <div className="wrap">
          <p>
            Il y a presque deux mille ans, un homme du nom de Jésus est né d&apos;une vierge. Il a déclaré qu&apos;il
            avait été envoyé de Dieu pour donner sa vie en rançon des péchés de l&apos;humanité. Sa naissance
            elle-même était un miracle, parce qu&apos;il est venu au monde sans intervention d&apos;un homme. Et
            tout au long de sa vie, il a montré, par plusieurs signes extraordinaires, qu&apos;il venait réellement
            de Dieu et qu&apos;il apportait un message venant de Dieu.
          </p>

          <p>
            La Bible raconte que Jésus est mort pour nous comme un sacrifice. Cela veut dire qu&apos;il a pris sur
            lui la condamnation qui revenait à l&apos;humanité. Il a porté la séparation, la culpabilité et le poids
            du péché à notre place. Il est mort comme celui qui assume la faute afin que nous puissions recevoir le
            pardon.
          </p>

          <div className="cj-verse">
            <p>
              « Christ est mort pour nos péchés, selon les Écritures ; il a été enseveli, et il est ressuscité le
              troisième jour, selon les Écritures. »
            </p>
            <p>« Lui qui a été livré pour nos offenses et est ressuscité pour notre justification. »</p>
            <div className="ref">1 Corinthiens 15:3-4 · Romains 4:25</div>
          </div>

          <p>
            Il a été enterré. Et le troisième jour, Dieu a confirmé qu&apos;il venait véritablement de Lui en le
            ressuscitant d&apos;entre les morts. Sa résurrection était la preuve que sa mort avait accompli sa
            mission : ouvrir à l&apos;humanité un chemin de pardon et de réconciliation avec Dieu.
          </p>

          <p>
            Après cela, Jésus est apparu à de nombreuses personnes : plus de cinq cents témoins l&apos;ont vu vivant
            après sa résurrection. Puis il est monté au ciel devant cent vingt personnes qui ont vu son ascension de
            leurs propres yeux. Il est monté physiquement, à travers les nuages — une preuve supplémentaire
            qu&apos;il était réellement le Fils de Dieu.
          </p>

          <p>
            Et c&apos;est pour cela que nous parlons de Jésus. Parce qu&apos;il était plus qu&apos;un simple leader
            religieux. Dieu Tout-Puissant a témoigné de Lui par sa naissance miraculeuse, par sa vie extraordinaire,
            par sa mort — où il a volontairement remis son esprit — par sa résurrection, et enfin par son ascension
            au ciel. Il n&apos;a pas disparu : des témoins l&apos;ont vu monter et traverser les nuées sous leurs
            yeux. Et ces mêmes témoins, pour la plupart, ont préféré être exécutés plutôt que de renoncer à ce
            qu&apos;ils avaient vu.
          </p>

          <div className="cj-verse">
            <p>« Après avoir dit cela, il fut élevé pendant qu&apos;ils le regardaient, et une nuée le déroba à leurs yeux. »</p>
            <p>« Déclaré Fils de Dieu avec puissance, selon l&apos;Esprit de sainteté, par sa résurrection d&apos;entre les morts. »</p>
            <div className="ref">Actes 1:9 · Romains 1:4</div>
          </div>

          <ShareCartouche title="Connaître Jésus" url={PAGE_URL} />
        </div>
      </section>

      <section className="salvation-section">
        <div className="wrap salvation-inner">
          <h2>Je veux recevoir Jésus dans mon cœur</h2>
          <p>
            Nous sommes heureux de ta décision de recevoir Jésus ! C&apos;est un choix qui va changer ta vie, que tu
            n&apos;oublieras et ne regretteras jamais. Aujourd&apos;hui marque un jour historique pour toi !
          </p>
          <PrayerForm />
        </div>
      </section>

      <section className="cj-body">
        <div className="wrap">
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
            offre en confessant sa Seigneurie. La Parole de Dieu promet :
          </p>

          <div className="cj-verse">
            <p>
              « Si tu confesses de ta bouche le Seigneur Jésus, et si tu crois dans ton cœur que Dieu l&apos;a
              ressuscité des morts, tu seras sauvé. Car c&apos;est en croyant du cœur qu&apos;on devient juste, et
              c&apos;est en confessant de la bouche qu&apos;on parvient au salut. »
            </p>
            <p>« Car quiconque invoquera le nom du Seigneur sera sauvé. »</p>
            <div className="ref">Romains 10:9-10, 13</div>
          </div>

          <p>Par sa grâce, Dieu a déjà fait tout ce qu&apos;il fallait pour réconcilier l&apos;humanité avec Lui. Ta part est simplement de croire et de recevoir son pardon.</p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--lavender)" }}>
        <div className="wrap">
          <div className="facts-grid">
            {FACTS.map((fact) => (
              <div className="fact-card" key={fact.title}>
                <div className="badge">{fact.badge}</div>
                <h4>{fact.title}</h4>
                <p>{fact.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
