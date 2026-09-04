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
      {/* Titre de résultats, pas un nouveau formulaire de recherche (retour
          du 05/09, 2e passage) — la zone de saisie vit désormais dans
          l'en-tête (voir Header.tsx), présente sur cette page comme sur
          toutes les autres ; pas besoin d'en dupliquer une ici. */}
      <section className="util-hero">
        <div className="wrap">
          <h1>{query ? <>Résultats pour : {query}</> : "Résultats de recherche"}</h1>
        </div>
      </section>

      <section className="section">
        <div className="content-col">
          {!query ? (
            <p className="empty-state">Tapez un mot-clé dans la recherche de l&apos;en-tête pour chercher dans les publications et les livres.</p>
          ) : results.length === 0 ? (
            <p className="empty-state">Aucun résultat pour « {query} ».</p>
          ) : (
            <>
              <p className="search-count">
                {results.length} résultat{results.length > 1 ? "s" : ""}
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
