"use client";

import { useState } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";

type Props = {
  goodieId: string;
  sizes: string[];
  colors: string[];
  available: boolean;
  priceLabel: string;
};

// RECONSTRUCTION (chantier Boutique — fiche Goodie, reprise) : la maquette
// réelle de la fiche produit (prototype-html/boutique/t-shirt-voix-
// prophetique/index.html § .product-choice/.product-disabled) ne connaît
// AUCUN sélecteur à vignettes (pas de couleurs/tailles cliquables) — elle
// utilise deux <select> classiques (Taille/Couleur), désactivés avec une
// seule option "À définir" tant que le produit n'est pas disponible, et un
// bouton pleine largeur unique. La version précédente (.selector-label/
// .size-options/.size-opt/.color-options/.color-opt/.price-actions-row)
// n'avait AUCUNE base dans la maquette (recherchée dans tout le prototype :
// aucune occurrence) — construite par analogie avec un patron de vignettes
// qui n'existe nulle part pour la Boutique. Reconstruit à l'identique de
// .product-choice/.product-disabled ; la fonction réelle (sélection
// effective, ajout au panier) est préservée, seule l'interface change.
export default function GoodiePurchasePanel({ goodieId, sizes, colors, available, priceLabel }: Props) {
  const [size, setSize] = useState(sizes[0] ?? "");
  const [color, setColor] = useState(colors[0] ?? "");

  return (
    <>
      {sizes.length > 0 && (
        <div className="product-choice">
          <label htmlFor="product-size">Taille</label>
          <select id="product-size" value={size} onChange={(e) => setSize(e.target.value)} disabled={!available}>
            {available ? sizes.map((s) => <option key={s} value={s}>{s}</option>) : <option>À définir</option>}
          </select>
        </div>
      )}
      {colors.length > 0 && (
        <div className="product-choice">
          <label htmlFor="product-color">Couleur</label>
          <select id="product-color" value={color} onChange={(e) => setColor(e.target.value)} disabled={!available}>
            {available ? colors.map((c) => <option key={c} value={c}>{c}</option>) : <option>À définir</option>}
          </select>
        </div>
      )}

      {available ? (
        <div className="product-price">{priceLabel}</div>
      ) : null}

      {available ? (
        <AddToCartButton
          goodieId={goodieId}
          variantSize={size}
          variantColor={color}
          className="product-cta"
          label="Ajouter au panier"
        />
      ) : (
        <button className="product-disabled" type="button" disabled>
          Produit à venir
        </button>
      )}
    </>
  );
}
