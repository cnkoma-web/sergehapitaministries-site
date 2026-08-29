import Link from "next/link";
import { getBooksAdmin } from "@/lib/content/books";
import { formatPrice } from "@/lib/format";
import Pagination from "@/components/admin/Pagination";
import { deleteBook } from "./actions";

const STATUS_LABEL: Record<string, string> = { active: "Actif", precommande: "Précommande", hidden: "Masqué" };
const STATUS_CLASS: Record<string, string> = { active: "actif", precommande: "precommande", hidden: "masque" };

export default async function AdminLivresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; perPage?: string }>;
}) {
  const { page: pageParam, perPage: perPageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const perPage = Number(perPageParam) || 20;

  const { books, total } = await getBooksAdmin(page, perPage);

  return (
    <>
      <div className="admin-header">
        <div>
          <h2>Livres</h2>
        </div>
        <Link href="/admin/livres/nouveau" className="btn-add">
          + Ajouter un livre
        </Link>
      </div>
      <p className="admin-lede">Le catalogue affiché sur /livres. Cliquez sur un livre pour l&apos;éditer en détail.</p>

      <div className="items-table">
        <div className="item-row head">
          <div></div>
          <div>Titre</div>
          <div>Prix</div>
          <div>Statut</div>
          <div>Position</div>
          <div>Actions</div>
        </div>

        {books.length === 0 && (
          <div className="item-row">
            <div style={{ gridColumn: "1 / -1" }} className="admin-row-empty">
              Aucun livre pour le moment.
            </div>
          </div>
        )}

        {books.map((book) => (
          <div className="item-row" key={book.id}>
            <div className="item-thumb" style={book.cover_url ? { backgroundImage: `url('${book.cover_url}')` } : undefined} />
            <div className="item-title">
              <Link href={`/admin/livres/${book.id}`}>{book.title}</Link>
              <span>
                {book.isbn || "ISBN à renseigner"} {book.pages ? `· ${book.pages} p.` : ""}
              </span>
            </div>
            <div className="item-price">{book.price_cents != null ? formatPrice(book.price_cents) : "—"}</div>
            <div>
              <span className={`status-badge ${STATUS_CLASS[book.status]}`}>{STATUS_LABEL[book.status]}</span>
            </div>
            <div>{book.position}</div>
            <div className="item-actions">
              <Link href={`/admin/livres/${book.id}`}>Éditer</Link>
              <form action={deleteBook}>
                <input type="hidden" name="id" value={book.id} />
                <button type="submit" className="danger">
                  Suppr.
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {total > 0 && <Pagination page={page} perPage={perPage} total={total} basePath="/admin/livres" />}

      <div className="admin-note">
        Cliquer sur un livre ouvre sa fiche complète (galerie d&apos;images, prix, description,
        ISBN...) sur une page dédiée. La pagination s&apos;applique automatiquement dès qu&apos;il y
        a plus d&apos;éléments qu&apos;une page n&apos;en affiche.
      </div>
    </>
  );
}
