import Link from "next/link";
import { getArticlesAdmin } from "@/lib/content/articles";
import { publishRosee, deleteRoseeEntry } from "../publications/actions";
import Pagination from "@/components/admin/Pagination";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import AdminSubmitButton from "@/components/admin/AdminSubmitButton";
import UnsavedChangesGuard from "@/components/admin/UnsavedChangesGuard";

const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };
const STATUS_CLASS: Record<string, string> = { draft: "masque", published: "actif" };

export default async function AdminRoseePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; saved?: string; error?: string }>;
}) {
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const perPage = Number(query.perPage) || 5;
  const { articles: entries, total } = await getArticlesAdmin(["rm"], page, perPage);
  const today = new Date().toISOString().slice(0, 10);
  const alreadyPublishedToday = entries.some((entry) => entry.article_date === today);
  const successMessage = query.saved === "published"
    ? "La Rosée Matinale a été publiée."
    : query.saved === "deleted" ? "L’entrée a été supprimée." : null;
  const errorMessage = query.error
    ? query.error === "missing-fields"
      ? "La citation du jour est obligatoire."
      : query.error === "delete"
        ? "La suppression a échoué. Réessayez ou contactez l’assistance."
        : "La publication a échoué. Vos données n’ont pas été enregistrées."
    : null;

  return (
    <div className="rosee-admin-page">
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Contenu quotidien</p>
          <h1>Rosée Matinale</h1>
        </div>
        <a href="#nouvelle-rosee" className="admin-btn-primary admin-jump-action">Créer une entrée</a>
      </header>

      {successMessage && <div className="admin-feedback success" role="status">{successMessage}</div>}
      {errorMessage && <div className="admin-feedback error" role="alert">{errorMessage}</div>}

      <p className="admin-lede">
        La plus récente entrée publiée devient automatiquement la Rosée du jour. Les anciennes restent accessibles dans l’archive.
      </p>

      <section id="nouvelle-rosee" className="editor-card rosee-editor-card">
        <h2>{alreadyPublishedToday ? "Une entrée existe déjà pour aujourd’hui" : "Publier l’entrée du jour"}</h2>
        <form id="rosee-create-form" action={publishRosee}>
          <div className="editor-field rosee-date-field">
            <label htmlFor="rosee-date">Date</label>
            <input id="rosee-date" name="article_date" type="date" defaultValue={today} required />
          </div>
          <div className="editor-field">
            <label htmlFor="rosee-title">Titre <span>(facultatif)</span></label>
            <input id="rosee-title" type="text" name="title" placeholder="Rosée Matinale — date du jour" />
          </div>
          <div className="editor-field">
            <label htmlFor="rosee-verse">Citation / pensée du jour</label>
            <textarea id="rosee-verse" name="verse_text" rows={4} required />
          </div>
          <div className="editor-field">
            <label>Corps <span>(développement facultatif)</span></label>
            <RichTextEditor name="body" placeholder="Développement facultatif…" minHeight={220} compact />
          </div>
          <div className="editor-field">
            <label>Image de couverture</label>
            <ArticleCoverField currentUrl={null} />
            <input type="text" name="cover_alt" placeholder="Description de l’image" className="admin-cover-alt" />
          </div>
          <div className="editor-field">
            <label htmlFor="rosee-seo">Mots-clés SEO <span>(séparés par des virgules)</span></label>
            <input id="rosee-seo" type="text" name="seo_keywords" placeholder="repos, identité, confiance en Dieu" />
          </div>
          <div className="admin-action-bar">
            <UnsavedChangesGuard formId="rosee-create-form" />
            <AdminSubmitButton pendingLabel="Publication…">Publier</AdminSubmitButton>
          </div>
        </form>
      </section>

      <section className="rosee-entries-section">
        <h2>Entrées existantes</h2>
        <div className="items-table rosee-desktop-table">
          <div className="item-row head rosee-row">
            <div>Date</div><div>Aperçu</div><div>Statut</div><div>Actions</div>
          </div>
          {entries.length === 0 && <div className="admin-row-empty">Aucune entrée pour le moment.</div>}
          {entries.map((entry) => (
            <div className="item-row rosee-row" key={entry.id}>
              <div className="item-title">
                <Link href={`/admin/rosee-matinale/${entry.id}`}>{new Date(entry.article_date).toLocaleDateString("fr-FR")}</Link>
                <span>{entry.reading_time_minutes ? `≈ ${entry.reading_time_minutes} min de lecture` : ""}</span>
              </div>
              <div className="rosee-excerpt">{(entry.verse_text ?? "").slice(0, 80)}</div>
              <div><span className={`status-badge ${STATUS_CLASS[entry.status]}`}>{STATUS_LABEL[entry.status]}</span></div>
              <div className="item-actions">
                <Link href={`/admin/rosee-matinale/${entry.id}`}>Modifier</Link>
                <form action={deleteRoseeEntry}><input type="hidden" name="id" value={entry.id} /><button type="submit" className="danger">Supprimer</button></form>
              </div>
            </div>
          ))}
        </div>

        <div className="rosee-mobile-list">
          {entries.length === 0 && <div className="admin-row-empty">Aucune entrée pour le moment.</div>}
          {entries.map((entry) => (
            <article className="rosee-mobile-card" key={entry.id}>
              <div className="rosee-mobile-card-head">
                <div><strong>{new Date(entry.article_date).toLocaleDateString("fr-FR")}</strong><small>{entry.reading_time_minutes ? `≈ ${entry.reading_time_minutes} min` : "Lecture rapide"}</small></div>
                <span className={`status-badge ${STATUS_CLASS[entry.status]}`}>{STATUS_LABEL[entry.status]}</span>
              </div>
              <p>{(entry.verse_text ?? "").slice(0, 120) || "Aucun aperçu"}</p>
              <div className="rosee-mobile-actions">
                <Link href={`/admin/rosee-matinale/${entry.id}`}>Modifier</Link>
                <form action={deleteRoseeEntry}><input type="hidden" name="id" value={entry.id} /><button type="submit" className="danger">Supprimer</button></form>
              </div>
            </article>
          ))}
        </div>
        {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/rosee-matinale" />}
      </section>
    </div>
  );
}
