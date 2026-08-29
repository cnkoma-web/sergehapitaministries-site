import Link from "next/link";
import { createGoodie } from "../actions";

export default function NouveauGoodiePage() {
  return (
    <>
      <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
        <div className="left">
          <Link href="/admin/boutique">← Retour à la liste</Link>
          <strong style={{ color: "var(--ink)" }}>Nouveau goodie</strong>
        </div>
      </div>

      <div className="editor-card" style={{ maxWidth: 480 }}>
        <h3>Titre du goodie</h3>
        <form action={createGoodie}>
          <div className="editor-field">
            <label htmlFor="new-goodie-title">Titre</label>
            <input id="new-goodie-title" name="title" required autoFocus />
          </div>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 16 }}>
            La photo, le prix, les tailles/couleurs et la description se complètent ensuite sur la
            fiche du goodie.
          </p>
          <button type="submit" className="admin-btn-primary">
            Créer et continuer →
          </button>
        </form>
      </div>
    </>
  );
}
