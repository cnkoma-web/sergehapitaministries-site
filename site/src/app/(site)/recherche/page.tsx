import type { Metadata } from "next";
import Link from "next/link";
import { searchSite } from "@/lib/content/search";
import Newsletter from "@/components/layout/Newsletter";
import Footer from "@/components/layout/Footer";

// Page de recherche (retour du 05/09) — l'icône loupe de l'en-tête n'avait
// jusqu'ici aucune destination. Formulaire GET pur (?q=...), sans JS
// nécessaire pour fonctionner. Pas indexée : ce sont des pages de résultats,
// pas du contenu éditorial en soi.
export const metadata: Metadata = {
  title: "Recherche | Serge Hapita Ministries",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchSite(query) : [];

  return (
    <>
      <section className="util-hero">
        <div className="wrap">
          <h1>Recherche</h1>
          <form method="get" className="search-form">
            <input type="search" name="q" defaultValue={query} placeholder="Un article, un livre, un produit…" aria-label="Rechercher sur le site" />
            <button type="submit" className="btn btn-primary">
              Rechercher
            </button>
          </form>
        </div>
      </section>

      <section className="section">
        <div className="content-col">
          {!query ? (
            <p className="empty-state">Tapez un mot-clé ci-dessus pour chercher dans les publications, les livres et la boutique.</p>
          ) : results.length === 0 ? (
            <p className="empty-state">Aucun résultat pour « {query} ».</p>
          ) : (
            <>
              <p className="search-count">
                {results.length} résultat{results.length > 1 ? "s" : ""} pour « {query} »
              </p>
              <div className="search-results">
                {results.map((r) => (
                  <Link href={r.href} className="search-result" key={`${r.type}-${r.href}`}>
                    <span className="search-result-label">{r.label}</span>
                    <h3>{r.title}</h3>
                    {r.snippet && <p>{r.snippet}</p>}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Newsletter />
      <Footer variant="light" />
    </>
  );
}
