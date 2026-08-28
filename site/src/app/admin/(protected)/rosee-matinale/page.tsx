import Link from "next/link";
import { getArticlesAdmin } from "@/lib/content/articles";
import { publishRosee } from "../publications/actions";
import Pagination from "@/components/admin/Pagination";

const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };
const STATUS_CLASS: Record<string, string> = { draft: "masque", published: "actif" };

export default async function AdminRoseePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const { articles: entries, total } = await getArticlesAdmin(["rm"], page, perPage);
  const today = new Date().toISOString().slice(0, 10);
  const alreadyPublishedToday = entries.some((e) => e.article_date === today);

  return (
    <>
      <h1>Rosée Matinale</h1>
      <p className="admin-lede">
        Publier une nouvelle entrée bascule automatiquement l&apos;ancienne en archive — pas de
        bouton séparé, c&apos;est juste la plus récente entrée par date (cahier §3.2). L&apos;archive
        complète se modifie comme un article classique (éditeur détaillé).
      </p>

      <div className="editor-card">
        <h3>{alreadyPublishedToday ? "Une entrée existe déjà pour aujourd'hui" : "Publier l'entrée du jour"}</h3>
        <form action={publishRosee}>
          <div className="editor-field" style={{ maxWidth: 220 }}>
            <label>Date</label>
            <input name="article_date" type="date" defaultValue={today} required />
          </div>
          <div className="editor-field">
            <label>Citation / pensée du jour</label>
            <textarea name="verse_text" rows={3} required />
          </div>
          <div className="editor-field">
            <label>Corps (développement, séparé en paragraphes par une ligne vide)</label>
            <textarea name="body" rows={6} />
          </div>
          <button type="submit" className="btn-primary">
            Publier
          </button>
        </form>
      </div>

      <h3 style={{ margin: "28px 0 12px" }}>Entrées existantes</h3>
      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 130px 110px 90px" }}>
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
          <div className="item-row" key={e.id} style={{ gridTemplateColumns: "1fr 130px 110px 90px" }}>
            <div className="item-title">
              <Link href={`/admin/publications/${e.id}`}>{new Date(e.article_date).toLocaleDateString("fr-FR")}</Link>
              <span>{e.reading_time_minutes ? `≈ ${e.reading_time_minutes} min de lecture` : ""}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{(e.verse_text ?? "").slice(0, 60)}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[e.status]}`}>{STATUS_LABEL[e.status]}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/publications/${e.id}`}>Éditer</Link>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/rosee-matinale" />}
    </>
  );
}
