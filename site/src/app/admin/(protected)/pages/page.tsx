import Link from "next/link";
import { PAGE_CONTENT_DEFINITIONS } from "@/lib/content/pageContent";

export default function AdminPagesPage() {
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
      <div className="items-table">
        <div className="item-row head" style={{ gridTemplateColumns: "220px 1fr 130px" }}>
          <div>Page</div><div>Contenu</div><div>Action</div>
        </div>
        {PAGE_CONTENT_DEFINITIONS.map((page) => (
          <div className="item-row" style={{ gridTemplateColumns: "220px 1fr 130px" }} key={page.slug}>
            <div className="item-title"><strong>{page.label}</strong><span>{page.publicPath}</span></div>
            <div>{page.description}</div>
            <div className="item-actions"><Link href={`/admin/pages/${page.slug}`}>Modifier</Link></div>
          </div>
        ))}
      </div>
    </>
  );
}
