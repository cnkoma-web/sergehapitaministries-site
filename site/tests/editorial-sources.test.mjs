import test from "node:test";
import assert from "node:assert/strict";
import { parseDailySources, isEditorialDate } from "../src/lib/content/dailySourceParser.ts";
import { editorialClock } from "../src/lib/content/editorialClock.ts";

const source = "LUNDI 26 OCTOBRE 2026\n1/ QUE DIT LA BIBLE?\nBible\n2/ROSEE MATINALE\nRosée\n3/ JE CONFESSE\nConfession";
test("les trois rubriques du jour sont isolées des autres dates", () => {
  const result = parseDailySources("DIMANCHE 25 OCTOBRE 2026\n1/ QUE DIT LA BIBLE?\nAncien\n" + source + "\nMARDI 27 OCTOBRE 2026\n1/ QUE DIT LA BIBLE?\nSuivant", "2026-10-26");
  assert.deepEqual(result.sections, { qdlb: "Bible", rm: "Rosée", jc: "Confession" });
  assert.deepEqual(result.missing, []);
});
test("une source absente ne reprend jamais celle de la veille", () => {
  assert.deepEqual(parseDailySources(source, "2026-10-27").missing, ["qdlb", "rm", "jc"]);
});
test("une rubrique vide est signalée", () => {
  assert.deepEqual(parseDailySources(source.replace("Rosée", ""), "2026-10-26").missing, ["rm"]);
});
test("une rubrique répétée bloque au lieu d'écraser silencieusement", () => {
  assert.throws(() => parseDailySources(source + "\n2/ROSEE MATINALE\nAutre", "2026-10-26"), /ambiguë/);
});
test("les dates impossibles et les jours incohérents bloquent la collecte", () => {
  assert.equal(isEditorialDate("2026-02-30"), false);
  assert.equal(isEditorialDate("2028-02-29"), true);
  assert.throws(() => parseDailySources(source, "2026-02-30"), /invalide/);
  assert.throws(() => parseDailySources(source.replace("LUNDI", "MARDI"), "2026-10-26"), /invalide/);
});
test("23 h Paris correspond à 22 h UTC en hiver et 21 h UTC en été", () => {
  assert.deepEqual(editorialClock(new Date("2026-10-26T22:00:00Z")), { today: "2026-10-26", targetDate: "2026-10-27", collectionDue: true });
  assert.equal(editorialClock(new Date("2026-07-01T21:00:00Z")).collectionDue, true);
  assert.equal(editorialClock(new Date("2026-07-01T22:00:00Z")).collectionDue, false);
});
test("le passage à l'heure d'hiver conserve une seule collecte à 23 h", () => {
  assert.equal(editorialClock(new Date("2026-10-25T21:00:00Z")).collectionDue, false);
  assert.equal(editorialClock(new Date("2026-10-25T22:00:00Z")).collectionDue, true);
});
