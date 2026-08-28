"use client";

import { useState } from "react";
import type { LinkGroup } from "@/lib/content/linkableResources";

const CUSTOM_VALUE = "__custom__";
const NONE_VALUE = "__none__";

type Props = {
  name: string;
  groups: LinkGroup[];
  currentValue: string | null;
  /** Si true, propose "Aucun lien" comme option (ticker) ; sinon un lien est obligatoire (menu). */
  allowNone?: boolean;
};

// Sélecteur de destination : Serge choisit un livre/article/page par son titre
// dans une liste, jamais en tapant une adresse à la main — l'option "Autre
// lien" reste disponible pour un cas externe (ex. YouTube).
export default function LinkPicker({ name, groups, currentValue, allowNone = false }: Props) {
  const allOptions = groups.flatMap((g) => g.options);
  const matched = currentValue ? allOptions.find((o) => o.href === currentValue) : null;
  const initialMode = !currentValue ? (allowNone ? NONE_VALUE : CUSTOM_VALUE) : matched ? matched.href : CUSTOM_VALUE;

  const [selectValue, setSelectValue] = useState(initialMode);
  const [customValue, setCustomValue] = useState(matched ? "" : currentValue ?? "");

  const finalValue = selectValue === CUSTOM_VALUE ? customValue : selectValue === NONE_VALUE ? "" : selectValue;

  return (
    <div>
      <input type="hidden" name={name} value={finalValue} />
      <select
        value={selectValue}
        onChange={(e) => setSelectValue(e.target.value)}
        style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5, marginBottom: selectValue === CUSTOM_VALUE ? 6 : 0 }}
      >
        {allowNone && <option value={NONE_VALUE}>Aucun lien</option>}
        {groups.map((g) => (
          <optgroup key={g.groupLabel} label={g.groupLabel}>
            {g.options.map((o) => (
              <option key={o.href} value={o.href}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
        <option value={CUSTOM_VALUE}>Autre lien (adresse externe)…</option>
      </select>
      {selectValue === CUSTOM_VALUE && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => setCustomValue(e.target.value)}
          placeholder="https://... ou /une-adresse"
          style={{ width: "100%", padding: "9px 11px", border: "1px solid var(--line)", borderRadius: 6, fontSize: 13.5 }}
        />
      )}
    </div>
  );
}
