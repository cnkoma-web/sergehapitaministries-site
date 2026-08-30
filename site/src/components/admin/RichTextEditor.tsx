"use client";

import { useRef } from "react";

type Props = {
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
  minHeight?: number;
  /** Barre d'outils réduite (gras/italique/citation/liste) pour les descriptions
   * courtes (livres, goodies) vs. barre complète pour les articles. */
  compact?: boolean;
};

const ALLOWED_TAGS = new Set(["P", "B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "BLOCKQUOTE", "A", "BR", "DIV"]);

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
    if (node.tagName === "SPAN" || node.tagName === "FONT" || !ALLOWED_TAGS.has(node.tagName)) {
      // Déballe la balise (garde son contenu texte/enfants), au lieu de la
      // supprimer entièrement — on ne veut perdre ni le gras ni le texte.
      while (node.firstChild) node.parentNode?.insertBefore(node.firstChild, node);
      node.parentNode?.removeChild(node);
    }
  };
  Array.from(root.children).forEach(walk);

  // Paragraphes vides (juste un <br> ou rien) laissés par le navigateur.
  root.querySelectorAll("p, div").forEach((el) => {
    if (!el.textContent?.trim() && !el.querySelector("img")) el.remove();
  });
}

export default function RichTextEditor({ name, defaultValue, placeholder, minHeight = 160, compact = false }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

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

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    // Colle en texte brut plutôt que le HTML de la source (Word, un site web…) :
    // la police/couleur d'origine ne doit jamais s'importer dans l'article.
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    sync();
  }

  return (
    <div>
      <input ref={hiddenInputRef} type="hidden" name={name} defaultValue={defaultValue ?? ""} />
      <div className={compact ? "rich-toolbar-mini" : "rich-toolbar"}>
        <button type="button" onClick={() => exec("bold")} title="Gras">
          <b>B</b>
        </button>
        <button type="button" onClick={() => exec("italic")} title="Italique">
          <i>I</i>
        </button>
        {!compact && (
          <button type="button" onClick={() => exec("underline")} title="Souligné">
            <u>U</u>
          </button>
        )}
        <div className="sep" />
        {!compact && (
          <button
            type="button"
            title="Lien"
            onClick={() => {
              const url = window.prompt("URL du lien :");
              if (url) exec("createLink", url);
            }}
          >
            🔗
          </button>
        )}
        <button type="button" onClick={() => exec("formatBlock", "blockquote")} title="Citation">
          ❝
        </button>
        <button type="button" onClick={() => exec("insertUnorderedList")} title="Liste à puces">
          ☰
        </button>
        {!compact && (
          <>
            <button type="button" onClick={() => exec("insertOrderedList")} title="Liste numérotée">
              ≡
            </button>
            <div className="sep" />
            <button type="button" onClick={() => exec("outdent")} title="Diminuer le retrait">
              ⇤
            </button>
            <button type="button" onClick={() => exec("indent")} title="Augmenter le retrait">
              ⇥
            </button>
          </>
        )}
      </div>
      <div
        ref={editorRef}
        className={compact ? "desc-editable" : "body-input"}
        contentEditable
        suppressContentEditableWarning
        style={{ minHeight }}
        data-placeholder={placeholder}
        onInput={sync}
        onBlur={sanitizeAndSync}
        onPaste={handlePaste}
        onFocus={() => document.execCommand("defaultParagraphSeparator", false, "p")}
        dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
      />
    </div>
  );
}
