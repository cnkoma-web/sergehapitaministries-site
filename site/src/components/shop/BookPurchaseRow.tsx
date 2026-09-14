"use client";

import { useState } from "react";
import AddToCartButton from "@/components/cart/AddToCartButton";

// Sélecteur de quantité avant ajout (fiche Livre, reconstruction Phase B2) —
// fonction réelle manquante identifiée en Phase A (la maquette prévoit
// § .quantity-control, la V2 ajoutait toujours 1 au panier). Composant
// client dédié car la quantité choisie doit être connue au moment du clic
// sur "Ajouter au panier" (état partagé entre les deux contrôles, comme
// GoodiePurchasePanel pour taille/couleur). Raccordé à AddToCartButton via
// sa nouvelle prop optionnelle `quantity` — aucun autre usage
// (Hub Livres/Boutique) n'est affecté.
export default function BookPurchaseRow({ bookId }: { bookId: string }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="v2-purchase-row">
      <div className="v2-quantity-control">
        <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1} aria-label="Diminuer la quantité">
          −
        </button>
        <output>{quantity}</output>
        <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Augmenter la quantité">
          +
        </button>
      </div>
      <AddToCartButton bookId={bookId} quantity={quantity} className="v2-add-to-cart-primary" label="Ajouter au panier" />
    </div>
  );
}
