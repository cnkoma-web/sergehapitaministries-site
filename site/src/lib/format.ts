export function formatPrice(cents: number | null): string {
  if (cents == null) return "Prix à venir";
  return (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

/** Format de date/heure de publication imposé par le cahier (§6.5) :
 * "JJ/MM/AAAA · HHhMM" — la date vient du champ éditorial (article_date,
 * pas d'heure), l'heure vient de l'horodatage réel de création (created_at),
 * seule source d'heure existante tant qu'aucun réglage d'heure n'est saisi
 * par Serge. */
export function formatPublicationDateTime(articleDate: string, createdAt: string): string {
  const d = new Date(articleDate + "T00:00:00");
  const datePart = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const t = new Date(createdAt);
  const hh = String(t.getHours()).padStart(2, "0");
  const mm = String(t.getMinutes()).padStart(2, "0");
  return `${datePart} · ${hh}h${mm}`;
}
