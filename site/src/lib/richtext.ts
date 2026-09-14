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
//
// 2e bug corrigé (retour du 05/09) : `<\/[a-z]+>` fermait le match sur LA
// PREMIÈRE balise fermante rencontrée, quel que soit son nom — un paragraphe
// avec une mise en forme imbriquée (ex. `<p><b>Verset en gras</b></p>`, très
// courant sur "Que Dit la Bible") se coupait donc à `</b>`, laissant un
// `</p>` orphelin juste après (silencieusement perdu, ni l'une ni l'autre
// alternative du regex ne le capture) et un fragment HTML mal formé envoyé
// tel quel à dangerouslySetInnerHTML — les navigateurs "réparent" ça la
// plupart du temps en refermant la balise tout seuls, mais pas toujours de
// façon fiable (c'est ce qui a fait apparaître des balises en clair sur la
// page publique). `<\/\1>` (référence arrière sur le nom de la balise
// ouvrante) force la fermeture sur LA MÊME balise, quel que soit ce qu'elle
// contient à l'intérieur.
// 3e et 4e bugs corrigés (13/09, diagnostic CMS retours à la ligne / Titre
// de section) :
//
// (a) La première alternative du regex suppose que TOUTE balise a une
// fermeture correspondante — faux pour <br>, un élément vide (jamais de
// </br>). Un <br> RÉELLEMENT produit par l'éditeur en dehors de tout <p>
// (constaté avec le vrai composant RichTextEditor : Maj+Entrée comme tout
// premier retour dans un éditeur encore vide laisse "Texte<br>Suite" sans
// le moindre <p>, un artefact de contentEditable distinct de celui déjà
// corrigé le 03/09 pour le texte nu) faisait échouer le match à ce "<"
// précis ; le moteur regex passait alors au caractère suivant "b", et
// "r>Suite" (le "<" du <br> perdu en route) se retrouvait capturé comme
// texte brut, puis enveloppé dans un <p> — la balise apparaissait donc
// littéralement, en clair, sur la page publique ("br>Suite"). Un <br>
// correctement imbriqué dans un <p> (le cas normal) n'était lui jamais
// affecté. Corrigé en reconnaissant explicitement <br> comme balise à
// fermeture automatique, avant la tentative générique.
//
// (b) `[a-z]+` (nom de balise) ne capture QUE des lettres — pour <h2>, le
// groupe ne capturait donc que "h", et la référence arrière cherchait
// ensuite "</h>" (jamais présent, le vrai fermant étant "</h2>") : le match
// échouait entièrement, et la balise entière se retrouvait démembrée en
// texte visible ("h2>Titre…" puis "/h2>"), EXACTEMENT le même mécanisme
// que (a) mais déclenché par un chiffre dans le nom de balise plutôt qu'un
// élément vide — trouvé en testant la nouvelle fonction "Titre de section"
// (RichTextEditor) de bout en bout avec un vrai <h2> capturé depuis le
// navigateur, jamais par hypothèse. `[a-z][a-z0-9]*` accepte les noms de
// balise alphanumériques (h2, h3…) sans rien changer pour les balises déjà
// gérées (p, blockquote, figure, ul, ol, li — aucun chiffre) : vérifié
// identique sur tous les formats existants (voir tests de non-régression
// du 13/09).
//
// 5e bug corrigé (13/09) : reproduit en direct sur une entrée Rosée
// Matinale déjà publiée ("Tout le monde ne peut pas entrer dans votre
// vie") — le corps réel contient une balise fermante orpheline (</p> sans
// <p> correspondant, probablement un reliquat d'une modification passée,
// antérieure aux corrections (a)/(b) ci-dessus). Une fermante orpheline
// commence par "</", que ni l'alternative <br> ni l'alternative généraliste
// (qui exige une lettre juste après "<") ne reconnaissent : elle finissait
// donc démembrée exactement comme (a)/(b) — "/p&gt;" affiché littéralement
// en toutes lettres sur la page publique. Reconnue désormais explicitement
// et retirée silencieusement (elle ne porte par définition aucun contenu :
// une fermante correctement appariée est déjà consommée par l'alternative
// généraliste ci-dessus ; toute fermante encore isolée dans le flux est
// nécessairement orpheline) — jamais rendue en texte, jamais un bloc vide
// ajouté à la place.
export function extractParagraphs(html: string): string[] {
  if (!html) return [];
  const matches = html.match(/<br\s*\/?>|<\/[a-z][a-z0-9]*\s*>|<([a-z][a-z0-9]*)[^>]*>[\s\S]*?<\/\1>|[^<]+/gi) ?? [];
  return matches
    .map((m) => m.trim())
    .filter(Boolean)
    .filter((m) => !/^<\/[a-z][a-z0-9]*\s*>$/i.test(m))
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

// Règle typographique française : un espace insécable (pas un espace
// normal) doit précéder un guillemet fermant, sinon le guillemet peut se
// retrouver seul en début de ligne suivante lors d'un retour à la ligne.
//
// ATTENTION en relisant ce fichier : la chaîne de remplacement ci-dessous
// contient un vrai caractère espace insécable (U+00A0) juste avant le
// guillemet fermant, pas un espace normal — visuellement indiscernable d'un
// espace ordinaire dans un éditeur de texte, donc facile à corrompre par
// erreur en retapant cette ligne à la main plutôt qu'en la copiant.
//
// Retour du 06/09 : cette règle n'était en réalité appliquée nulle part
// dans le contenu dynamique (articles) — seulement tapée à la main, une
// fois, dans le texte statique de /connaitre-jesus. Ni Que Dit la Bible ni
// La Vie Supérieure n'en bénéficiaient, malgré ce qui avait été annoncé —
// appliquée ici aux deux, pas seulement à La Vie Supérieure, pour ne pas
// réintroduire la même incohérence. Un espace normal est justement ce
// qu'un clavier tape par défaut : rien dans le texte saisi par Serge
// (chapeau, titre, corps) ne contient jamais spontanément d'espace
// insécable, d'où l'utilité de ce filtre à l'affichage plutôt que de
// compter sur la saisie.
export function nbspBeforeClosingGuillemet(text: string): string {
  return text.replace(/ »/g, " »");
}
