import Link from "next/link";
import { getPodcastEpisodesAdmin } from "@/lib/content/podcast";
import { createPodcastEpisode, deletePodcastEpisode } from "./actions";
import { ARTICLE_TYPE_LABEL } from "@/lib/content/articles";
import Pagination from "@/components/admin/Pagination";

const STATUS_LABEL: Record<string, string> = { draft: "Brouillon", published: "Publié" };
const STATUS_CLASS: Record<string, string> = { draft: "masque", published: "actif" };

// V2 Lot 9 (11/09) — Podcast, nouvelle fonctionnalité additive, pas de
// synchronisation Ausha pour l'instant (pas encore souscrit, confirmé le
// 11/09) : les épisodes sont saisis à la main, calqué sur le principe de
// admin/publications/page.tsx (liste + création rapide).
export default async function AdminPodcastPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const { episodes, total } = await getPodcastEpisodesAdmin(page, perPage);

  return (
    <>
      <h1>Podcast</h1>
      <p className="admin-lede">
        Synchronisation Ausha pas encore branchée (compte pas encore souscrit) — les épisodes sont
        saisis ici à la main. Le champ « Lien audio » attend l&apos;URL directe fournie par Ausha une
        fois l&apos;épisode publié là-bas.
      </p>

      <div className="editor-card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h3>Nouvel épisode</h3>
        <form action={createPodcastEpisode}>
          <div className="editor-field">
            <label>Titre</label>
            <input type="text" name="title" placeholder="Titre de l'épisode" required />
          </div>
          <div className="editor-field" style={{ marginBottom: 0 }}>
            <label>Univers</label>
            <select name="universe" defaultValue="qdlb">
              {Object.entries(ARTICLE_TYPE_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="admin-btn-primary" style={{ marginTop: 16 }}>
            Créer
          </button>
        </form>
      </div>

      <h3 style={{ margin: "28px 0 12px" }}>Épisodes</h3>
      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 160px 110px 150px" }}>
          <div>Titre</div>
          <div>Univers</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {episodes.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucun épisode pour le moment.</div>
          </div>
        )}
        {episodes.map((e) => (
          <div className="item-row" key={e.id} style={{ gridTemplateColumns: "1fr 160px 110px 150px" }}>
            <div className="item-title">
              <Link href={`/admin/podcast/${e.id}`}>{e.title}</Link>
              <span>{new Date(e.episode_date).toLocaleDateString("fr-FR")}</span>
            </div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{ARTICLE_TYPE_LABEL[e.universe]}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[e.status]}`}>{STATUS_LABEL[e.status]}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/podcast/${e.id}`}>Éditer</Link>
              <form action={deletePodcastEpisode}>
                <input type="hidden" name="id" value={e.id} />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/podcast" />}
    </>
  );
}
