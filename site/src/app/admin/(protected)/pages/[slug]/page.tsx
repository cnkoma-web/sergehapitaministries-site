import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageContent, getPageDefinition } from "@/lib/content/pageContent";
import { savePageContent } from "../actions";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import UnsavedChangesGuard from "@/components/admin/UnsavedChangesGuard";
import SavedToast from "@/components/admin/SavedToast";

export default async function AdminPageContentEditor({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const definition = getPageDefinition(slug);
  if (!definition) notFound();
  const content = await getPageContent(slug);

  return (
    <>
      <Suspense fallback={null}><SavedToast /></Suspense>
      <header className="admin-page-header">
        <div>
          <Link href="/admin/pages">← Pages du site</Link>
          <h1>{definition.label}</h1>
          <p className="admin-lede">{definition.description}</p>
        </div>
        <Link href={definition.publicPath} target="_blank" className="admin-btn-ghost">Voir la page</Link>
      </header>

      <form id="page-content-form" action={savePageContent}>
        <input type="hidden" name="slug" value={slug} />
        <section className="editor-card">
          {definition.fields.map((field) => (
            <div className="editor-field" key={field.key}>
              <label htmlFor={`page-field-${field.key}`}>{field.label}</label>
              {field.kind === "textarea" ? (
                <textarea id={`page-field-${field.key}`} name={field.key} defaultValue={content[field.key]} rows={5} />
              ) : (
                <input id={`page-field-${field.key}`} name={field.key} defaultValue={content[field.key]} type="text" />
              )}
            </div>
          ))}
        </section>
        <div className="admin-action-bar admin-edit-actions">
          <UnsavedChangesGuard formId="page-content-form" />
          <AdminSubmitButton pendingLabel="Enregistrement…">Enregistrer</AdminSubmitButton>
        </div>
      </form>
    </>
  );
}
