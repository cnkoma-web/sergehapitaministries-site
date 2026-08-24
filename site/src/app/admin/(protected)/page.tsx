import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <h1>Tableau de bord</h1>
      <p className="admin-lede">
        Gérez ici le contenu du site sans toucher au code. Les changements sont visibles
        immédiatement.
      </p>
      <div className="admin-card">
        <h3 style={{ marginBottom: 10 }}>
          <Link href="/admin/ticker">Bandeau ticker →</Link>
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          Les phrases qui défilent en haut de chaque page.
        </p>
      </div>
      <div className="admin-card">
        <h3 style={{ marginBottom: 10 }}>
          <Link href="/admin/stats">Chiffres clés (accueil) →</Link>
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          Les 4 cases du bandeau statistiques — activez, désactivez, ou saisissez une valeur.
        </p>
      </div>
      <div className="admin-card">
        <h3 style={{ marginBottom: 10 }}>
          <Link href="/admin/textes">Textes globaux →</Link>
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-soft)" }}>
          Description du footer, liens réseaux sociaux, libellés de menu.
        </p>
      </div>
    </>
  );
}
