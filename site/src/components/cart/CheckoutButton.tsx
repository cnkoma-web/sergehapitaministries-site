"use client";

import { useState, useTransition } from "react";
import { createCartCheckoutSession } from "@/lib/stripe/checkout";

const ERROR_MESSAGES: Record<string, string> = {
  "empty-cart": "Votre panier est vide.",
  "missing-price": "Un article n'a pas encore de prix — retirez-le avant de continuer.",
  "order-failed": "Impossible de préparer votre commande. Réessayez dans un instant.",
  "stripe-failed": "Impossible de contacter le service de paiement. Réessayez dans un instant.",
};

export default function CheckoutButton({ disabled }: { disabled?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await createCartCheckoutSession();
      // En cas de succès, createCartCheckoutSession redirige côté serveur —
      // cette ligne n'est atteinte qu'en cas d'erreur.
      if (result?.error) setError(ERROR_MESSAGES[result.error] ?? "Une erreur est survenue.");
    });
  }

  return (
    <>
      {error && (
        <div className="admin-error" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
      {/* className "checkout-button" ajoutée (chantier Panier, 15/09) : le
          bouton retombait sur le style générique .btn.btn-primary (pilule,
          radius 999px, padding 14px 26px) au lieu de l'interface réelle de
          la maquette (§ .checkout-button — pleine largeur, radius 7px,
          min-height 53px, dégradé spécifique) ; "btn btn-primary" conservée
          pour ne rien casser ailleurs si ce composant était un jour
          réutilisé, la règle scopée .v2-panier-page .checkout-button
          l'emporte ici. */}
      <button
        className="btn btn-primary checkout-button"
        style={{ width: "100%", justifyContent: "center", marginTop: 22 }}
        onClick={handleClick}
        disabled={disabled || isPending}
      >
        {isPending ? "Redirection…" : "Passer la commande →"}
      </button>
    </>
  );
}
