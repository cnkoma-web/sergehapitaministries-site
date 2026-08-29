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
