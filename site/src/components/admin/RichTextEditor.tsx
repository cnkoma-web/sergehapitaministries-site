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

// Éditeur de texte enrichi maison (contentEditable + document.execCommand) —
// inspiré du blog Wix que Serge utilise déjà (cahier Partie 5 §6.1/6.2).
// Pas de dépendance externe (Tiptap/Quill...) pour un besoin aussi simple.
// L'HTML produit n'est jamais soumis par un visiteur : seul un admin authentifié
// (is_admin()) peut l'écrire, et il est réinjecté tel quel côté public
// (dangerouslySetInnerHTML) — confiance justifiée par cette frontière d'accès,
// à revoir si l'admin devient un jour multi-utilisateurs non tous approuvés.
export default function RichTextEditor({ name, defaultValue, placeholder, minHeight = 160, compact = false }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    sync();
  }

  function sync() {
    if (hiddenInputRef.current && editorRef.current) {
      hiddenInputRef.current.value = editorRef.current.innerHTML;
    }
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
        onBlur={sync}
        dangerouslySetInnerHTML={{ __html: defaultValue ?? "" }}
      />
    </div>
  );
}
