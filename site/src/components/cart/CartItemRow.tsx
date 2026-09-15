"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCartItemQuantity, removeCartItem } from "@/lib/cart/actions";

export default function CartItemRow({ id, quantity }: { id: string; quantity: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Bornée [1, 99] (reprise 15/09) : le vrai comportement de la maquette
  // (commerce.js § renderCart, cart[index].quantity = Math.max(1,
  // Math.min(99, ...))) ne supprime JAMAIS un article en décrémentant sa
  // quantité — le retrait passe uniquement par le bouton "Retirer" dédié.
  // La V2 laissait auparavant updateCartItemQuantity supprimer la ligne
  // dès que la quantité tombait à 0, un comportement réel différent de
  // celui de la maquette (vérifié en direct sur le panier réel : "−" à
  // quantité 1 faisait disparaître l'article). Corrigé côté client, sans
  // toucher au filet de sécurité de l'action serveur (quantity<=0 -> delete,
  // désormais inatteignable depuis ce bouton).
  function changeQty(delta: number) {
    const next = Math.max(1, Math.min(99, quantity + delta));
    if (next === quantity) return;
    const formData = new FormData();
    formData.set("id", id);
    formData.set("quantity", String(next));
    startTransition(async () => {
      await updateCartItemQuantity(formData);
      router.refresh();
    });
  }

  function remove() {
    const formData = new FormData();
    formData.set("id", id);
    startTransition(async () => {
      await removeCartItem(formData);
      router.refresh();
    });
  }

  return (
    <>
      {/* aria-label ajoutés (reprise 15/09) : présents sur les boutons
          réels de la maquette (data-cart-delta), absents ici. */}
      <div className="qty-control" aria-label="Quantité">
        <button className="qty-btn" onClick={() => changeQty(-1)} disabled={isPending} aria-label="Diminuer la quantité">
          −
        </button>
        <span className="qty-val">{quantity}</span>
        <button className="qty-btn" onClick={() => changeQty(1)} disabled={isPending} aria-label="Augmenter la quantité">
          +
        </button>
      </div>
      <button className="remove-item" onClick={remove} disabled={isPending}>
        Retirer
      </button>
    </>
  );
}
