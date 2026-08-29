import Link from "next/link";
import { notFound } from "next/navigation";
import { getVideoByIdAdmin, VIDEO_CATEGORY_LABEL } from "@/lib/content/videos";
import { updateVideo, deleteVideo } from "../actions";

export default async function AdminVideoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await getVideoByIdAdmin(id);
  if (!video) notFound();

  return (
    <>
      <form action={updateVideo}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/videos">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>Vidéos</strong>
          </div>
          <div className="actions">
            <button type="submit" form="delete-video-form" className="btn-danger">
              Supprimer
            </button>
            <button type="submit" className="admin-btn-primary">
              Enregistrer
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={video.id} />

        <div className="editor-card" style={{ maxWidth: 640 }}>
          <h3>Informations</h3>
          <div className="editor-field">
            <label htmlFor="video-title">Titre</label>
            <input id="video-title" name="title" defaultValue={video.title} required />
          </div>
          <div className="editor-field-row" style={{ marginBottom: 18 }}>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label htmlFor="video-category">Catégorie</label>
              <select id="video-category" name="category" defaultValue={video.category}>
                {Object.entries(VIDEO_CATEGORY_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label htmlFor="video-position">Position</label>
              <input id="video-position" name="position" type="number" defaultValue={video.position} />
            </div>
          </div>
          <div className="editor-field">
            <label htmlFor="video-youtube">Lien YouTube</label>
            <input id="video-youtube" name="youtube_url" defaultValue={video.youtube_url ?? ""} placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div className="editor-field">
            <label htmlFor="video-description">Description</label>
            <textarea id="video-description" name="description" defaultValue={video.description ?? ""} rows={3} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
            <input type="checkbox" name="active" defaultChecked={video.active} /> Visible sur le site
          </label>
        </div>
      </form>

      <form id="delete-video-form" action={deleteVideo}>
        <input type="hidden" name="id" value={video.id} />
      </form>
    </>
  );
}
