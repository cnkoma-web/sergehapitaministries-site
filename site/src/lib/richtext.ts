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

// Découpe le HTML d'un article en blocs (un par paragraphe/élément) pour
// l'affichage public — utilisé pour le rendu paragraphe par paragraphe et
// pour le mur d'accès La Vie Supérieure (ne révéler que les 4 premiers).
//
// Bug corrigé (retour du 03/09) : le premier bloc tapé dans l'éditeur reste
// un nœud de texte "nu" (sans balise <p>) tant que l'auteur n'a pas appuyé
// sur Entrée — un artefact connu de contentEditable. L'ancienne extraction
// ne matchait que des blocs `<balise>...</balise>` complets et perdait donc
// silencieusement ce texte nu de tête (premier paragraphe absent en front,
// constaté sur "Vis depuis ton esprit"). On capture maintenant aussi les
// segments de texte brut entre les balises, et on les enveloppe dans <p>
// pour qu'ils reçoivent le même style que les autres paragraphes.
export function extractParagraphs(html: string): string[] {
  if (!html) return [];
  const matches = html.match(/<[a-z][^>]*>[\s\S]*?<\/[a-z]+>|[^<]+/gi) ?? [];
  return matches
    .map((m) => m.trim())
    .filter(Boolean)
    .map((m) => (m.startsWith("<") ? m : `<p>${m}</p>`));
}

export function paragraphsToHtml(raw: string): string {
  return raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}
