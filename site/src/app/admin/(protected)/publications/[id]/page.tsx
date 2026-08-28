import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByIdAdmin, getArticleOptionsForLinking, ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import { updateArticle, publishArticle, deleteArticle } from "../actions";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import RichTextEditor from "@/components/admin/RichTextEditor";
import RelatedArticlesPicker from "@/components/admin/RelatedArticlesPicker";

export default async function AdminArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleByIdAdmin(id);
  if (!article) notFound();

  const linkOptions = await getArticleOptionsForLinking(article.id);

  return (
    <>
      <form action={updateArticle}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/publications">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>{ARTICLE_TYPE_LABEL[article.type]}</strong>
            <span className={`status-badge ${article.status === "published" ? "actif" : "masque"}`}>
              {article.status === "published" ? "Publié" : "Brouillon"}
            </span>
          </div>
          <div className="actions">
            <button type="submit" form="delete-article-form" className="btn-danger">
              Supprimer
            </button>
            {article.status === "published" && article.type !== "rm" && (
              <Link href={`/publications/${article.slug}`} className="btn-ghost" target="_blank">
                Aperçu
              </Link>
            )}
            <button type="submit" className="btn-ghost">
              Enregistrer
            </button>
            <button type="submit" formAction={publishArticle} className="btn-primary">
              {article.status === "published" ? "Mettre à jour" : "Publier"}
            </button>
          </div>
        </div>

        <input type="hidden" name="id" value={article.id} />
        <input type="hidden" name="type" value={article.type} />

        <div className="editor-layout">

        {/* ===== PANNEAU DE PARAMÈTRES (gauche) ===== */}
        <aside className="params-panel">
          <h3>Paramètres de l&apos;article</h3>

          <div className="editor-field">
            <label>Image de couverture</label>
            <ArticleCoverField currentUrl={article.cover_url} />
            <input
              type="text"
              name="cover_alt"
              defaultValue={article.cover_alt ?? ""}
              placeholder="Texte alternatif (description de l'image)"
              style={{ marginTop: 8 }}
            />
          </div>

          <div className="editor-field">
            <label>Date de publication</label>
            <input type="date" name="article_date" defaultValue={article.article_date} />
          </div>

          <div className="editor-field">
            <label>Auteur / rédacteur</label>
            <input type="text" name="author_name" defaultValue={article.author_name ?? ""} placeholder="Serge Hapita" />
          </div>

          <div className="editor-field">
            <label>Chapeau / Extrait</label>
            <textarea name="excerpt" defaultValue={article.excerpt ?? ""} placeholder="Résumé court affiché dans les listes d'articles…" />
          </div>

          {article.type === "qdlb" && (
            <>
              <div className="editor-field">
                <label>Référence du verset</label>
                <input type="text" name="verse_reference" defaultValue={article.verse_reference ?? ""} placeholder="ex. 2 Corinthiens 4:18" />
              </div>
              <div className="editor-field">
                <label>Texte du verset</label>
                <textarea name="verse_text" defaultValue={article.verse_text ?? ""} rows={2} />
              </div>
              <div className="editor-field">
                <label>Versets complémentaires — un par ligne, « Référence | Texte »</label>
                <textarea
                  name="further_verses"
                  rows={3}
                  defaultValue={article.further_verses.map((v) => `${v.reference} | ${v.text}`).join("\n")}
                />
              </div>
            </>
          )}

          {article.type === "vs" && (
            <div className="editor-field">
              <label>Accès</label>
              <select name="access" defaultValue={article.access}>
                <option value="free">Gratuit (compte requis)</option>
                <option value="paid">Payant (à activer plus tard)</option>
              </select>
            </div>
          )}

          {article.type === "rm" && (
            <div className="editor-field">
              <label>Citation / pensée du jour</label>
              <textarea name="verse_text" defaultValue={article.verse_text ?? ""} rows={2} />
            </div>
          )}

          <div className="editor-field">
            <label>Articles similaires</label>
            <RelatedArticlesPicker options={linkOptions} initialIds={article.related_article_ids} />
          </div>

          <div className="editor-field">
            <label>Mots-clés (SEO) — séparés par des virgules</label>
            <input type="text" name="seo_keywords" defaultValue={article.seo_keywords.join(", ")} placeholder="justice, nature de Dieu" />
          </div>
        </aside>

          {/* ===== ZONE DE TEXTE (droite) ===== */}
          <div className="content-area">
            <div className="content-body">
              <input type="text" name="title" defaultValue={article.title} required className="title-input" placeholder="Titre de l'article" />
              <RichTextEditor name="body" defaultValue={article.body} placeholder="Écrivez votre article ici…" minHeight={300} />
            </div>
          </div>
        </div>
      </form>

      <form id="delete-article-form" action={deleteArticle}>
        <input type="hidden" name="id" value={article.id} />
      </form>
    </>
  );
}
