// Frais de port (règle donnée par Serge, 27/08/2026) :
// - France métropolitaine : 7 € pour le 1er livre, +2 € par livre
//   supplémentaire, gratuit à partir de 35 € d'achat. Le "+2 €" est une
//   estimation de départ, à ajuster une fois le vrai coût d'un envoi groupé connu.
// - Reste du monde (Suisse incluse) : 15 € forfaitaires, toujours, quelle que
//   soit la quantité ou le montant (pas de seuil de gratuité).
// Stripe Checkout ne recalcule pas dynamiquement selon le pays tapé par le
// client dans la même session : les deux tarifs sont proposés comme deux
// options de livraison nommées, et le client choisit celle qui correspond à
// son adresse — la logique de calcul (paliers, seuil de gratuité) est bien
// appliquée automatiquement en fonction du panier, seule la sélection du bon
// pays reste manuelle.
const FIRST_ITEM_SHIPPING_CENTS = 700;
const EXTRA_ITEM_SHIPPING_CENTS = 200;
const FREE_SHIPPING_THRESHOLD_CENTS = 3500;
const INTERNATIONAL_SHIPPING_CENTS = 1500;

export function computeDomesticShippingCents(subtotalCents: number, totalQuantity: number): number {
  if (subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) return 0;
  if (totalQuantity <= 0) return 0;
  return FIRST_ITEM_SHIPPING_CENTS + (totalQuantity - 1) * EXTRA_ITEM_SHIPPING_CENTS;
}

export function internationalShippingCents(): number {
  return INTERNATIONAL_SHIPPING_CENTS;
}

// Pays couverts par l'option "France métropolitaine" (un seul) et par
// l'option "International" (liste large mais non exhaustive — à étendre au
// besoin, ce n'est qu'une liste de pays autorisés à la saisie d'adresse,
// pas une règle tarifaire en soi).
export const DOMESTIC_COUNTRY = "FR" as const;
export const INTERNATIONAL_COUNTRIES = [
  "CH", "BE", "LU", "DE", "ES", "IT", "PT", "NL", "GB", "IE",
  "AT", "DK", "SE", "FI", "NO", "PL", "CA", "US",
] as const;
