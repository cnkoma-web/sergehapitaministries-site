import Link from "next/link";
import { getGoodiesAdmin } from "@/lib/content/goodies";
import { formatPrice } from "@/lib/format";
import Pagination from "@/components/admin/Pagination";
import { deleteGoodie } from "./actions";

const STATUS_LABEL: Record<string, string> = { available: "Disponible", coming_soon: "Bientôt disponible" };
const STATUS_CLASS: Record<string, string> = { available: "actif", coming_soon: "precommande" };

export default async function AdminBoutiquePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const { goodies, total } = await getGoodiesAdmin(page, perPage);

  return (
    <>
      <div className="admin-header">
        <div>
          <h2>Boutique</h2>
        </div>
        <Link href="/admin/boutique/nouveau" className="btn-add">
          + Ajouter un goodie
        </Link>
      </div>
      <p className="admin-lede">Les goodies affichés sur /boutique. Cliquez sur un goodie pour l&apos;éditer en détail.</p>

      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "56px 1fr 90px 130px 90px 90px" }}>
          <div></div>
          <div>Titre</div>
          <div>Prix</div>
          <div>Statut</div>
          <div>Position</div>
          <div>Actions</div>
        </div>

        {goodies.length === 0 && (
          <div className="item-row" style={{ gridTemplateColumns: "1fr" }}>
            <div className="admin-row-empty">Aucun goodie pour le moment.</div>
          </div>
        )}

        {goodies.map((g) => (
          <div className="item-row" key={g.id} style={{ gridTemplateColumns: "56px 1fr 90px 130px 90px 90px" }}>
            <div className="item-thumb" style={g.image_url ? { backgroundImage: `url('${g.image_url}')` } : undefined} />
            <div className="item-title">
              <Link href={`/admin/boutique/${g.id}`}>{g.title}</Link>
            </div>
            <div className="item-price">{g.price_cents != null ? formatPrice(g.price_cents) : "—"}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[g.status]}`}>{STATUS_LABEL[g.status]}</span>
            </div>
            <div>{g.position}</div>
            <div className="item-actions">
              <Link href={`/admin/boutique/${g.id}`}>Éditer</Link>
              <form action={deleteGoodie}>
                <input type="hidden" name="id" value={g.id} />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/boutique" />}
    </>
  );
}
