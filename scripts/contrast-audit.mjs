/**
 * Pack 27 contrast audit: flag navy fills that still paint navy text/icons.
 * Node 20, no packages.
 *
 * Scans app/ and components/ .tsx files for StyleSheet entries whose
 * backgroundColor is navy (colors.navy|brand|navyMid|bgDark|"#0d194e"),
 * then finds JSX that uses that style and contains Ionicons/Icon/Text with
 * a navy colour. Exit 1 if any; exit 0 if none.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = [path.join(root, "app"), path.join(root, "components")];

// Word-boundary after token so colors.brand does not match colors.brandSoft.
const NAVY_BG = String.raw`(?:colors\.(?:navy|brand|navyMid|bgDark)\b|["']#0d194e["'])`;
const NAVY_FG = String.raw`(?:colors\.(?:navy|brand|navyMid|bgDark|textPrimary|foreground|purpleText|purpleTextDark)\b|["']#0d194e["'])`;

/** Full-screen shells / progress chrome — not content contrast bugs. */
const ALLOW_STYLE_NAMES = new Set([
  "root",
  "safe",
  "shell",
  "brand",
  "stepLineOn",
  "strengthBarOn",
  "bulletDot",
  "headerStyle",
  "scrollPad",
]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, name.name);
    if (name.isDirectory()) walk(full, out);
    else if (name.name.endsWith(".tsx")) out.push(full);
  }
  return out;
}

function lineOf(source, index) {
  return source.slice(0, index).split(/\r?\n/).length;
}

function extractStyleSheet(source) {
  const start = source.search(/StyleSheet\.create\s*\(\s*\{/);
  if (start < 0) return null;
  let i = source.indexOf("{", start);
  let depth = 0;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return { block: source.slice(start, i + 1), offset: start };
    }
  }
  return null;
}

function navyStyleNames(styleBlock) {
  const names = [];
  const entryRe = /(\w+)\s*:\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
  let m;
  while ((m = entryRe.exec(styleBlock))) {
    const name = m[1];
    const body = m[2];
    if (ALLOW_STYLE_NAMES.has(name)) continue;
    if (!new RegExp(String.raw`backgroundColor\s*:\s*${NAVY_BG}`).test(body)) continue;
    // Same object already sets a light foreground — ok
    if (
      /color\s*:\s*(?:colors\.(?:white|cyan|onNavy2|textOnDark|teal|accent)\b|["']#(?:fff|ffffff|42e0e3)["']|["']rgba\(\s*255)/i.test(
        body,
      )
    ) {
      continue;
    }
    names.push({ name, body, selfNavyText: new RegExp(String.raw`color\s*:\s*${NAVY_FG}`).test(body) });
  }
  return names;
}

function findNavyContentNearStyleUse(source, styleName) {
  const useRe = new RegExp(String.raw`styles\.${styleName}\b`, "g");
  const hits = [];
  let m;
  while ((m = useRe.exec(source))) {
    // Tight window: style use → nearby Ionicons/Text with navy colour (icon-tile / CTA pattern)
    const from = m.index;
    const to = Math.min(source.length, m.index + 280);
    const window = source.slice(from, to);
    const navyIon = new RegExp(
      String.raw`<(?:Ionicons|Icon|Feather)\b[^>]*\bcolor=\{${NAVY_FG}\}`,
    );
    const navyInline = new RegExp(String.raw`\bcolor=\{${NAVY_FG}\}`);
    // Text using a sibling style is checked via selfNavyText on the style object itself
    if (navyIon.test(window) || /<(?:Text)\b[^>]*style=\{\[[^\]]*\{[^}]*color:\s*/.test(window) && navyInline.test(window)) {
      hits.push(lineOf(source, m.index));
    }
  }
  return hits;
}

const findings = [];

for (const dir of dirs) {
  for (const file of walk(dir)) {
    const source = fs.readFileSync(file, "utf8");
    const sheet = extractStyleSheet(source);
    if (!sheet) continue;
    const names = navyStyleNames(sheet.block);
    const rel = path.relative(root, file).replace(/\\/g, "/");
    for (const { name, selfNavyText } of names) {
      if (selfNavyText) {
        // Style object itself paints navy text on navy fill
        const idx = sheet.block.indexOf(name);
        findings.push({
          file: rel,
          line: lineOf(source, sheet.offset + Math.max(0, idx)),
          style: name,
        });
        continue;
      }
      for (const line of findNavyContentNearStyleUse(source, name)) {
        findings.push({ file: rel, line, style: name });
      }
    }
  }
}

const seen = new Set();
const unique = findings.filter((f) => {
  const key = `${f.file}:${f.line}:${f.style}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

if (unique.length) {
  console.error("Navy-on-navy contrast issues:");
  for (const f of unique) {
    console.error(`  ${f.file}:${f.line}  style=${f.style}`);
  }
  process.exit(1);
}

console.log("contrast-audit: ok (no navy-on-navy content found)");
process.exit(0);
