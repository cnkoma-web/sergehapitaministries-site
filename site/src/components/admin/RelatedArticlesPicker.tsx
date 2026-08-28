"use client";

import { useState } from "react";

type Option = { id: string; title: string };

export default function RelatedArticlesPicker({
  options,
  initialIds,
}: {
  options: Option[];
  initialIds: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialIds);

  function add(id: string) {
    if (!id || selected.includes(id)) return;
    setSelected((prev) => [...prev, id]);
  }
  function remove(id: string) {
    setSelected((prev) => prev.filter((s) => s !== id));
  }

  const available = options.filter((o) => !selected.includes(o.id));

  return (
    <div>
      {selected.map((id) => (
        <input key={id} type="hidden" name="related_article_ids" value={id} />
      ))}
      <div className="chip-row" style={{ marginBottom: 8 }}>
        {selected.map((id) => {
          const opt = options.find((o) => o.id === id);
          if (!opt) return null;
          return (
            <div className="chip" key={id}>
              {opt.title}
              <button type="button" onClick={() => remove(id)}>
                ×
              </button>
            </div>
          );
        })}
      </div>
      {available.length > 0 && (
        <select
          value=""
          onChange={(e) => add(e.target.value)}
          style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }}
        >
          <option value="">+ Ajouter un article similaire</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
