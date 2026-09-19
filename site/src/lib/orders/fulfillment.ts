export type OrderPaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type FulfillmentStatus = "confirmed" | "preparing" | "shipped" | "delivered";

export const PAYMENT_STATUS_LABEL: Record<OrderPaymentStatus, string> = {
  pending: "En attente de paiement",
  paid: "Paiement confirmé",
  failed: "Paiement échoué",
  refunded: "Remboursée",
};

export const FULFILLMENT_STATUS_LABEL: Record<FulfillmentStatus, string> = {
  confirmed: "Commande confirmée",
  preparing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
};

export const FULFILLMENT_STEPS = [
  { id: "confirmed", label: "Commande confirmée", dateKey: "confirmedAt" },
  { id: "preparing", label: "En préparation", dateKey: "preparingAt" },
  { id: "shipped", label: "Expédiée", dateKey: "shippedAt" },
  { id: "delivered", label: "Livrée", dateKey: "deliveredAt" },
] as const;

export const NEXT_FULFILLMENT_STATUS: Record<FulfillmentStatus, FulfillmentStatus | null> = {
  confirmed: "preparing",
  preparing: "shipped",
  shipped: "delivered",
  delivered: null,
};

export function isFulfillmentStatus(value: unknown): value is FulfillmentStatus {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(FULFILLMENT_STATUS_LABEL, value);
}

export function shortOrderReference(id: string): string {
  return id.replaceAll("-", "").slice(0, 8).toUpperCase();
}
