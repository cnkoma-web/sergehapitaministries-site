import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByIdAdmin } from "@/lib/content/articles";
import { updateRoseeEntry, deleteRoseeEntry } from "../../publications/actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import SavedToast from "@/components/admin/SavedToast";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import UnsavedChangesGuard from "@/components/admin/UnsavedChangesGuard";

export default async function AdminRoseeEntryPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const entry = await getArticleByIdAdmin(id);
  if (!entry || entry.type !== "rm") notFound();

  const errorMessage = query.error
    ? query.error === "missing-fields"
      ? "La citation du jour est obligatoire."
      : "L’enregistrement a échoué. Vos modifications n’ont pas été enregistrées."
    : null;

  return (
    <div className="rosee-admin-page rosee-edit-page">
      <Suspense fallback={null}><SavedToast /></Suspense>
      {errorMessage && <div className="admin-feedback error" role="alert">{errorMessage}</div>}

      <form id="rosee-edit-form" action={updateRoseeEntry}>
        <header className="admin-editor-topbar rosee-editor-topbar">
          <div className="left">
            <Link href="/admin/rosee-matinale">← Retour</Link>
            <strong>Rosée Matinale</strong>
            <span className={`status-badge ${entry.status === "published" ? "actif" : "masque"}`}>
              {entry.status === "published" ? "Publié" : "Brouillon"}
            </span>
          </div>
        </header>

        <input type="hidden" name="id" value={entry.id} />

        <section className="editor-card rosee-editor-card">
          <div className="editor-field-row rosee-meta-fields">
            <div className="editor-field">
              <label htmlFor="rosee-edit-date">Date</label>
              <input id="rosee-edit-date" type="date" name="article_date" defaultValue={entry.article_date} required />
            </div>
            <div className="editor-field">
              <label htmlFor="rosee-edit-status">Statut</label>
              <select id="rosee-edit-status" name="status" defaultValue={entry.status}>
                <option value="published">Publié</option>
                <option value="draft">Brouillon</option>
              </select>
            </div>
          </div>

          <div className="editor-field">
            <label htmlFor="rosee-edit-title">Titre <span>(facultatif)</span></label>
            <input id="rosee-edit-title" type="text" name="title" defaultValue={entry.title} placeholder="Rosée Matinale — date du jour" />
          </div>
          <div className="editor-field">
            <label htmlFor="rosee-edit-verse">Citation / pensée du jour</label>
            <textarea id="rosee-edit-verse" name="verse_text" defaultValue={entry.verse_text ?? ""} rows={4} required />
          </div>
          <div className="editor-field">
            <label>Corps <span>(développement facultatif)</span></label>
            <RichTextEditor key={entry.id} name="body" defaultValue={entry.body} placeholder="Développement facultatif…" minHeight={220} compact />
          </div>
          <div className="editor-field">
            <label>Image de couverture</label>
            <ArticleCoverField currentUrl={entry.cover_url} />
            <input type="text" name="cover_alt" defaultValue={entry.cover_alt ?? ""} placeholder="Description de l’image" className="admin-cover-alt" />
          </div>
          <div className="editor-field">
            <label htmlFor="rosee-edit-seo">Mots-clés SEO <span>(séparés par des virgules)</span></label>
            <input id="rosee-edit-seo" type="text" name="seo_keywords" defaultValue={entry.seo_keywords.join(", ")} placeholder="repos, identité, confiance en Dieu" />
          </div>
        </section>

        <div className="admin-action-bar admin-edit-actions">
          <button type="submit" form="delete-rosee-form" className="btn-danger">Supprimer</button>
          <UnsavedChangesGuard formId="rosee-edit-form" />
          <AdminSubmitButton pendingLabel="Enregistrement…">Enregistrer</AdminSubmitButton>
        </div>
      </form>

      <form id="delete-rosee-form" action={deleteRoseeEntry}>
        <input type="hidden" name="id" value={entry.id} />
      </form>
    </div>
  );
}
