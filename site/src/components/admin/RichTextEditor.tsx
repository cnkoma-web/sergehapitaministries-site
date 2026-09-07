"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  minHeight?: number;
  /** Barre d'outils réduite (gras/italique/citation/liste) pour les descriptions
   * courtes (livres, goodies) vs. barre complète pour les articles. */
  compact?: boolean;
  /** Que Dit la Bible / La Vie Supérieure (retour du 06/09) — colore la
   * citation et la citation mise en exergue (bleu sur VS, violet sur QDLB,
   * voir globals.css). Sans catégorie (livres/goodies, pas de rubrique),
   * reste violet par défaut. Jamais "rm" : cet éditeur ne gère pas Rosée
   * Matinale (écran dédié séparé). */
  category?: "qdlb" | "vs";
};

const ALLOWED_TAGS = new Set(["P", "B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "BLOCKQUOTE", "FIGURE", "A", "BR", "DIV"]);

// Nettoie le HTML produit par contentEditable : retire les styles/polices
// ramenés par un copier-coller depuis une autre source (Word, un site...) et
// les balises vides laissées par le navigateur après une suppression/fusion de
// paragraphes (cause des écarts de ligne inattendus signalés en test réel).
function sanitize(root: HTMLElement) {
  const walk = (node: Element) => {
    Array.from(node.children).forEach(walk);
    node.removeAttribute("style");
    node.removeAttribute("class");
    node.removeAttribute("face");
    node.removeAttribute("color");
    // Bloc "citation mise en exergue" traité comme un élément déplaçable en
    // bloc, jamais comme du texte en ligne (retour du 07/09) — contenteditable
    // et draggable réappliqués systématiquement ici (pas seulement à la
    // création) : un <figure> chargé depuis du contenu déjà enregistré avant
    // ce correctif n'aurait sinon jamais ces attributs. contenteditable
    // n'est pas concerné par le nettoyage ci-dessus (style/class/face/color
    // uniquement), donc rien ne l'efface une fois posé.
    if (node.tagName === "FIGURE") {
      node.setAttribute("contenteditable", "false");
      node.setAttribute("draggable", "true");
    }
    if (node.tagName === "SPAN" || node.tagName === "FONT" || !ALLOWED_TAGS.has(node.tagName)) {
      // Déballe la balise (garde son contenu texte/enfants), au lieu de la
      // supprimer entièrement — on ne veut perdre ni le gras ni le texte.
      while (node.firstChild) node.parentNode?.insertBefore(node.firstChild, node);
      node.parentNode?.removeChild(node);
    }
  };
  Array.from(root.children).forEach(walk);

  // On ne supprime plus les paragraphes "vides" ici : un <p><br></p> est
  // indissociable, par sa forme dans le DOM, d'une ligne blanche volontaire
  // (Entrée deux fois pour aérer le texte) — cette suppression automatique
  // effaçait donc aussi les sauts de ligne voulus par Serge (signalé après
  // enregistrement : le texte semblait perdre sa mise en forme). Un paragraphe
  // réellement vide laissé par erreur n'est qu'un artefact visuel mineur,
  // largement préférable à la perte silencieuse d'une mise en page voulue.
}

// Icônes SVG (retour du 06/09) — remplacent les glyphes Unicode/emoji
// (🔗 ❝ ☰ ≡ ⇤ ⇥), qui rendaient différemment selon l'OS/la police système et
// donnaient un aspect peu soigné. Gras/italique/souligné restent des lettres
// B/I/U (comme Google Docs) — déjà claires, pas besoin d'icône.
const ICONS = {
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  quote: (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5 15.5c-1.1 0-2-.4-2.7-1.2-.7-.8-1-1.8-1-3.1 0-1.7.5-3.3 1.5-4.8s2.3-2.6 3.9-3.4l1 1.6c-1.1.7-2 1.5-2.6 2.5-.6.9-1 1.9-1.1 2.9.3-.1.6-.2 1-.2 1 0 1.8.3 2.4 1 .6.6 1 1.4 1 2.4 0 1-.3 1.8-1 2.4-.6.6-1.4.9-2.4.9zm9 0c-1.1 0-2-.4-2.7-1.2-.7-.8-1-1.8-1-3.1 0-1.7.5-3.3 1.5-4.8s2.3-2.6 3.9-3.4l1 1.6c-1.1.7-2 1.5-2.6 2.5-.6.9-1 1.9-1.1 2.9.3-.1.6-.2 1-.2 1 0 1.8.3 2.4 1 .6.6 1 1.4 1 2.4 0 1-.3 1.8-1 2.4-.6.6-1.4.9-2.4.9z" />
    </svg>
  ),
  bulletList: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="6" x2="21" y2="6" />
      <line x1="9" y1="12" x2="21" y2="12" />
      <line x1="9" y1="18" x2="21" y2="18" />
      <circle cx="4" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  ),
  numberList: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <path d="M4.5 5.5h1v3" />
      <path d="M3.8 12.2c.2-.5.7-.7 1.2-.7.6 0 1.1.4 1.1 1s-.5.9-1.1 1.4c-.6.5-1.1.9-1.2 1.4h2.3" strokeWidth="1.4" />
      <path d="M3.8 17.3h1.4c.5 0 .8.3.8.7s-.3.6-.8.6h-.4M4.3 18.6h.9c.5 0 .8.3.8.7s-.3.7-.8.7H3.8" strokeWidth="1.2" />
    </svg>
  ),
  indent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="9" y2="6" />
      <line x1="21" y1="12" x2="11" y2="12" />
      <line x1="21" y1="18" x2="9" y2="18" />
      <polyline points="3 9 7 12 3 15" />
    </svg>
  ),
  outdent: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="21" y1="6" x2="9" y2="6" />
      <line x1="21" y1="12" x2="11" y2="12" />
      <line x1="21" y1="18" x2="9" y2="18" />
      <polyline points="7 9 3 12 7 15" />
    </svg>
  ),
  // Citation mise en exergue (retour du 06/09) — un cadre avec deux petites
  // marques de citation dedans, pour se distinguer visuellement de l'icône
  // "quote" simple ci-dessus (celle-là transforme le texte sur place ;
  // celle-ci duplique la phrase dans un bloc séparé).
  pullQuote: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <path d="M8.2 9.8c-1 0-1.8.8-1.8 2s.5 1.8 1.3 1.8c.5 0 .9-.4.9-.9 0-.4-.3-.7-.7-.8.1-.7.6-1.2 1.1-1.4" />
      <path d="M14.7 9.8c-1 0-1.8.8-1.8 2s.5 1.8 1.3 1.8c.5 0 .9-.4.9-.9 0-.4-.3-.7-.7-.8.1-.7.6-1.2 1.1-1.4" />
    </svg>
  ),
};

export default function RichTextEditor({ name, defaultValue, placeholder, minHeight = 160, compact = false, category }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  // Bloc <figure> actuellement en train d'être glissé (retour du 07/09) —
  // voir handleDragStart/handleDrop plus bas.
  const draggedFigureRef = useRef<HTMLElement | null>(null);
  // États actifs de la sélection courante (retour du 06/09) — surligne le
  // bouton concerné pendant l'édition (gras/italique/souligné/liste), comme
  // Google Docs/Notion. Recalculé à chaque déplacement du curseur.
  const [active, setActive] = useState<Set<string>>(new Set());

  useEffect(() => {
    function updateActiveStates() {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (!editor || !selection || selection.rangeCount === 0) return;
      const anchor = selection.anchorNode;
      if (!anchor || !editor.contains(anchor)) return;

      const next = new Set<string>();
      if (document.queryCommandState("bold")) next.add("bold");
      if (document.queryCommandState("italic")) next.add("italic");
      if (document.queryCommandState("underline")) next.add("underline");
      const anchorEl = anchor.nodeType === Node.ELEMENT_NODE ? (anchor as Element) : anchor.parentElement;
      if (anchorEl?.closest("ul")) next.add("ul");
      if (anchorEl?.closest("ol")) next.add("ol");
      if (anchorEl?.closest("blockquote")) next.add("blockquote");
      setActive(next);
    }
    document.addEventListener("selectionchange", updateActiveStates);
    return () => document.removeEventListener("selectionchange", updateActiveStates);
  }, []);

  // Normalise les <figure> déjà enregistrées avant ce correctif (retour du
  // 07/09) — contenteditable/draggable n'existaient pas encore à leur
  // création, sans ce passage elles resteraient du texte en ligne classique
  // tant que Serge ne les recrée pas à la main.
  useEffect(() => {
    if (editorRef.current) sanitize(editorRef.current);
  }, []);

  // Ne recopie QUE la valeur, sans toucher au DOM en cours d'édition — appelé à
  // chaque frappe. Le nettoyage structurel (sanitize) est destructif pour un
  // élément en train d'être édité (ex. le paragraphe vide qu'on vient de créer
  // avec Entrée, pas encore rempli) : le lancer ici cassait le retour à la
  // ligne, la ligne vide étant supprimée avant même qu'on ait pu y taper.
  function sync() {
    if (hiddenInputRef.current && editorRef.current) {
      hiddenInputRef.current.value = editorRef.current.innerHTML;
    }
  }

  // Nettoyage structurel complet — uniquement à des moments où l'utilisateur
  // n'est plus en train de taper dans l'élément concerné (perte de focus,
  // juste après un collage, après une action de la barre d'outils).
  function sanitizeAndSync() {
    if (editorRef.current) sanitize(editorRef.current);
    sync();
  }

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    sanitizeAndSync();
  }

  // Bascule liste à puces/numérotée en manipulant le DOM directement (retour
  // du 06/09) — remplace document.execCommand("insertUnorderedList"/
  // "insertOrderedList"), signalé peu fiable (comportement incohérent d'un
  // navigateur à l'autre, listes qui ne se créent pas ou s'appliquent à tout
  // le bloc plutôt qu'à la sélection). Ne travaille que sur les blocs de haut
  // niveau réellement touchés par la sélection — jamais tout l'éditeur.
  function toggleList(tag: "ul" | "ol") {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    // Blocs de haut niveau (enfants directs de l'éditeur, ou <li> d'une liste
    // déjà existante) qui intersectent la sélection.
    const blocks: HTMLElement[] = [];
    for (const child of Array.from(editor.children)) {
      if (!range.intersectsNode(child)) continue;
      if (child.tagName === "UL" || child.tagName === "OL") {
        for (const li of Array.from(child.children)) {
          if (range.intersectsNode(li)) blocks.push(li as HTMLElement);
        }
      } else {
        blocks.push(child as HTMLElement);
      }
    }
    if (blocks.length === 0) {
      // Sélection vide/curseur dans l'éditeur lui-même sans bloc enfant
      // identifiable (éditeur tout juste vidé) — rien à transformer.
      return;
    }

    const wantedTag = tag.toUpperCase();
    const allAlreadyThisList = blocks.every((b) => b.tagName === "LI" && b.parentElement?.tagName === wantedTag);

    if (allAlreadyThisList) {
      // Déjà cette liste : on la défait, chaque <li> redevient un <p>. Un
      // <p> ne peut jamais être un enfant direct d'un <ul>/<ol> (HTML
      // invalide) — les paragraphes extraits doivent sortir de la liste,
      // jamais y rester insérés (bug trouvé en vérifiant : la première
      // version faisait `insertBefore(p, li)`, qui insère bien AVANT le
      // <li> mais toujours À L'INTÉRIEUR du même parent, donc toujours dans
      // la liste). Regroupe par liste parente + position consécutive, pour
      // scinder proprement la liste en deux si la sélection n'en retire que
      // le milieu (le reste de la liste doit rester une vraie liste).
      const groups: HTMLElement[][] = [];
      blocks.forEach((li) => {
        const last = groups[groups.length - 1];
        if (last && last[last.length - 1].nextElementSibling === li) last.push(li);
        else groups.push([li]);
      });

      groups.forEach((group) => {
        const list = group[0].parentElement;
        if (!list) return;
        const remainderStart = group[group.length - 1].nextElementSibling;

        const paragraphs = group.map((li) => {
          const p = document.createElement("p");
          p.innerHTML = li.innerHTML || "<br>";
          li.remove();
          return p;
        });

        // Les <li> restants après le groupe retiré (s'il y en a) rejoignent
        // une nouvelle liste, insérée après les paragraphes extraits — la
        // liste d'origine ne garde que ceux d'avant le groupe.
        let restList: HTMLElement | null = null;
        if (remainderStart) {
          restList = document.createElement(list.tagName.toLowerCase());
          let node: Element | null = remainderStart;
          while (node) {
            const next: Element | null = node.nextElementSibling;
            restList.appendChild(node);
            node = next;
          }
        }

        const parent = list.parentElement;
        const insertBeforeNode = list.nextSibling;
        paragraphs.forEach((p) => parent?.insertBefore(p, insertBeforeNode));
        if (restList) parent?.insertBefore(restList, insertBeforeNode);
        if (list.children.length === 0) list.remove();
      });
    } else {
      // Regroupe les blocs consécutifs dans une seule liste par groupe,
      // plutôt qu'une liste séparée par paragraphe sélectionné.
      let i = 0;
      while (i < blocks.length) {
        const group: HTMLElement[] = [blocks[i]];
        while (i + 1 < blocks.length && blocks[i].nextElementSibling === blocks[i + 1]) {
          i++;
          group.push(blocks[i]);
        }
        const list = document.createElement(tag);
        group[0].parentElement?.insertBefore(list, group[0]);
        group.forEach((block) => {
          const li = document.createElement("li");
          li.innerHTML = block.innerHTML || "<br>";
          list.appendChild(li);
          block.remove();
        });
        i++;
      }
    }

    editor.focus();
    sanitizeAndSync();
  }

  // "Citation mise en exergue" (pull quote, retour du 06/09) — distincte du
  // bouton "Citation" ci-dessus : celui-là transforme le texte sélectionné
  // SUR PLACE (blockquote) ; celle-ci DUPLIQUE la phrase sélectionnée dans
  // un nouveau bloc <figure> inséré juste après le paragraphe qui la
  // contient — le texte d'origine ne bouge pas, ne change pas. <figure> est
  // la balise sémantique HTML5 exacte pour ce cas ("contenu qui pourrait
  // être déplacé sans changer le sens du texte principal") — jamais de
  // class="pull-quote" pour porter ce style : sanitize() (plus haut)
  // retire tout attribut class sans distinction, une classe serait perdue
  // au premier passage.
  // Renvoie le <figure> actuellement sélectionné EN ENTIER (posé par
  // handleClick via range.selectNode), pas un simple curseur texte à
  // l'intérieur d'un paragraphe — retour du 07/09, condition partagée par
  // le bouton (bascule suppression) et le clavier (Suppr/Retour arrière).
  function getSelectedFigure(): HTMLElement | null {
    const selection = window.getSelection();
    const editor = editorRef.current;
    if (!selection || !editor || selection.rangeCount === 0) return null;
    const range = selection.getRangeAt(0);
    if (range.startContainer !== editor) return null;
    const node = editor.childNodes[range.startOffset];
    return node instanceof HTMLElement && node.tagName === "FIGURE" ? node : null;
  }

  function insertPullQuote() {
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0) return;

    // Bascule (retour du 07/09) : si la sélection courante est déjà
    // exactement une citation en exergue, le bouton la retire proprement au
    // lieu d'essayer d'en créer une seconde à partir de son propre texte —
    // bug corrigé : sans cette vérification, re-cliquer le bouton (ou
    // cliquer dessus après avoir sélectionné le bloc) dupliquait la
    // citation en cascade au lieu de la supprimer.
    const selectedFigure = getSelectedFigure();
    if (selectedFigure) {
      selectedFigure.remove();
      sanitizeAndSync();
      return;
    }

    const text = selection.toString().trim();
    if (!text) return;

    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    const figure = document.createElement("figure");
    figure.textContent = text;

    // Remonte jusqu'au bloc de haut niveau (enfant direct de l'éditeur)
    // contenant la sélection, pour insérer la citation juste après LUI —
    // jamais après un simple <li>/<b> intermédiaire.
    let node: Node | null = range.commonAncestorContainer;
    if (node.nodeType !== Node.ELEMENT_NODE) node = node.parentElement;
    let block = node as Element | null;
    while (block && block !== editor && block.parentElement !== editor) {
      block = block.parentElement;
    }

    if (!block || block === editor) {
      // Sélection à même l'éditeur, sans bloc parent identifiable (texte
      // "nu" pas encore encapsulé dans un <p> — artefact contentEditable
      // documenté plus haut) : ajoute simplement à la fin.
      editor.appendChild(figure);
    } else {
      block.parentElement?.insertBefore(figure, block.nextSibling);
    }

    sanitizeAndSync();
  }

  // Déplacement manuel du bloc "citation mise en exergue" par glisser-
  // déposer (retour du 07/09) — remplace la position automatique décidée
  // par insertPullQuote ci-dessus, aucune règle ne pouvant deviner la bonne
  // place dans tous les cas. contenteditable="false" (posé par sanitize())
  // fait du <figure> un bloc atomique plutôt que du texte en ligne : le
  // clic le sélectionne en entier (jamais un simple curseur texte à
  // l'intérieur), donc le déplacer — glisser ou couper/coller — conserve sa
  // mise en forme intégralement, puisque c'est tout l'élément qui se
  // déplace, jamais seulement le texte qu'il contient.
  // Un clic sur un élément contenteditable="false" ne le sélectionne pas
  // forcément en entier tout seul (constaté en vérifiant : le navigateur
  // pose parfois juste un curseur texte juste à côté, dans le contenu
  // éditable environnant) — sélectionne explicitement tout le nœud
  // <figure> au clic, pour que Copier/Couper (Ctrl/Cmd+C/X) saisissent
  // toujours le bloc entier, jamais seulement une partie de son texte.
  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const figure = (e.target as HTMLElement).closest?.("figure");
    if (!figure || !editorRef.current?.contains(figure)) return;
    const range = document.createRange();
    range.selectNode(figure);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>) {
    const figure = (e.target as HTMLElement).closest?.("figure");
    if (!figure) return;
    draggedFigureRef.current = figure;
    e.dataTransfer.effectAllowed = "move";
    // Certains navigateurs n'autorisent le glisser-déposer que si des
    // données sont effectivement transférées — jamais utilisées ensuite,
    // c'est le nœud DOM lui-même qui est déplacé au dépôt, pas ce texte.
    e.dataTransfer.setData("text/plain", figure.textContent ?? "");
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    if (!draggedFigureRef.current) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    const editor = editorRef.current;
    const dragged = draggedFigureRef.current;
    draggedFigureRef.current = null;
    if (!editor || !dragged) return;
    e.preventDefault();

    // Bloc de haut niveau le plus proche verticalement du point de dépôt —
    // insère la citation juste avant lui, ou en fin d'éditeur si le dépôt a
    // lieu sous le dernier bloc.
    const blocks = Array.from(editor.children).filter((el) => el !== dragged);
    let insertBeforeEl: Element | null = null;
    for (const block of blocks) {
      const rect = block.getBoundingClientRect();
      if (e.clientY < rect.top + rect.height / 2) {
        insertBeforeEl = block;
        break;
      }
    }
    editor.insertBefore(dragged, insertBeforeEl);
    sanitizeAndSync();
  }

  // Suppr/Retour arrière gérés explicitement quand une citation en exergue
  // est sélectionnée (retour du 07/09) — le comportement natif du
  // navigateur pour supprimer un nœud contenteditable="false" niché dans du
  // contenteditable="true" s'est révélé peu fiable en vérifiant (le
  // <figure> restait en place, et le paragraphe adjacent se retrouvait
  // mis en gras par erreur) : on prend la main entièrement plutôt que de
  // laisser le navigateur improviser une suppression.
  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    const figure = getSelectedFigure();
    if (!figure) return;
    e.preventDefault();
    figure.remove();
    sanitizeAndSync();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    // Colle en texte brut plutôt que le HTML de la source (Word, un site web…) :
    // la police/couleur d'origine ne doit jamais s'importer dans l'article.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    sync();
  }

  const toolbarBtnClass = compact ? "rich-btn-mini" : "rich-btn";

  return (
    <div>
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue ?? ""} />
      <div className={compact ? "rich-toolbar-mini" : "rich-toolbar"}>
        <button type="button" className={toolbarBtnClass} data-active={active.has("bold")} onClick={() => exec("bold")} title="Gras">
          <b>B</b>
        </button>
        <button type="button" className={toolbarBtnClass} data-active={active.has("italic")} onClick={() => exec("italic")} title="Italique">
          <i>I</i>
        </button>
        {!compact && (
          <button type="button" className={toolbarBtnClass} data-active={active.has("underline")} onClick={() => exec("underline")} title="Souligné">
            <u>U</u>
          </button>
        )}
        <div className="sep" />
        {!compact && (
          <button
            type="button"
            className={toolbarBtnClass}
            title="Lien"
            onClick={() => {
              const url = window.prompt("URL du lien :");
              if (url) exec("createLink", url);
            }}
          >
            {ICONS.link}
          </button>
        )}
        <button
          type="button"
          className={toolbarBtnClass}
          data-active={active.has("blockquote")}
          onClick={() => exec("formatBlock", "blockquote")}
          title="Citation"
        >
          {ICONS.quote}
        </button>
        {!compact && (
          <button type="button" className={toolbarBtnClass} onClick={insertPullQuote} title="Citation mise en exergue">
            {ICONS.pullQuote}
          </button>
        )}
        <button type="button" className={toolbarBtnClass} data-active={active.has("ul")} onClick={() => toggleList("ul")} title="Liste à puces">
          {ICONS.bulletList}
        </button>
        {!compact && (
          <>
            <button type="button" className={toolbarBtnClass} data-active={active.has("ol")} onClick={() => toggleList("ol")} title="Liste numérotée">
              {ICONS.numberList}
            </button>
            <div className="sep" />
            <button type="button" className={toolbarBtnClass} onClick={() => exec("outdent")} title="Diminuer le retrait">
              {ICONS.outdent}
            </button>
            <button type="button" className={toolbarBtnClass} onClick={() => exec("indent")} title="Augmenter le retrait">
              {ICONS.indent}
            </button>
          </>
        )}
      </div>
      <div
        ref={editorRef}
        className={compact ? "desc-editable" : `body-input${category ? ` ${category}` : ""}`}
        contentEditable
        suppressContentEditableWarning
        style={{ minHeight }}
        data-placeholder={placeholder}
        onInput={sync}
        onBlur={sanitizeAndSync}
        onPaste={handlePaste}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onFocus={() => document.execCommand("defaultParagraphSeparator", false, "p")}
        dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
      />
    </div>
  );
}
