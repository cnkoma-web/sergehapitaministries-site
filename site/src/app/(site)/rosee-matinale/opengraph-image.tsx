import { getRoseeDuJour } from "@/lib/content/articles";
import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Rosée Matinale";

// Limite connue (retour du 05/09) — reflète toujours l'entrée du jour, jamais
// un jour précis choisi via ?date= sur la page publique : le fichier spécial
// opengraph-image de Next.js ne reçoit que les segments dynamiques de la
// route (params), jamais sa query string (searchParams). /rosee-matinale
// n'a qu'une seule route (le jour se choisit par ?date=, pas par un segment
// d'URL) — il n'y a donc aucun moyen, avec ce mécanisme, de savoir quel jour
// est partagé. Le résoudre proprement demanderait une route par jour
// (/rosee-matinale/[date]), un changement d'URLs plus large qu'un correctif
// de ce chantier.
export default async function Image() {
  const entry = await getRoseeDuJour();
  return renderOgImage({
    category: "rm",
    title: entry?.verse_text?.slice(0, 140) ?? "La pensée du jour",
  });
}
