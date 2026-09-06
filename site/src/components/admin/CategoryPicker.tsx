"use client";

import { useState, useTransition } from "react";
import type { Category } from "@/lib/content/categories";
import { createCategoryFromPicker } from "@/app/admin/(protected)/categories/actions";

// Recherche + autocomplétion (retour du 06/09, remplace la version
// précédente) — deux problèmes corrigés :
// 1. Retirer un thème le repeignait juste en gris dans la même rangée, sans
//    jamais quitter la vue (un simple "toggle" sur la même liste) — Serge
//    percevait ça comme "la croix ne fait rien". Ici, retirer un thème le
//    fait vraiment disparaître de la rangée "thèmes assignés".
// 2. Tous les thèmes jamais créés s'affichaient en permanence, en boutons à
//    plat — une liste qui grossit indéfiniment (remarque explicite de
//    Serge). Remplacée par un champ de recherche qui ne montre que les
//    thèmes correspondant à ce qui est tapé, avec une option "+ Créer" quand
//    aucun thème existant ne correspond exactement.
export default function CategoryPicker({
  allCategories,
  initialSelectedIds,
}: {
  allCategories: Category[];
  initialSelectedIds: string[];
}) {
  const [categories, setCategories] = useState(allCategories);
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const selectedCategories = selected
    .map((id) => categories.find((c) => c.id === id))
    .filter((c): c is Category => Boolean(c));

  // Pas de useMemo ici (retour du 06/09) — ce projet laisse le React
  // Compiler mémoïser automatiquement (voir absence de useMemo ailleurs dans
  // le code) ; un useMemo manuel entrait en conflit avec son optimisation.
  const q = query.trim().toLowerCase();
  const suggestions = q ? categories.filter((c) => !selected.includes(c.id) && c.name.toLowerCase().includes(q)).slice(0, 6) : [];

  const exactMatchExists = categories.some((c) => c.name.toLowerCase() === q);

  function remove(id: string) {
    setSelected((prev) => prev.filter((s) => s !== id));
  }

  function add(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setQuery("");
  }

  function handleCreate() {
    const name = query.trim();
    if (!name) return;
    startTransition(async () => {
      // findOrCreateCategory (server) réutilise déjà un thème existant du
      // même nom (recherche insensible à la casse) plutôt que d'en créer un
      // doublon — jamais besoin de le revérifier ici.
      const created = await createCategoryFromPicker(name);
      if (created) {
        setCategories((prev) => (prev.some((c) => c.id === created.id) ? prev : [...prev, created]));
        add(created.id);
      }
    });
  }

  return (
    <div>
      {selected.map((id) => (
        <input key={id} type="hidden" name="category_ids" value={id} />
      ))}

      {selectedCategories.length > 0 && (
        <div className="chip-row" style={{ marginBottom: 10 }}>
          {selectedCategories.map((c) => (
            <span key={c.id} className="chip" style={{ background: "var(--purple)", color: "#fff" }}>
              {c.name}
              <button
                type="button"
                onClick={() => remove(c.id)}
                aria-label={`Retirer le thème ${c.name}`}
                title="Retirer"
                style={{ background: "none", border: 0, color: "#fff", cursor: "pointer", padding: 0, fontSize: 13, lineHeight: 1, fontFamily: "inherit" }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Chercher ou créer un thème…"
          style={{ width: "100%", padding: "7px 10px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 12.5 }}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            if (suggestions[0]) add(suggestions[0].id);
            else if (query.trim()) handleCreate();
          }}
        />
        {query.trim() && (
          <div className="category-suggestions">
            {suggestions.map((c) => (
              <button key={c.id} type="button" onClick={() => add(c.id)} className="category-suggestion">
                {c.name}
              </button>
            ))}
            {!exactMatchExists && (
              <button type="button" onClick={handleCreate} disabled={isPending} className="category-suggestion category-suggestion-create">
                {isPending ? "Création…" : `+ Créer « ${query.trim()} »`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
