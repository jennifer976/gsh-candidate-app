#!/usr/bin/env node
/**
 * Copies the website's translations for English strings the app shows
 * (source literals plus synced website content) into data/accountCopy.json.
 * Existing app translations win. Usage:
 *   node scripts/sync-account-copy.cjs ../global_sponsor_hub-fe [--check]
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const check = args.includes("--check");
const webRoot = path.resolve(root, args.find((arg) => !arg.startsWith("--")) || "../global_sponsor_hub-fe");
const webCopy = JSON.parse(fs.readFileSync(path.join(webRoot, "src/data/accountCopy.json"), "utf8"));
const appPath = path.join(root, "data/accountCopy.json");
const appCopy = JSON.parse(fs.readFileSync(appPath, "utf8"));

const used = new Set();
function walkSource(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSource(full);
    else if (/\.tsx?$/.test(entry.name)) {
      const source = fs.readFileSync(full, "utf8");
      for (const match of source.matchAll(/"((?:[^"\\\n]|\\.)+)"/g)) {
        try {
          used.add(JSON.parse(`"${match[1]}"`));
        } catch {
          /* Not a plain JSON-compatible literal. */
        }
      }
    }
  }
}
for (const dir of ["app", "components", "lib"]) walkSource(path.join(root, dir));

function walkData(value) {
  if (typeof value === "string") used.add(value);
  else if (Array.isArray(value)) value.forEach(walkData);
  else if (value && typeof value === "object") Object.values(value).forEach(walkData);
}
const publicResources = JSON.parse(fs.readFileSync(path.join(root, "data/publicResources.json"), "utf8"));
walkData(publicResources.countries);
walkData(publicResources.templates);
const guides = JSON.parse(fs.readFileSync(path.join(root, "data/editorialGuides.en.json"), "utf8"));
for (const group of ["pillars", "relocation", "content"]) {
  for (const page of guides[group] ?? []) walkData([page.h1, page.metaDescription]);
}

let added = 0;
for (const locale of Object.keys(appCopy)) {
  const web = webCopy[locale] ?? {};
  for (const key of used) {
    if (appCopy[locale][key] !== undefined || typeof web[key] !== "string") continue;
    appCopy[locale][key] = web[key];
    added += 1;
  }
}

if (check) {
  if (added) {
    console.error(`${added} website translations are missing from data/accountCopy.json. Run the sync.`);
    process.exit(1);
  }
  console.log("App translations include every matching website translation.");
} else {
  fs.writeFileSync(appPath, `${JSON.stringify(appCopy, null, 2)}\n`);
  console.log(`Added ${added} translations across ${Object.keys(appCopy).length} languages.`);
}
