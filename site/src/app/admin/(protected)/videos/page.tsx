import Link from "next/link";
import { getVideosAdmin, VIDEO_CATEGORY_LABEL } from "@/lib/content/videos";
import Pagination from "@/components/admin/Pagination";
import { deleteVideo } from "./actions";

export default async function AdminVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const { videos, total } = await getVideosAdmin(page, perPage);

  return (
    <>
      <div className="admin-header">
        <div>
          <h2>Vidéos</h2>
        </div>
        <Link href="/admin/videos/nouveau" className="btn-add">
          + Ajouter une vidéo
        </Link>
      </div>
      <p className="admin-lede">
        Chaque catégorie affiche au moins 2 emplacements sur /videos — les vidéos manquantes
        restent honnêtement marquées « à venir » tant qu&apos;elles ne sont pas ajoutées ici.
      </p>

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "1fr 150px 110px 90px" }}>
          <div>Titre</div>
          <div>Catégorie</div>
          <div>Statut</div>
          <div>Actions</div>
        </div>
        {videos.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucune vidéo pour le moment.</div>
          </div>
        )}
        {videos.map((v) => (
          <div className="item-row" key={v.id} style={{ gridTemplateColumns: "1fr 150px 110px 90px" }}>
            <div className="item-title">
              <Link href={`/admin/videos/${v.id}`}>{v.title}</Link>
              <span>{v.youtube_url || "Lien YouTube à renseigner"}</span>
            </div>
            <div style={{ fontSize: 13 }}>{VIDEO_CATEGORY_LABEL[v.category]}</div>
            <div>
              <span className={`status-badge ${v.active ? "actif" : "masque"}`}>{v.active ? "Actif" : "Masqué"}</span>
            </div>
            <div className="item-actions">
              <Link href={`/admin/videos/${v.id}`}>Éditer</Link>
              <form action={deleteVideo}>
                <input type="hidden" name="id" value={v.id} />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/videos" />}
    </>
  );
}
