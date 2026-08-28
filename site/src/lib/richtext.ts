// Convertit du texte brut (paragraphes séparés par une ligne vide, comme dans
// l'ancien formulaire "un paragraphe par ligne vide") en HTML minimal <p>...</p>.
// Utilisé uniquement pour les formulaires qui n'ont pas encore d'éditeur de
// texte riche (ex. publication rapide de la Rosée Matinale du jour) — partout
// ailleurs, RichTextEditor produit déjà du HTML directement.
// Texte brut à partir de HTML (RichTextEditor) — pour un extrait de repli quand
// aucun chapeau n'a été saisi. Ne jamais afficher le HTML tel quel comme texte.
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function paragraphsToHtml(raw: string): string {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
