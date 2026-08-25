export function formatPrice(cents: number | null): string {
  if (cents == null) return "Prix à venir";
  return (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}
