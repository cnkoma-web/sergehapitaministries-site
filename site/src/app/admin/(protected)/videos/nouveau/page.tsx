import Link from "next/link";
import { createVideo } from "../actions";

export default function NouvelleVideoPage() {
  return (
    <>
      <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
        <div className="left">
          <Link href="/admin/videos">← Retour à la liste</Link>
          <strong style={{ color: "var(--ink)" }}>Nouvelle vidéo</strong>
        </div>
      </div>

      <div className="editor-card" style={{ maxWidth: 480 }}>
        <h3>Titre de la vidéo</h3>
        <form action={createVideo}>
          <div className="editor-field">
            <label htmlFor="new-video-title">Titre</label>
            <input id="new-video-title" name="title" required autoFocus />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 16 }}>
            La catégorie, le lien YouTube et la description se complètent ensuite.
          </p>
          <button type="submit" className="btn-primary">
            Créer et continuer →
          </button>
        </form>
      </div>
    </>
  );
}
