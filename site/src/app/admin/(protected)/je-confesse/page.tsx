import Link from "next/link";
import { getArticlesAdmin } from "@/lib/content/articles";
import { publishConfession, deleteArticle } from "../publications/actions";
import { stripHtml } from "@/lib/richtext";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ArticleCoverField from "@/components/admin/ArticleCoverField";
import Pagination from "@/components/admin/Pagination";

const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };
const STATUS_CLASS: Record<string, string> = { draft: "masque", published: "actif" };

// V2 (Lot 4, 11/09 — corrigé le 11/09 après relecture de la maquette) —
// calqué fichier pour fichier sur admin/rosee-matinale/page.tsx (même
// principe exact : publier bascule automatiquement l'ancienne entrée en
// archive, pas de bouton séparé). Différences volontaires avec Rosée
// Matinale (voir le commentaire détaillé dans publications/actions.ts) :
// pas de champ Titre, corps obligatoire (pas facultatif). Le verset d'en-
// tête et la signature de clôture sont des réglages globaux de la rubrique
// (/admin/textes, clés je_confesse.*), jamais un champ ici.
export default async function AdminJeConfessePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 5;

  const { articles: entries, total } = await getArticlesAdmin(["jc"], page, perPage);
  const today = new Date().toISOString().slice(0, 10);
  const alreadyPublishedToday = entries.some((e) => e.article_date === today);

  return (
    <>
      <h1>Je Confesse</h1>
      <p className="admin-lede">
        Publier une nouvelle entrée bascule automatiquement l&apos;ancienne en archive — pas de
        bouton séparé, c&apos;est juste la plus récente entrée par date. L&apos;archive complète se
        modifie comme un article classique (éditeur détaillé).
      </p>

      <div className="editor-card" style={{ maxWidth: 720, margin: "0 auto" }}>
        <h3>{alreadyPublishedToday ? "Une entrée existe déjà pour aujourd'hui" : "Publier l'entrée du jour"}</h3>
        <form action={publishConfession}>
          <div className="editor-field" style={{ maxWidth: 220 }}>
            <label>Date</label>
            <input name="article_date" type="date" defaultValue={today} required />
          </div>
          <div className="editor-field">
            <label>Image de couverture</label>
            <ArticleCoverField currentUrl={null} />
            <input type="text" name="cover_alt" placeholder="Texte alternatif (description de l'image)" style={{ marginTop: 8 }} />
          </div>
          <div className="editor-field">
            <label>Proclamation (corps de la déclaration)</label>
            <RichTextEditor name="body" placeholder="Texte de la proclamation…" minHeight={200} compact />
          </div>
          <div className="editor-field">
            <label>Mots-clés (SEO) — séparés par des virgules</label>
            <input type="text" name="seo_keywords" placeholder="identité, victoire, confession" />
          </div>
          <button type="submit" className="admin-btn-primary">
            Publier
          </button>
        </form>
      </div>

      <h3 style={{ margin: "28px 0 12px" }}>Entrées existantes</h3>
      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 220px 110px 150px" }}>
          <div>Date</div>
          <div>Aperçu</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {entries.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucune entrée pour le moment.</div>
          </div>
        )}
        {entries.map((e) => (
          <div className="item-row" key={e.id} style={{ gridTemplateColumns: "1fr 220px 110px 150px" }}>
            <div className="item-title">
              <Link href={`/admin/je-confesse/${e.id}`}>{new Date(e.article_date).toLocaleDateString("fr-FR")}</Link>
              <span>{e.reading_time_minutes ? `≈ ${e.reading_time_minutes} min de lecture` : ""}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{stripHtml(e.body ?? "").slice(0, 60)}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[e.status]}`}>{STATUS_LABEL[e.status]}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/je-confesse/${e.id}`}>Éditer</Link>
              <form action={deleteArticle}>
                <input type="hidden" name="id" value={e.id} />
                <input type="hidden" name="redirectTo" value="/admin/je-confesse" />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/je-confesse" />}
    </>
  );
}
