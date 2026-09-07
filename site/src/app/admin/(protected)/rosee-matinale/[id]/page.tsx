import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByIdAdmin } from "@/lib/content/articles";
import { updateRoseeEntry, deleteArticle } from "../../publications/actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import SavedToast from "@/components/admin/SavedToast";

export default async function AdminRoseeEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getArticleByIdAdmin(id);
  if (!entry || entry.type !== "rm") notFound();

  return (
    <>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      <form action={updateRoseeEntry}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/rosee-matinale">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>Rosée Matinale</strong>
            <span className={`status-badge ${entry.status === "published" ? "actif" : "masque"}`}>
              {entry.status === "published" ? "Publié" : "Brouillon"}
            </span>
          </div>
          <div className="actions">
            <button type="submit" form="delete-rosee-form" className="btn-danger">
              Supprimer
            </button>
            <button type="submit" className="admin-btn-primary">
              Enregistrer
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={entry.id} />

        <div className="editor-card" style={{ maxWidth: 720, margin: "0 auto" }}>
          <div className="editor-field-row" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input type="date" name="article_date" defaultValue={entry.article_date} required />
            </div>
            <div className="editor-field" style={{ marginBottom: 0 }}>
              <label>Statut</label>
              <select name="status" defaultValue={entry.status}>
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          {/* Titre (retour du 07/09) — facultatif : laissé vide, le titre
              continue de se reconstruire automatiquement depuis la date
              ("Rosée Matinale — [date]"), comme avant ce champ. Utilisé
              dans la liste "Articles similaires" de l'éditeur et dans le
              message de partage personnalisé (voir src/lib/share.ts) —
              jusqu'ici, ces deux endroits n'avaient que le titre
              reconstruit depuis la date. */}
          <div className="editor-field">
            <label>Titre (facultatif)</label>
            <input type="text" name="title" defaultValue={entry.title} placeholder="Repli automatique : « Rosée Matinale — [date] »" />
          </div>

          <div className="editor-field">
            <label>Citation / pensée du jour</label>
            <textarea name="verse_text" defaultValue={entry.verse_text ?? ""} rows={3} required />
          </div>

          <div className="editor-field">
            <label>Corps (développement, facultatif)</label>
            <RichTextEditor key={entry.id} name="body" defaultValue={entry.body} placeholder="Développement facultatif…" minHeight={160} compact />
          </div>

          <div className="editor-field">
            <label>Image de couverture</label>
            <ArticleCoverField currentUrl={entry.cover_url} />
            <input
              type="text"
              name="cover_alt"
              defaultValue={entry.cover_alt ?? ""}
              placeholder="Texte alternatif (description de l'image)"
              style={{ marginTop: 8 }}
            />
          </div>

          <div className="editor-field" style={{ marginBottom: 0 }}>
            <label>Mots-clés (SEO) — séparés par des virgules</label>
            <input
              type="text"
              name="seo_keywords"
              defaultValue={entry.seo_keywords.join(", ")}
              placeholder="repos, identité, confiance en Dieu"
            />
          </div>
        </div>
      </form>

      <form id="delete-rosee-form" action={deleteArticle}>
        <input type="hidden" name="id" value={entry.id} />
        <input type="hidden" name="redirectTo" value="/admin/rosee-matinale" />
      </form>
    </>
  );
}
