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
        {categories.map((c) => (
          <label
            key={c.id}
            className="chip"
            style={{
              cursor: "pointer",
              background: selected.includes(c.id) ? "var(--purple)" : "var(--lavender)",
              color: selected.includes(c.id) ? "#fff" : "var(--purple)",
            }}
          >
            <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} style={{ display: "none" }} />
            {c.name}
          </label>
        ))}
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
