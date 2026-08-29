import Link from "next/link";
import { createBook } from "../actions";

export default function NouveauLivrePage() {
  return (
    <>
      <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
        <div className="left">
          <Link href="/admin/livres">← Retour à la liste</Link>
          <strong style={{ color: "var(--ink)" }}>Nouveau livre</strong>
        </div>
      </div>

      <div className="editor-card" style={{ maxWidth: 480 }}>
        <h3>Titre du livre</h3>
        <form action={createBook}>
          <div className="editor-field">
            <label htmlFor="new-book-title">Titre</label>
            <input id="new-book-title" name="title" required autoFocus />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 16 }}>
            Les images, le prix, la description et le reste se complètent ensuite sur la fiche du
            livre.
          </p>
          <button type="submit" className="admin-btn-primary">
            Créer et continuer →
          </button>
        </form>
      </div>
    </>
  );
}
