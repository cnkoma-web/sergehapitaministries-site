import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventByIdAdmin } from "@/lib/content/events";
import { updateEvent, deleteEvent } from "../actions";
import SavedToast from "@/components/admin/SavedToast";

// V2 Lot 11 (11/09) — écran d'édition d'un événement, calqué sur
// admin/podcast/[id]/page.tsx (un seul formulaire, boutons formAction).
export default async function AdminEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEventByIdAdmin(id);
  if (!event) notFound();

  return (
    <>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      <form action={updateEvent}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/evenements">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>{event.title}</strong>
            <span className={`status-badge ${event.visible ? "actif" : "masque"}`}>{event.visible ? "Visible" : "Masqué"}</span>
          </div>
          <div className="actions">
            <button type="submit" form="delete-event-form" className="btn-danger">
              Supprimer
            </button>
            <button type="submit" className="admin-btn-primary">
              Enregistrer
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={event.id} />

        <div className="editor-card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="editor-field">
            <label>Titre</label>
            <input type="text" name="title" defaultValue={event.title} required />
          </div>

          <div className="editor-field-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Type</label>
              <input type="text" name="type" defaultValue={event.type} placeholder="Conférence, Rencontre…" />
            </div>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Lieu</label>
              <input type="text" name="location" defaultValue={event.location ?? ""} placeholder="Ville, salle…" />
            </div>
          </div>

          <div className="editor-field-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Date de début</label>
              <input type="date" name="start_date" defaultValue={event.start_date} required />
            </div>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Date de fin (facultatif)</label>
              <input type="date" name="end_date" defaultValue={event.end_date ?? ""} />
            </div>
          </div>

          <div className="editor-field">
            <label>Description (affichée uniquement sur la carte « prochain rendez-vous »)</label>
            <textarea name="description" defaultValue={event.description ?? ""} rows={3} />
          </div>

          <div className="editor-field">
            <label>Lien externe (site de l&apos;événement, facultatif)</label>
            <input type="url" name="external_url" defaultValue={event.external_url ?? ""} placeholder="https://…" />
          </div>

          <div className="editor-field" style={{ marginBottom: 0 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" name="visible" defaultChecked={event.visible} style={{ width: "auto" }} />
              Visible sur le site public
            </label>
          </div>
        </div>
      </form>

      <form id="delete-event-form" action={deleteEvent}>
        <input type="hidden" name="id" value={event.id} />
      </form>
    </>
  );
}
