/** Horloge éditoriale : le calendrier est toujours celui de Paris. */
export function editorialClock(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const part = (name: string) => parts.find(p => p.type === name)!.value;
  const today = `${part("year")}-${part("month")}-${part("day")}`;
  const next = new Date(today + "T12:00:00Z");
  next.setUTCDate(next.getUTCDate() + 1);
  return { today, targetDate: next.toISOString().slice(0, 10), collectionDue: part("hour") === "23" };
}
