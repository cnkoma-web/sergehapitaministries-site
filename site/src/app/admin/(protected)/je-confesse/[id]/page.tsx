import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleByIdAdmin } from "@/lib/content/articles";
import { updateConfessionEntry, deleteArticle } from "../../publications/actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import SavedToast from "@/components/admin/SavedToast";

// V2 (Lot 4, 11/09 — corrigé le 11/09 après relecture de la maquette) —
// calqué sur admin/rosee-matinale/[id]/page.tsx (voir le commentaire
// détaillé dans publications/actions.ts pour les différences volontaires
// avec Rosée Matinale). Le verset d'en-tête et la signature de clôture
// sont des réglages globaux (/admin/textes), jamais édités ici.
export default async function AdminJeConfesseEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const entry = await getArticleByIdAdmin(id);
  if (!entry || entry.type !== "jc") notFound();

  return (
    <>
      <Suspense fallback={null}>
        <SavedToast />
      </Suspense>
      <form action={updateConfessionEntry}>
        <div className="admin-editor-topbar" style={{ margin: "-32px -40px 32px" }}>
          <div className="left">
            <Link href="/admin/je-confesse">← Retour à la liste</Link>
            <strong style={{ color: "var(--ink)" }}>Je Confesse</strong>
            <span className={`status-badge ${entry.status === "published" ? "actif" : "masque"}`}>
              {entry.status === "published" ? "Publié" : "Brouillon"}
            </span>
          </div>
          <div className="actions">
            <button type="submit" form="delete-confession-form" className="btn-danger">
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

          <div className="editor-field">
            <label>Proclamation (corps de la déclaration)</label>
            <RichTextEditor key={entry.id} name="body" defaultValue={entry.body} placeholder="Texte de la proclamation…" minHeight={200} compact />
          </div>

          <div className="editor-field" style={{ marginBottom: 0 }}>
            <label>Mots-clés (SEO) — séparés par des virgules</label>
            <input
              type="text"
              name="seo_keywords"
              defaultValue={entry.seo_keywords.join(", ")}
              placeholder="identité, victoire, confession"
            />
          </div>
        </div>
      </form>

      <form id="delete-confession-form" action={deleteArticle}>
        <input type="hidden" name="id" value={entry.id} />
        <input type="hidden" name="redirectTo" value="/admin/je-confesse" />
      </form>
    </>
  );
}
