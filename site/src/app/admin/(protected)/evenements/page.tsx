import Link from "next/link";
import { getEventsAdmin, formatEventDateRange } from "@/lib/content/events";
import { createEvent, deleteEvent } from "./actions";
import Pagination from "@/components/admin/Pagination";

// V2 Lot 11 (11/09) — Agenda/Événements, nouvelle fonctionnalité additive.
// Calqué sur admin/publications/page.tsx (liste + création rapide).
export default async function AdminEvenementsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const { events, total } = await getEventsAdmin(page, perPage);

  return (
    <>
      <h1>Agenda / Événements</h1>
      <p className="admin-lede">
        Le prochain rendez-vous affiché sur l&apos;accueil est calculé automatiquement (l&apos;événement
        visible le plus proche dont la date n&apos;est pas encore passée) — pas un choix manuel. Un
        événement masqué n&apos;apparaît nulle part sur le site public.
      </p>

      <div className="editor-card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h3>Nouvel événement</h3>
        <form action={createEvent}>
          <div className="editor-field">
            <label>Titre</label>
            <input type="text" name="title" placeholder="Titre de l'événement" required />
          </div>
          <div className="editor-field" style={{ marginBottom: 0 }}>
            <label>Type</label>
            <input type="text" name="type" placeholder="Conférence, Rencontre…" defaultValue="Conférence" />
          </div>
          <button type="submit" className="admin-btn-primary" style={{ marginTop: 16 }}>
            Créer
          </button>
        </form>
      </div>

      <h3 style={{ margin: "28px 0 12px" }}>Événements</h3>
      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 200px 110px 150px" }}>
          <div>Titre</div>
          <div>Dates</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {events.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucun événement pour le moment.</div>
          </div>
        )}
        {events.map((e) => (
          <div className="item-row" key={e.id} style={{ gridTemplateColumns: "1fr 200px 110px 150px" }}>
            <div className="item-title">
              <Link href={`/admin/evenements/${e.id}`}>{e.title}</Link>
              <span>{e.type}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{formatEventDateRange(e.start_date, e.end_date)}</div>
            <div>
              <span className={`status-badge ${e.visible ? "actif" : "masque"}`}>{e.visible ? "Visible" : "Masqué"}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/evenements/${e.id}`}>Éditer</Link>
              <form action={deleteEvent}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/evenements" />}
    </>
  );
}
