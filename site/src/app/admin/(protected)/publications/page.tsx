import Link from "next/link";
import { getArticlesAdmin, ARTICLE_TYPE_LABEL, type ArticleType } from "@/lib/content/articles";
import { createArticle } from "./actions";
import Pagination from "@/components/admin/Pagination";

const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };
const STATUS_CLASS: Record<string, string> = { draft: "masque", published: "actif" };
const FILTERS: { value: ArticleType | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "qdlb", label: "Que Dit la Bible ?" },
  { value: "vs", label: "La Vie Supérieure" },
];

export default async function AdminPublicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string; type?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam, type: typeParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;
  const types: ArticleType[] = typeParam === "qdlb" || typeParam === "vs" ? [typeParam] : ["qdlb", "vs"];

  const { articles, total } = await getArticlesAdmin(types, page, perPage);

  return (
    <>
      <div className="admin-header">
        <div>
          <h2>Publications</h2>
        </div>
        <form action={createArticle} style={{ display: "flex", gap: 8 }}>
          <select name="type" defaultValue="qdlb" style={{ padding: "10px 12px", borderRadius: 8, border: "1.5px solid var(--line)" }}>
            <option value="qdlb">Que Dit la Bible ?</option>
            <option value="vs">La Vie Supérieure</option>
          </select>
          <button type="submit" className="btn-add">
            + Ajouter un article
          </button>
        </form>
      </div>
      <p className="admin-lede">
        Articles « Que Dit la Bible ? » et « La Vie Supérieure ». Rosée Matinale se gère depuis{" "}
        <Link href="/admin/rosee-matinale">sa propre section</Link>.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/publications${f.value === "all" ? "" : `?type=${f.value}`}`}
            className="admin-btn-sm"
            style={
              (f.value === "all" && !typeParam) || typeParam === f.value
                ? { borderColor: "var(--purple)", color: "var(--purple)" }
                : undefined
            }
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "56px 1fr 130px 110px 90px" }}>
          <div></div>
          <div>Titre</div>
          <div>Catégorie</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>

        {articles.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucun article pour le moment.</div>
          </div>
        )}

        {articles.map((a) => (
          <div className="item-row" key={a.id} style={{ gridTemplateColumns: "56px 1fr 130px 110px 90px" }}>
            <div className="item-thumb" style={a.cover_url ? { backgroundImage: `url('${a.cover_url}')` } : undefined} />
            <div className="item-title">
              <Link href={`/admin/publications/${a.id}`}>{a.title}</Link>
              <span>{new Date(a.article_date).toLocaleDateString("fr-FR")}</span>
            </div>
            <div style={{ fontSize: 13 }}>{ARTICLE_TYPE_LABEL[a.type]}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[a.status]}`}>{STATUS_LABEL[a.status]}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/publications/${a.id}`}>Éditer</Link>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && (
        <Pagination
          page={page}
          perPage={perPage}
          total={total}
          basePath="/admin/publications"
          extraParams={typeParam ? { type: typeParam } : undefined}
        />
      )}

      <div className="admin-note">
        Cliquer sur un article ouvre l&apos;éditeur complet (couverture, extrait, mots-clés,
        articles similaires, texte enrichi).
      </div>
    </>
  );
}
