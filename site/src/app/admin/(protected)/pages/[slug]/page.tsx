import { Fragment, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageContent, getPageDefinition } from "@/lib/content/pageContent";
import { savePageContent } from "../actions";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import UnsavedChangesGuard from "@/components/admin/UnsavedChangesGuard";
import SavedToast from "@/components/admin/SavedToast";
import RichTextEditor from "@/components/admin/RichTextEditor";

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

      <div className="admin-notice">
        Les champs suivent l’ordre réel de la page. Le bouton « Voir la page » permet de contrôler le rendu public sans modifier sa mise en page.
      </div>

      <form id="page-content-form" action={savePageContent}>
        <input type="hidden" name="slug" value={slug} />
        <section className="editor-card">
          {definition.fields.map((field, index) => {
            const previousSection = index > 0 ? definition.fields[index - 1].section : undefined;
            const showSection = field.section && field.section !== previousSection;
            return (
              <Fragment key={field.key}>
                {showSection && <h2 className="admin-form-section-title">{field.section}</h2>}
                <div className="editor-field">
                  <label htmlFor={`page-field-${field.key}`}>{field.label}</label>
                  {field.help && <p className="field-hint">{field.help}</p>}
                  {field.kind === "richtext" ? (
                    <RichTextEditor
                      name={field.key}
                      defaultValue={content[field.key]}
                      placeholder={field.placeholder}
                      minHeight={field.minHeight ?? 140}
                      compact={field.compact ?? true}
                    />
                  ) : field.kind === "textarea" ? (
                    <textarea
                      id={`page-field-${field.key}`}
                      name={field.key}
                      defaultValue={content[field.key]}
                      rows={field.rows ?? 5}
                    />
                  ) : (
                    <input id={`page-field-${field.key}`} name={field.key} defaultValue={content[field.key]} type="text" />
                  )}
                </div>
              </Fragment>
            );
          })}
        </section>
        <div className="admin-action-bar admin-edit-actions">
          <UnsavedChangesGuard formId="page-content-form" />
          <AdminSubmitButton pendingLabel="Enregistrement…">Enregistrer</AdminSubmitButton>
        </div>
      </form>
    </>
  );
}
