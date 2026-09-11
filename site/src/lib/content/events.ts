import { createClient } from "@/lib/supabase/server";

// V2 Lot 11 (11/09) — Agenda/Événements, nouvelle fonctionnalité additive.
// Voir supabase/migrations/20260911050000_events.sql pour le détail du
// choix de modèle (statut calculé depuis les dates, pas stocké).
export type Event = {
  id: string;
  title: string;
  type: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  location: string | null;
  external_url: string | null;
  position: number;
};

export type AdminEvent = Event & { visible: boolean };

const COLUMNS = "id, title, type, description, start_date, end_date, location, external_url, position";
const ADMIN_COLUMNS = `${COLUMNS}, visible`;

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Un événement est "à venir" tant que sa date de fin (ou sa date de début,
 * s'il n'en a pas) n'est pas encore passée — jamais un champ à mettre à
 * jour à la main, même principe que l'entrée du jour Rosée Matinale. */
function isUpcoming(e: { start_date: string; end_date: string | null }): boolean {
  return (e.end_date ?? e.start_date) >= todayISO();
}

/** Le prochain rendez-vous = le plus proche événement à venir (tri croissant
 * sur la date de début). Aucun événement à venir → null, l'appelant retombe
 * sur le texte de repli de la maquette ("Prochaines dates annoncées ici"). */
export async function getNextEvent(): Promise<Event | null> {
  const supabase = await createClient();
  // Un seul tri simple par date de début, filtré ensuite en mémoire avec
  // isUpcoming() (fin OU début selon ce que l'événement a) — plus fiable
  // qu'un filtre SQL à deux requêtes séparées (multi-jours vs un seul
  // jour) qui risquerait de rater le vrai plus proche des deux ensembles.
  const { data, error } = await supabase
    .from("events")
    .select(COLUMNS)
    .eq("visible", true)
    .order("start_date", { ascending: true })
    .limit(20);
  if (error || !data) return null;
  return data.find(isUpcoming) ?? null;
}

/** Les N derniers événements passés (cahier/maquette : 2 sur l'accueil),
 * les plus récents en premier. */
export async function getPastEvents(limit: number): Promise<Event[]> {
  const supabase = await createClient();
  // Filtré en mémoire avec !isUpcoming() plutôt qu'un simple "start_date <
  // aujourd'hui" en SQL (même raison qu'au-dessus) : un événement en cours
  // (commencé mais pas terminé) ne doit jamais apparaître ici tant qu'il
  // n'est pas vraiment fini, cohérent avec ce qui le fait sortir de
  // getNextEvent.
  const { data, error } = await supabase
    .from("events")
    .select(COLUMNS)
    .eq("visible", true)
    .order("start_date", { ascending: false })
    .limit(limit + 20);
  if (error || !data) return [];
  return data.filter((e) => !isUpcoming(e)).slice(0, limit);
}

/** "23–25 avril 2026" (même mois), "28 avril – 2 mai 2026" (mois différents,
 * même année), "29 déc. 2026 – 3 janv. 2027" (années différentes), "22 août
 * 2026" (un seul jour) — cahier §Lot 11, format du prototype reproduit pour
 * n'importe quelle combinaison réelle de dates, pas seulement les 2 exemples
 * fixes de la maquette. */
export function formatEventDateRange(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  if (!endDate || endDate === startDate) {
    return start.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }
  const end = new Date(endDate);
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();

  if (sameMonth) {
    const month = end.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return `${start.getDate()}–${end.getDate()} ${month}`;
  }
  const startPart = start.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: sameYear ? undefined : "numeric" });
  const endPart = end.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  return `${startPart} – ${endPart}`;
}

export { isUpcoming };

// ===== Admin (voit aussi les événements masqués) =====

export async function getEventsAdmin(page: number, perPage: number): Promise<{ events: AdminEvent[]; total: number }> {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const { data, error, count } = await supabase
    .from("events")
    .select(ADMIN_COLUMNS, { count: "exact" })
    .order("start_date", { ascending: false })
    .range(from, from + perPage - 1);
  if (error || !data) return { events: [], total: 0 };
  return { events: data, total: count ?? 0 };
}

export async function getEventByIdAdmin(id: string): Promise<AdminEvent | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("events").select(ADMIN_COLUMNS).eq("id", id).single();
  if (error || !data) return null;
  return data;
}
