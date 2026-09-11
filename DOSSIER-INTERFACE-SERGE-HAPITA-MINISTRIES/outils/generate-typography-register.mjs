import fs from "node:fs";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const cssFiles = ["styles.css", "publications.css", "commerce.css", "engagement.css"];
const cssDirectory = fs.existsSync(path.join(projectRoot, "dist")) ? "dist" : "prototype-html";
const outputFilename = cssDirectory === "dist"
  ? "REGISTRE-CSS-TYPOGRAPHIQUE.md"
  : "04-REGISTRE-CSS-TYPOGRAPHIQUE-EXHAUSTIF.md";
const typographyProperties = new Set([
  "font",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "letter-spacing",
  "line-height",
  "text-align",
  "text-transform",
  "white-space",
]);

function lineAt(source, index) {
  return source.slice(0, index).split("\n").length;
}

function matchingBrace(source, openIndex) {
  let depth = 0;
  let quote = null;
  for (let index = openIndex; index < source.length; index += 1) {
    const character = source[index];
    const previous = source[index - 1];
    if (quote) {
      if (character === quote && previous !== "\\") quote = null;
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return index;
  }
  throw new Error(`Accolade non fermée à l’index ${openIndex}`);
}

function declarationsFrom(block) {
  return block
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separator = item.indexOf(":");
      if (separator < 0) return null;
      const property = item.slice(0, separator).trim();
      const value = item.slice(separator + 1).trim();
      return typographyProperties.has(property) ? `${property}: ${value}` : null;
    })
    .filter(Boolean);
}

function parseRules(source, start = 0, end = source.length, media = "Base") {
  const rules = [];
  let cursor = start;
  while (cursor < end) {
    const open = source.indexOf("{", cursor);
    if (open < 0 || open >= end) break;
    const selector = source.slice(cursor, open).trim();
    const close = matchingBrace(source, open);
    if (close > end) break;
    const block = source.slice(open + 1, close);
    if (selector.startsWith("@media")) {
      rules.push(...parseRules(source, open + 1, close, selector));
    } else if (!selector.startsWith("@") && !block.includes("{")) {
      const declarations = declarationsFrom(block);
      if (declarations.length) {
        rules.push({ line: lineAt(source, cursor), media, selector, declarations });
      }
    }
    cursor = close + 1;
  }
  return rules;
}

function escapeCell(value) {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

const output = [
  "# Registre CSS typographique exhaustif",
  "",
  "**Document généré depuis les quatre CSS du prototype. Il ne constitue pas une proposition : il inventorie les valeurs normatives à reproduire.**",
  "",
  "Toute modification typographique doit d’abord être effectuée dans les CSS, puis ce registre doit être régénéré. Les valeurs dans la colonne `Déclarations exactes` ne doivent être ni arrondies, ni remplacées par une échelle approchante.",
  "",
];

let total = 0;
for (const file of cssFiles) {
  const sourcePath = path.join(projectRoot, cssDirectory, file);
  const source = fs.readFileSync(sourcePath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = parseRules(source);
  total += rules.length;
  output.push(`## ${file}`, "", `**${rules.length} règles typographiques.**`, "", "| Ligne | Contexte | Sélecteur | Déclarations exactes |", "|---:|---|---|---|");
  for (const rule of rules) {
    output.push(`| ${rule.line} | ${escapeCell(rule.media)} | \`${escapeCell(rule.selector)}\` | \`${escapeCell(rule.declarations.join("; "))}\` |`);
  }
  output.push("");
}

output.splice(5, 0, `**Total contrôlé : ${total} règles typographiques.**`, "");
fs.writeFileSync(path.join(projectRoot, outputFilename), `${output.join("\n")}\n`);
