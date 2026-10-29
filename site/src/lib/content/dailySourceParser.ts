/** Extraction des sources datées du Google Docs SHM, sans publication. */
export type SourceSection = "qdlb" | "rm" | "jc";
export type DailySource = { date: string; sections: Partial<Record<SourceSection, string>>; missing: SourceSection[] };

const headings: [SourceSection, RegExp][] = [
  ["qdlb", /^\s*1\s*\/\s*QUE\s+DIT\s+LA\s+BIBLE\s*\??\s*$/i],
  ["rm", /^\s*2\s*\/\s*ROS[EÉ]E\s+MATINALE\s*$/i],
  ["jc", /^\s*3\s*\/\s*JE\s+CONFESSE\s*$/i],
];
const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const months = ["JANVIER","FEVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOUT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DECEMBRE"];

export function isEditorialDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T12:00:00Z");
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function dateFromHeading(line: string): string | null {
  const clean = line.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  const pattern = new RegExp(`^(${days.join("|")})\\s+(\\d{1,2})\\s+(${months.join("|")})\\s+(\\d{4})$`);
  const match = clean.match(pattern);
  if (!match) return null;
  const month = months.indexOf(match[3]) + 1;
  const value = `${match[4]}-${String(month).padStart(2,"0")}-${match[2].padStart(2,"0")}`;
  if (!isEditorialDate(value) || days[new Date(value + "T12:00:00Z").getUTCDay()] !== match[1]) {
    throw new Error("Date de source invalide : " + line.trim());
  }
  return value;
}

export function parseDailySources(documentText: string, targetDate: string): DailySource {
  if (!isEditorialDate(targetDate)) throw new Error("Date cible invalide.");
  const lines = documentText.replace(/\r/g, "").replace(/^\uFEFF/, "").split("\n");
  const sections: Partial<Record<SourceSection, string>> = {};
  const seen = new Set<SourceSection>();
  let activeDate: string | null = null;
  let activeSection: SourceSection | null = null;
  let buffer: string[] = [];
  function flush() {
    if (activeDate === targetDate && activeSection) {
      const text = buffer.join("\n").trim();
      if (text) sections[activeSection] = text;
    }
    buffer = [];
  }
  for (const line of lines) {
    const date = dateFromHeading(line);
    if (date) { flush(); activeDate = date; activeSection = null; continue; }
    const section = headings.find(([, re]) => re.test(line))?.[0];
    if (section) {
      flush();
      if (activeDate === targetDate) {
        if (seen.has(section)) throw new Error("Source quotidienne ambiguë : rubrique répétée " + section);
        seen.add(section);
      }
      activeSection = section;
      continue;
    }
    if (activeSection && activeDate === targetDate) buffer.push(line);
  }
  flush();
  const missing = headings.map(([key]) => key).filter(key => !sections[key]);
  return { date: targetDate, sections, missing };
}
