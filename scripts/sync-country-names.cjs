#!/usr/bin/env node
/**
 * Hermes has no Intl.DisplayNames, so country names are generated here from
 * Node's full ICU (the same CLDR data browsers use) and bundled with the app.
 *   node scripts/sync-country-names.cjs          write data/countryNames.json
 *   node scripts/sync-country-names.cjs --check  verify every code has a name in every language
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outPath = path.join(root, "data/countryNames.json");
const LOCALES = { en: "en-GB", fr: "fr", de: "de", es: "es", pt: "pt", it: "it", nl: "nl", pl: "pl" };

const countriesSource = fs.readFileSync(path.join(root, "lib/countries.ts"), "utf8");
const isoList = countriesSource.match(/const ISO_ALPHA_2_CODES =\s*"([A-Z ]+)"/)?.[1];
if (!isoList) throw new Error("ISO_ALPHA_2_CODES not found in lib/countries.ts");
const options = JSON.parse(fs.readFileSync(path.join(root, "lib/country-options.json"), "utf8"));
const codes = [...new Set([...isoList.split(" "), ...options.map((option) => option.code)])].sort();

function problems(names) {
  const issues = [];
  for (const locale of Object.keys(LOCALES)) {
    for (const code of codes) {
      const name = names?.[locale]?.[code];
      if (typeof name !== "string" || !name.trim() || name === code) issues.push(`${locale}:${code}`);
    }
  }
  return issues;
}

function displayNamesCallers(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) displayNamesCallers(full, found);
    else if (/\.tsx?$/.test(entry.name) && fs.readFileSync(full, "utf8").includes("Intl.DisplayNames")) {
      found.push(path.relative(root, full));
    }
  }
  return found;
}

if (process.argv.includes("--check")) {
  const current = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, "utf8")) : null;
  const issues = problems(current);
  const callers = ["app", "components", "lib"].flatMap((dir) => displayNamesCallers(path.join(root, dir)));
  if (callers.length) {
    console.error(`Intl.DisplayNames is unavailable on Hermes; use countryDisplayName instead: ${callers.join(", ")}`);
    process.exit(1);
  }
  if (issues.length) {
    console.error(`Country names missing for ${issues.length} entries (e.g. ${issues.slice(0, 5).join(", ")}). Run node scripts/sync-country-names.cjs.`);
    process.exit(1);
  }
  console.log(`Country names cover ${codes.length} countries in ${Object.keys(LOCALES).length} languages.`);
} else {
  const names = Object.fromEntries(
    Object.entries(LOCALES).map(([locale, intl]) => {
      const display = new Intl.DisplayNames([intl], { type: "region" });
      return [locale, Object.fromEntries(codes.map((code) => [code, display.of(code)]))];
    }),
  );
  const issues = problems(names);
  if (issues.length) throw new Error(`This Node build lacks full ICU data (${issues.slice(0, 5).join(", ")}).`);
  fs.writeFileSync(outPath, `${JSON.stringify(names, null, 2)}\n`);
  console.log(`Wrote ${codes.length} countries in ${Object.keys(LOCALES).length} languages.`);
}
