import type { Metadata } from "next";
import Link from "next/link";
import { searchSite } from "@/lib/content/search";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Recherche | Serge Hapita Ministries",
  robots: { index: false, follow: true },
};

// CORRECTION CIBLÉE (reprise 16/09) : le moteur de recherche existe déjà
// dans le Header (loupe → panneau .v2-search-panel → formulaire GET vers
// /recherche, voir Header.tsx) — cette page est sa page DE RÉSULTATS, pas
// un second moteur. Le hero de la nouvelle maquette (eyebrow "Recherche" +
// "Que recherchez-vous ?" + champ + bouton), qui dupliquait ce moteur, a
// été retiré. searchSite() intégralement conservé (périmètre, colonnes,
// tri) — seule l'interface change. Bandeau minimal (.v2-utility-hero, déjà
// établi par exemple sur le Panier) plutôt qu'un second formulaire.
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const results = query ? await searchSite(query) : [];

  return (
    <div className="v2-search-page">
      <section className="v2-utility-hero">
        <div className="v2-commerce-wrap">
          <p className="v2-eyebrow light">
            <span /> Recherche
          </p>
          <h1>{query ? <>Résultats pour « {query} »</> : "Résultats de recherche"}</h1>
        </div>
      </section>

      <section className="v2-search-results">
        <div className="v2-complementary-wrap">
          {!query ? (
            <p className="empty-state">Utilisez la recherche de l&apos;en-tête du site pour chercher dans les publications et les livres.</p>
          ) : results.length === 0 ? (
            <p className="empty-state">Aucun résultat pour « {query} ».</p>
          ) : (
            <>
              <div className="v2-search-results-head">
                <span>
                  {results.length} résultat{results.length > 1 ? "s" : ""}
                </span>
              </div>
              {results.map((r) => (
                <Link href={r.href} className="v2-search-result" key={`${r.type}-${r.href}`}>
                  <span className="v2-search-result-label">{r.label}</span>
                  <h2>{r.title}</h2>
                  {r.snippet && <p>{r.snippet}</p>}
                </Link>
              ))}
            </>
          )}
        </div>
      </section>

      <Footer variant="light" />
    </div>
  );
}
