import Link from "next/link";
import { PAGE_CONTENT_DEFINITIONS } from "@/lib/content/pageContent";
import Pagination from "@/components/admin/Pagination";

const PER_PAGE = 7;

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Math.max(1, Number((await searchParams).page) || 1);
  const totalPages = Math.max(1, Math.ceil(PAGE_CONTENT_DEFINITIONS.length / PER_PAGE));
  const page = Math.min(requestedPage, totalPages);
  const visiblePages = PAGE_CONTENT_DEFINITIONS.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">Contenu du site</p>
          <h1>Pages du site</h1>
        </div>
      </header>
      <p className="admin-lede">
        Ouvrez une page pour modifier les textes réellement affichés sur le site, sans intervenir dans le code.
      </p>
      <div className="items-table admin-pages-table">
        <div className="item-row head">
          <div>Page</div><div>Contenu</div><div>Action</div>
        </div>
        {visiblePages.map((definition) => (
          <div className="item-row" key={definition.slug}>
            <div className="item-title"><strong>{definition.label}</strong><span>{definition.publicPath}</span></div>
            <div>{definition.description}</div>
            <div className="item-actions"><Link href={`/admin/pages/${definition.slug}`}>Modifier</Link></div>
          </div>
        ))}
        <Pagination
          page={page}
          perPage={PER_PAGE}
          total={PAGE_CONTENT_DEFINITIONS.length}
          basePath="/admin/pages"
          showPerPageSelector={false}
        />
      </div>
    </>
  );
}

