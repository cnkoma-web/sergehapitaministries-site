import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import {
  getSalesAndDonationsStats,
  getNewAccountsCount,
  getMostReadArticle,
  getNewNewsletterSubscribers,
  getTodoCounts,
  getSalesBreakdown,
  getVisits30Days,
} from "@/lib/admin/dashboard";

const SHM_VISUAL_IDENTITY_FOR_AI = "# Serge Hapita Ministries — Identité visuelle pour IA\n\nVersion de référence : 4 novembre 2026  \nSource normative : interface V35, CSS V2 et accueil actuellement en production sur SergeHapitaMinistries.org.\n\n## 1. Identité\n\n- Nom officiel : **Serge Hapita Ministries**\n- Nom : **Serge Hapita**\n- Domaine et signature : **SergeHapitaMinistries.org**\n- Logo officiel : `https://sergehapitaministries.org/logo.png`\n- Site de référence : `https://sergehapitaministries.org`\n\nL’univers de Serge Hapita Ministries est spirituel, éditorial, contemporain, sobre et habité. Il doit transmettre la lumière, la profondeur, l’autorité paisible de la Parole et une impression de mouvement vers le haut. Il ne doit ressembler ni à un modèle d’église générique, ni à une publicité tapageuse, ni à une esthétique ésotérique.\n\n## 2. Palette officielle V2\n\n| Rôle | Couleur | Code |\n|---|---|---|\n| Encre principale | Indigo presque noir | `#17142D` |\n| Encre secondaire | Indigo grisé | `#312D46` |\n| Violet principal | Violet lumineux | `#6D31F2` |\n| Violet profond | Violet royal | `#4F25D8` |\n| Lavande claire | Lavande de respiration | `#EEE8FF` |\n| Fond papier | Blanc très légèrement violet | `#FBFAFF` |\n| Texte secondaire | Gris violet | `#686478` |\n| Blanc | Blanc pur | `#FFFFFF` |\n| Filets et bordures | Encre à 13 % | `rgba(23, 20, 45, 0.13)` |\n\nDégradé de référence : violet profond vers violet lumineux, généralement sur une diagonale de 135 degrés. Pour les fonds sombres, partir de `#17142D` et faire apparaître le violet avec retenue, comme une lumière et non comme un effet décoratif envahissant.\n\nRépartition conseillée :\n\n- 55 à 65 % de fonds papier, blancs ou très clairs ;\n- 20 à 30 % d’encre sombre ;\n- 10 à 15 % de violet et de lavande pour guider le regard ;\n- le violet sert d’accent, de passage, d’appel ou de lumière.\n\n## 3. Typographie\n\n### Voix éditoriale\n\nUtiliser **Georgia** ou, si elle n’est pas disponible, une sérif éditoriale très proche. Elle porte les grands titres, les phrases fortes, les citations bibliques et les passages contemplatifs.\n\nCaractéristiques :\n\n- graisse généralement moyenne, jamais excessivement grasse ;\n- interlettrage légèrement resserré sur les grands titres ;\n- interligne compact pour les titres et ample pour les citations ;\n- italique pour certaines phrases méditatives ou citations ;\n- présence élégante, adulte et non décorative.\n\n### Voix fonctionnelle\n\nUtiliser **Inter Variable**, graisses `400 à 900`. Elle porte les sous-titres, informations, dates, catégories, légendes, boutons et textes courants.\n\nCaractéristiques :\n\n- texte courant clair et respirant ;\n- petits surtitres en capitales, fortement espacés ;\n- métadonnées compactes et précises ;\n- boutons nets, lisibles et affirmés.\n\n### Hiérarchie type\n\n- Grand titre : Georgia, poids 500, très présent mais jamais lourd.\n- Surtitre : Inter, petites capitales, espacement marqué entre les lettres.\n- Texte courant : Inter, régulier, avec un interligne généreux.\n- Citation : Georgia italique ou romaine selon l’intention.\n- Référence biblique : Inter, plus petite et plus discrète que la citation.\n\n## 4. Composition visuelle\n\n- Donner de l’espace autour des éléments importants.\n- Construire une hiérarchie claire : surtitre, grand titre, texte d’appui, action ou signature.\n- Alterner les plages claires et les moments sombres afin de créer un rythme.\n- Employer des lignes fines, des cadres légers et de grands aplats plutôt que des ornements nombreux.\n- Utiliser des formes simples, des angles modérément arrondis et des ombres profondes mais diffuses.\n- Ombre de référence : `0 28px 70px rgba(23, 20, 45, 0.15)`.\n- Ne pas remplir tous les espaces. Le vide fait partie de l’identité.\n- Les couvertures de livres et les photographies doivent rester lisibles et ne pas être noyées sous les effets.\n\n## 5. Images et photographie\n\nLes images doivent paraître vraies, dignes et porteuses de sens. Privilégier :\n\n- des visages et attitudes naturels ;\n- une lumière directionnelle, douce ou dramatique selon le sujet ;\n- des arrière-plans sobres ;\n- une profondeur réelle et une composition éditoriale ;\n- des images qui racontent avant de décorer ;\n- un contraste suffisant pour accueillir les textes sans masquer le sujet.\n\nÉviter :\n\n- les symboles religieux ajoutés mécaniquement ;\n- les halos artificiels, colombes, flammes ou ciels spectaculaires sans nécessité ;\n- les poses publicitaires figées ;\n- les banques d’images trop lisses ;\n- le doré envahissant ;\n- les néons, les couleurs criardes et les effets futuristes génériques ;\n- les compositions surchargées ou sentimentales.\n\n## 6. Langage vidéo et mouvement\n\nUne vidéo Serge Hapita Ministries doit reprendre l’atmosphère du site sans transformer l’écran en page web animée.\n\n- Rythme posé, assuré et progressif.\n- Entrées de texte sobres : fondu, glissement court, apparition par masque ou dévoilement lent.\n- Transitions fluides, motivées par le sens ; éviter les effets rapides accumulés.\n- Utiliser l’encre sombre comme socle, le violet comme lumière et la lavande comme respiration.\n- Titres principaux en Georgia ; informations et sous-titres en Inter.\n- Faire respirer les citations bibliques et laisser leur référence apparaître séparément, plus discrète.\n- Employer des mouvements de caméra lents : rapprochement léger, travelling mesuré, parallaxe subtile.\n- Maintenir une zone sûre pour les sous-titres et la signature.\n- Terminer par le logo ou la signature **SergeHapitaMinistries.org**, sans ajout de titre ministériel devant le nom.\n- La musique doit soutenir la parole : profonde, lumineuse et contemporaine, sans emphase cinématographique permanente.\n\n## 7. Signature et logo\n\n- Écrire toujours **Serge Hapita Ministries**.\n- Écrire toujours **Serge Hapita**.\n- Utiliser **SergeHapitaMinistries.org** comme signature.\n- Ne pas écrire « ministre Serge Hapita » dans la signature visuelle.\n- Ne pas déformer, recolorer arbitrairement, incliner ou enfermer le logo dans une forme étrangère.\n- Préserver une zone de respiration autour du logo.\n- Sur un fond chargé, utiliser un aplat sobre ou une zone suffisamment calme pour garantir sa lisibilité.\n\n## 8. Ce qui doit rester constant d’un support à l’autre\n\n1. Le couple typographique Georgia + Inter.\n2. L’encre indigo sombre, le violet royal et la lavande.\n3. La lumière violette utilisée comme accent, jamais comme remplissage systématique.\n4. Les compositions aérées et la hiérarchie éditoriale.\n5. La sobriété des mouvements et des effets.\n6. La signature SergeHapitaMinistries.org.\n7. Une impression générale de profondeur, de clarté, d’autorité paisible et de vie.\n\n## 9. Prompt maître à donner à une IA\n\n> Crée ce support pour **Serge Hapita Ministries** en respectant strictement son identité visuelle. Utilise comme couleurs principales l’encre indigo `#17142D`, le violet lumineux `#6D31F2`, le violet profond `#4F25D8`, la lavande `#EEE8FF`, le fond papier `#FBFAFF` et le blanc. Utilise Georgia pour les grands titres, citations et phrases éditoriales, et Inter pour les informations, sous-titres, légendes et textes courants. La composition doit être sobre, contemporaine, spirituelle, éditoriale et aérée. Le violet doit agir comme une lumière ou un accent, jamais comme un effet tapageur. Privilégie les lignes fines, les grands aplats, les ombres diffuses et une hiérarchie nette. Évite les modèles religieux génériques, les halos artificiels, les colombes ou flammes automatiques, le doré envahissant, les néons, les banques d’images trop lisses et les compositions surchargées. Les images doivent être vraies, dignes, expressives et porteuses de sens. Termine avec la signature exacte **SergeHapitaMinistries.org**. Logo officiel : `https://sergehapitaministries.org/logo.png`. Site de référence : `https://sergehapitaministries.org`.\n\n## 10. Complément à ajouter pour une vidéo\n\n> Pour cette vidéo, conserve un rythme posé, assuré et progressif. Utilise des fondus, des glissements courts ou des dévoilements par masque. Évite les transitions frénétiques et les effets gratuits. Les mouvements de caméra doivent être lents et maîtrisés. Les citations bibliques respirent à l’écran ; leur référence apparaît plus petite en Inter. Utilise l’encre sombre comme socle, le violet comme lumière et la lavande comme respiration. Préserve les zones sûres pour les sous-titres. La conclusion affiche sobrement le logo ou la signature **SergeHapitaMinistries.org**.\n\n## 11. Instruction de travail\n\nAprès ce document, préciser à l’IA :\n\n1. le type de support ou de vidéo ;\n2. le format et la durée ;\n3. le public ;\n4. le texte ou message à transmettre ;\n5. les images, vidéos, voix ou musiques disponibles ;\n6. la signature finale attendue.\n\nCe document définit l’identité. Le contenu du projet peut changer ; l’atmosphère, la hiérarchie et les règles ci-dessus doivent rester reconnaissables.\n";
const SHM_VISUAL_IDENTITY_DATA_URL = `data:text/markdown;charset=utf-8,${encodeURIComponent(SHM_VISUAL_IDENTITY_FOR_AI)}`;

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { salesCents, donationsCents },
    newAccounts,
    mostRead,
    newSubscribers,
    todo,
    breakdown,
    visits,
    { data: precommandeBook },
    { data: todayRosee },
  ] = await Promise.all([
    getSalesAndDonationsStats(),
    getNewAccountsCount(),
    getMostReadArticle(),
    getNewNewsletterSubscribers(),
    getTodoCounts(),
    getSalesBreakdown(),
    getVisits30Days(),
    supabase.from("books").select("slug, title").eq("status", "precommande").limit(1).maybeSingle(),
    supabase
      .from("articles")
      .select("id")
      .eq("type", "rm")
      .eq("article_date", new Date().toISOString().slice(0, 10))
      .maybeSingle(),
  ]);

  const breakdownTotal = breakdown.books + breakdown.goodies + breakdown.donations;
  const pct = (n: number) => (breakdownTotal > 0 ? Math.round((n / breakdownTotal) * 100) : 0);
  const booksPct = pct(breakdown.books);
  const goodiesPct = pct(breakdown.goodies);
  const donationsPct = 100 - booksPct - goodiesPct > 0 ? 100 - booksPct - goodiesPct : pct(breakdown.donations);

  return (
    <>
      <div className="admin-header">
        <div>
          <h2>Tableau de bord</h2>
          <p>Vue d&apos;ensemble du site — 30 derniers jours.</p>
        </div>
      </div>

      <section className="chart-card" style={{ marginBottom: 24 }}>
        <h3>Identité visuelle Serge Hapita Ministries</h3>
        <p style={{ maxWidth: 760, marginBottom: 18, color: "var(--ink-soft)", lineHeight: 1.65 }}>
          Télécharge la bibliothèque officielle à transmettre à Claude ou à une autre IA pour créer une vidéo,
          une présentation, un visuel ou tout autre support conforme au thème du site.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <a
            className="btn-add"
            href={SHM_VISUAL_IDENTITY_DATA_URL}
            download="SHM-IDENTITE-VISUELLE-POUR-IA.md"
          >
            Télécharger la bibliothèque IA
          </a>
          <a className="btn-add" href="/logo.png" download="Serge-Hapita-Ministries-logo.png">
            Télécharger le logo officiel
          </a>
        </div>
      </section>

      <div className="stats-row">
        <div className="stat-card">
          <div className="label">Visites du site</div>
          <div className="value">{visits.configured ? visits.total : "—"}</div>
          {!visits.configured && <div className="trend muted">À connecter</div>}
          <div className="source">Google Analytics</div>
        </div>
        <div className="stat-card">
          <div className="label">Ventes (livres + boutique)</div>
          <div className="value">{formatPrice(salesCents)}</div>
          <div className="source">Stripe</div>
        </div>
        <div className="stat-card">
          <div className="label">Dons reçus</div>
          <div className="value">{formatPrice(donationsCents)}</div>
          <div className="source">Stripe</div>
        </div>
        <div className="stat-card">
          <div className="label">Nouveaux abonnés newsletter</div>
          <div className="value">{newSubscribers ?? "—"}</div>
          {newSubscribers === null && <div className="trend muted">À connecter</div>}
          <div className="source">MailerLite</div>
        </div>
        <div className="stat-card">
          <div className="label">Comptes créés</div>
          <div className="value">{newAccounts}</div>
          <div className="source">Supabase</div>
        </div>
        <div className="stat-card">
          <div className="label">Article le plus lu</div>
          <div className="value" style={{ fontSize: 15, lineHeight: 1.3 }}>
            {mostRead ? mostRead.title : "Aucun article pour le moment"}
          </div>
          {mostRead && <div className="trend up">{mostRead.viewCount} vues</div>}
          <div className="source">Compteur du site</div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-card">
          <h3>Évolution des visites (30 jours)</h3>
          {visits.configured && visits.series && visits.series.length > 0 ? (
            <div className="visits-chart">
              {visits.series.map((v, i) => {
                const max = Math.max(...visits.series!, 1);
                return <div key={i} style={{ height: `${Math.max((v / max) * 100, 2)}%` }} title={String(v)} />;
              })}
            </div>
          ) : (
            <div className="chart-empty">Connectez Google Analytics pour voir l&apos;évolution des visites ici.</div>
          )}
        </div>
        <div className="chart-card">
          <h3>Répartition des ventes</h3>
          {breakdownTotal === 0 ? (
            <div className="chart-empty">Aucune vente sur les 30 derniers jours.</div>
          ) : (
            <div className="donut-wrap">
              <div
                className="donut"
                style={{
                  background: `conic-gradient(var(--purple) 0 ${booksPct}%, var(--blue) ${booksPct}% ${booksPct + goodiesPct}%, var(--teal) ${booksPct + goodiesPct}% 100%)`,
                }}
              />
              <div className="donut-legend">
                <div>
                  <span className="dot" style={{ background: "var(--purple)" }} /> Livres — {booksPct}%
                </div>
                <div>
                  <span className="dot" style={{ background: "var(--blue)" }} /> Boutique — {goodiesPct}%
                </div>
                <div>
                  <span className="dot" style={{ background: "var(--teal)" }} /> Dons — {donationsPct}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="todo-row">
        <div className="todo-card">
          <h3>À traiter</h3>
          <Link href="/admin/avis" className="todo-item">
            <span>Avis en attente de modération</span>
            <span className={todo.pendingReviews > 0 ? "count" : "count zero"}>{todo.pendingReviews}</span>
          </Link>
          <Link href="/admin/commandes" className="todo-item">
            <span>Commandes à préparer/expédier</span>
            <span className={todo.ordersToShip > 0 ? "count" : "count zero"}>{todo.ordersToShip}</span>
          </Link>
          <Link href="/admin/invitations" className="todo-item">
            <span>Demandes d&apos;invitation reçues</span>
            <span className={todo.unhandledInvitations > 0 ? "count" : "count zero"}>{todo.unhandledInvitations}</span>
          </Link>
          <Link href="/admin/messages" className="todo-item">
            <span>Messages de contact non lus</span>
            <span className={todo.unreadContact > 0 ? "count" : "count zero"}>{todo.unreadContact}</span>
          </Link>
          <Link href="/admin/commandes" className="todo-item">
            <span>Paiements échoués (à relancer)</span>
            <span className={todo.failedPayments > 0 ? "count" : "count zero"}>{todo.failedPayments}</span>
          </Link>
        </div>
        <div className="todo-card">
          <h3>Rappels</h3>
          <Link href="/admin/rosee-matinale" className="todo-item">
            <span>Rosée Matinale du jour</span>
            <span className="go">{todayRosee ? "Déjà publiée ✓" : "Publier →"}</span>
          </Link>
          <Link href="/admin/livres" className="todo-item">
            <span>Livre(s) en précommande</span>
            <span className="go">{precommandeBook ? "Voir →" : "Aucun"}</span>
          </Link>
        </div>
      </div>

      <div className="gauge-note">
        Le trafic (Google Analytics) et les ventes (Stripe, via les commandes enregistrées) sont
        des données réelles, pas des chiffres saisis à la main. Les commandes à expédier et les
        messages non lus se marquent comme traités depuis leurs sections respectives.
      </div>
    </>
  );
}
