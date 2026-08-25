"use client";

import { useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";

type Props = {
  goodieId: string;
  sizes: string[];
  colors: string[];
  available: boolean;
  priceLabel: string;
};

// Regroupe la sélection taille/couleur, le prix et le bouton d'ajout au panier
// dans un seul composant client, pour que le panier connaisse la variante
// choisie au moment du clic (état partagé, impossible à séparer proprement
// entre plusieurs composants sans lever l'état plus haut).
export default function GoodiePurchasePanel({ goodieId, sizes, colors, available, priceLabel }: Props) {
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
              <div key={c} className={`color-opt${c === color ? " active" : ""}`} style={{ background: c }} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
      )}

      <div className="price-actions-row">
        <div className="product-price">{priceLabel}</div>
        <div className="product-actions">
          <Link href="/boutique" className="btn-compact btn-compact-outline" title="Retour à la boutique" aria-label="Retour à la boutique">
            ←
          </Link>
          {available ? (
            <AddToCartButton
              goodieId={goodieId}
              variantSize={size}
              variantColor={color}
              className="btn-compact btn-compact-primary"
              label="Ajouter au panier"
            />
          ) : (
            <button className="btn-compact btn-compact-primary" disabled title="Bientôt disponible">
              Bientôt disponible
            </button>
          )}
        </div>
      </div>
    </>
  );
}
