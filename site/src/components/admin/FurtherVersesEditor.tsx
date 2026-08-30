"use client";

import { useState } from "react";

type Verse = { reference: string; text: string };

// Remplace l'ancienne zone de texte unique ("un par ligne, Référence | Texte")
// — syntaxe à mémoriser, peu ergonomique et source d'erreurs silencieuses (un
// verset mal formaté disparaissait simplement, sans message). Ici, chaque
// verset est deux champs classiques (Référence + Texte), envoyés au serveur
// sous forme de listes indexées (further_verse_reference[] / further_verse_text[])
// lues avec formData.getAll() — aucune syntaxe à respecter, aucun parsing fragile.
export default function FurtherVersesEditor({ initialVerses }: { initialVerses: Verse[] }) {
  const [verses, setVerses] = useState<Verse[]>(initialVerses.length > 0 ? initialVerses : [{ reference: "", text: "" }]);

  function update(i: number, field: keyof Verse, value: string) {
    setVerses((prev) => prev.map((v, idx) => (idx === i ? { ...v, [field]: value } : v)));
  }

  function remove(i: number) {
    setVerses((prev) => prev.filter((_, idx) => idx !== i));
  }

  function add() {
    setVerses((prev) => [...prev, { reference: "", text: "" }]);
  }

  return (
    <div>
      {verses.map((v, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "start" }}>
          <div style={{ flex: "0 0 120px" }}>
            <input
              type="text"
              name="further_verse_reference"
              value={v.reference}
              onChange={(e) => update(i, "reference", e.target.value)}
              placeholder="Référence"
              style={{ width: "100%", padding: "7px 9px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5 }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              name="further_verse_text"
              value={v.text}
              onChange={(e) => update(i, "text", e.target.value)}
              placeholder="Texte du verset"
              style={{ width: "100%", padding: "7px 9px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5 }}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            aria-label="Retirer ce verset"
            title="Retirer"
            style={{ background: "none", border: "1px solid var(--line)", borderRadius: 6, width: 28, height: 32, cursor: "pointer", color: "var(--ink-soft)", fontFamily: "inherit" }}
          >
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="admin-btn-sm">
        + Ajouter un verset
      </button>
    </div>
  );
}
