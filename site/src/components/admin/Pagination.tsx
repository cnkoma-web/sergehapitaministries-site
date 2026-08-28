import Link from "next/link";

type Props = {
  page: number;
  perPage: number;
  total: number;
  /** Chemin de base (ex. "/admin/livres" ou "/publications") — les liens de page
   * ajoutent leurs propres query params par-dessus. */
  basePath: string;
  perPageOptions?: number[];
  /** Autres filtres actifs à conserver d'une page à l'autre (ex. { type: "vs" }). */
  extraParams?: Record<string, string>;
};

// Pagination réutilisable — admin ET partie publique (cahier Partie 5 §6.1 :
// "principe à appliquer par défaut sur toute liste du site"). Purement des liens
// (?page=N&perPage=M), aucun JS requis : fonctionne même sans hydratation.
export default function Pagination({ page, perPage, total, basePath, perPageOptions = [20, 50, 100], extraParams }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  function pageHref(p: number) {
    const params = new URLSearchParams();
    params.set("page", String(p));
    params.set("perPage", String(perPage));
    for (const [k, v] of Object.entries(extraParams ?? {})) params.set(k, v);
    return `${basePath}?${params.toString()}`;
  }

  // Fenêtre de pages autour de la page courante (max 5 numéros affichés).
  const pages: number[] = [];
  const windowStart = Math.max(1, Math.min(page - 2, totalPages - 4));
  const windowEnd = Math.min(totalPages, windowStart + 4);
  for (let p = Math.max(1, windowStart); p <= windowEnd; p++) pages.push(p);

  return (
    <div className="pagination">
      <div>
        Affichage {from}–{to} sur {total}{" "}
        <form method="get" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          <input type="hidden" name="page" value="1" />
          {Object.entries(extraParams ?? {}).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <select name="perPage" defaultValue={perPage}>
            {perPageOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <button type="submit" className="admin-btn-sm">
            Appliquer
          </button>
        </form>{" "}
        par page
      </div>
      <div className="pages">
        <Link href={pageHref(Math.max(1, page - 1))} aria-disabled={page <= 1}>
          ‹
        </Link>
        {windowStart > 1 && <span style={{ padding: "0 4px" }}>…</span>}
        {pages.map((p) => (
          <Link key={p} href={pageHref(p)} className={p === page ? "active" : undefined}>
            {p}
          </Link>
        ))}
        {windowEnd < totalPages && <span style={{ padding: "0 4px" }}>…</span>}
        <Link href={pageHref(Math.min(totalPages, page + 1))} aria-disabled={page >= totalPages}>
          ›
        </Link>
      </div>
    </div>
  );
}
