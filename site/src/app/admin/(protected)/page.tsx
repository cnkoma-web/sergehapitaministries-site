import Link from "next/link";

const CARDS: { href: string; title: string; desc: string }[] = [
  { href: "/admin/livres", title: "Livres →", desc: "Le catalogue affiché sur /livres — couvertures, prix, caractéristiques." },
  { href: "/admin/boutique", title: "Boutique →", desc: "Les goodies affichés sur /boutique." },
  { href: "/admin/publications", title: "Publications →", desc: "Articles Que Dit la Bible ? et La Vie Supérieure." },
  { href: "/admin/rosee-matinale", title: "Rosée Matinale →", desc: "Publier l'entrée du jour — l'ancienne bascule automatiquement en archive." },
  { href: "/admin/videos", title: "Vidéos →", desc: "Prédications, enseignements, témoignages — liens YouTube." },
  { href: "/admin/avis", title: "Modération des avis →", desc: "Approuver ou rejeter les avis envoyés sur les livres et goodies." },
  { href: "/admin/ticker", title: "Bandeau ticker →", desc: "Les phrases qui défilent en haut de chaque page." },
  { href: "/admin/stats", title: "Chiffres clés (accueil) →", desc: "Les cases du bandeau statistiques — activez, désactivez, ou saisissez une valeur." },
  { href: "/admin/textes", title: "Textes globaux →", desc: "Description du footer, liens réseaux sociaux, libellés de menu." },
];

export default function AdminDashboard() {
  return (
    <>
      <h1>Tableau de bord</h1>
      <p className="admin-lede">
        Gérez ici le contenu du site sans toucher au code. Les changements sont visibles
        immédiatement.
      </p>
      {CARDS.map((c) => (
        <div className="admin-card" key={c.href}>
          <h3 style={{ marginBottom: 10 }}>
            <Link href={c.href}>{c.title}</Link>
          </h3>
          <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>{c.desc}</p>
        </div>
      ))}
    </>
  );
}
