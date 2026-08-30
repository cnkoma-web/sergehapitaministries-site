"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/lib/content/categories";
import { createCategoryFromPicker } from "@/app/admin/(protected)/categories/actions";

export default function CategoryPicker({
  allCategories,
  initialSelectedIds,
}: {
  allCategories: Category[];
  initialSelectedIds: string[];
}) {
  const [categories, setCategories] = useState(allCategories);
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      const created = await createCategoryFromPicker(name);
      if (created) {
        setCategories((prev) => (prev.some((c) => c.id === created.id) ? prev : [...prev, created]));
        setSelected((prev) => (prev.includes(created.id) ? prev : [...prev, created.id]));
        setNewName("");
      }
    });
  }

  return (
    <div>
      {selected.map((id) => (
        <input key={id} type="hidden" name="category_ids" value={id} />
      ))}
      <div className="chip-row" style={{ marginBottom: 10 }}>
        {categories.map((c) =>
          selected.includes(c.id) ? (
            // Sélectionné : une croix explicite pour retirer, plutôt que de
            // compter sur le seul rappel qu'un second clic sur la puce
            // (comportement peu visible) fait la même chose.
            <span
              key={c.id}
              className="chip"
              style={{ background: "var(--purple)", color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {c.name}
              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-label={`Retirer le thème ${c.name}`}
                title="Retirer"
                style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1, fontFamily: "inherit" }}
              >
                ×
              </button>
            </span>
          ) : (
            <button
              key={c.id}
              type="button"
              className="chip"
              onClick={() => toggle(c.id)}
              style={{ background: "var(--lavender)", color: "var(--purple)", cursor: "pointer", border: 0, fontFamily: "inherit" }}
            >
              {c.name}
            </button>
          )
        )}
        {categories.length === 0 && <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Aucune catégorie pour l&apos;instant.</span>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="+ Créer une catégorie"
          style={{ flex: 1, padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5 }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
        />
        <button type="button" onClick={handleCreate} disabled={isPending || !newName.trim()} className="admin-btn-sm">
          {isPending ? "…" : "Ajouter"}
        </button>
      </div>
    </div>
  );
}
