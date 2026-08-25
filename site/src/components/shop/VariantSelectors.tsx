"use client";

import { useState } from "react";

export default function VariantSelectors({ sizes, colors }: { sizes: string[]; colors: string[] }) {
  const [size, setSize] = useState(sizes[0]);
  const [color, setColor] = useState(colors[0]);

  return (
    <>
      {sizes.length > 0 && (
        <div>
          <span className="selector-label">Taille</span>
          <div className="size-options">
            {sizes.map((s) => (
              <div key={s} className={`size-opt${s === size ? " active" : ""}`} onClick={() => setSize(s)}>
                {s}
              </div>
            ))}
          </div>
        </div>
      )}
      {colors.length > 0 && (
        <div>
          <span className="selector-label">Couleur</span>
          <div className="color-options">
            {colors.map((c) => (
              <div
                key={c}
                className={`color-opt${c === color ? " active" : ""}`}
                style={{ background: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
