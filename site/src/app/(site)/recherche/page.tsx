import type { Metadata } from "next";
import Link from "next/link";
import { searchSite } from "@/lib/content/search";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Recherche | Serge Hapita Ministries",
  robots: { index: false, follow: true },
};

// RECONSTRUCTION (chantier Vidéos + Recherche, mise en conformité, 16/09) —
// source de vérité : maquettes-complementaires-shm/recherche.html.
// searchSite() intégralement conservé (périmètre, colonnes, tri) — seule
// l'interface change. Le champ de recherche du hero est réel (formulaire
// GET vers cette même page), pas une duplication : un commentaire précédent
// justifiait son absence ("il vit dans l'en-tête") mais la nouvelle
// maquette, qui fait foi pour l'interface, en place un ici — ajouté.
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
      <section className="v2-search-hero">
        <div className="v2-complementary-wrap">
          <p className="v2-eyebrow">
            <span /> Recherche
          </p>
          <h1>Que recherchez-vous&nbsp;?</h1>
          <p>Retrouvez les publications, enseignements, livres et ressources disponibles sur Serge Hapita Ministries.</p>
          <form className="v2-search-box" action="/recherche" method="get">
            <input type="search" name="q" defaultValue={query} placeholder="Rechercher sur le site" aria-label="Rechercher sur le site" />
            <button type="submit" className="v2-btn v2-btn-primary">
              Rechercher
            </button>
          </form>
        </div>
      </section>

      <section className="v2-search-results">
        <div className="v2-complementary-wrap">
          {!query ? (
            <p className="empty-state">Tapez un mot-clé ci-dessus pour chercher dans les publications et les livres.</p>
          ) : results.length === 0 ? (
            <p className="empty-state">Aucun résultat pour « {query} ».</p>
          ) : (
            <>
              <div className="v2-search-results-head">
                <strong>Résultats pour « {query} »</strong>
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
