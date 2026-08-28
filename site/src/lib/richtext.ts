// Convertit du texte brut (paragraphes séparés par une ligne vide, comme dans
// l'ancien formulaire "un paragraphe par ligne vide") en HTML minimal <p>...</p>.
// Utilisé uniquement pour les formulaires qui n'ont pas encore d'éditeur de
// texte riche (ex. publication rapide de la Rosée Matinale du jour) — partout
// ailleurs, RichTextEditor produit déjà du HTML directement.
export function paragraphsToHtml(raw: string): string {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
