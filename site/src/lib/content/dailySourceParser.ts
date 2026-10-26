/** Extraction des sources datées du Google Docs SHM, sans publication. */
export type SourceSection = "qdlb" | "rm" | "jc";
export type DailySource = { date: string; sections: Partial<Record<SourceSection, string>>; missing: SourceSection[] };

const headings: [SourceSection, RegExp][] = [
  ["qdlb", /^\s*1\s*\/\s*QUE\s+DIT\s+LA\s+BIBLE\s*\??\s*$/i],
  ["rm", /^\s*2\s*\/\s*ROS[EÉ]E\s+MATINALE\s*$/i],
  ["jc", /^\s*3\s*\/\s*JE\s+CONFESSE\s*$/i],
];
const days = ["DIMANCHE", "LUNDI", "MARDI", "MERCREDI", "JEUDI", "VENDREDI", "SAMEDI"];
const months = ["JANVIER","FÉVRIER","MARS","AVRIL","MAI","JUIN","JUILLET","AOÛT","SEPTEMBRE","OCTOBRE","NOVEMBRE","DÉCEMBRE"];
function dateFromHeading(line: string): string | null {
  const clean = line.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  const monthNames = months.map(m => m.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const pattern = new RegExp(`^(?:${days.join("|")})\\s+(\\d{1,2})\\s+(${monthNames.join("|")})\\s+(\\d{4})$`);
  const match = clean.match(pattern);
  if (!match) return null;
  const month = monthNames.indexOf(match[2]) + 1;
  const day = Number(match[1]);
  const year = Number(match[3]);
  const d = new Date(Date.UTC(year, month - 1, day));
  if (d.getUTCDate() !== day || d.getUTCMonth() + 1 !== month) return null;
  return `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}

export function parseDailySources(documentText: string, targetDate: string): DailySource {
  const lines = documentText.replace(/\r/g, "").replace(/^\uFEFF/, "").split("\n");
  const sections: Partial<Record<SourceSection, string>> = {};
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
  for (const line of [...lines, ""]) {
    const date = dateFromHeading(line);
    if (date) { flush(); activeDate = date; activeSection = null; continue; }
    const section = headings.find(([, re]) => re.test(line))?.[0];
    if (section) { flush(); activeSection = section; continue; }
    if (activeSection && activeDate === targetDate) buffer.push(line);
  }
  flush();
  const missing = headings.map(([k]) => k).filter(k => !sections[k]);
  return { date: targetDate, sections, missing };
}
