// Refresh the offline snapshot from the maintained frontend source before a release.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = process.argv[2];
if (!source) throw new Error("Pass the reviewed frontend src/data/candidateCountryGuides.json path.");
const target = path.join(root, "data/candidateCountryGuides.json");
const content = JSON.parse(fs.readFileSync(source, "utf8"));
const existing = JSON.parse(fs.readFileSync(target, "utf8"));
if (content.version !== 1 || !Array.isArray(content.guides) || content.guides.length !== existing.guides.length || new Set(content.guides.map(g => g.slug)).size !== content.guides.length) throw new Error("Invalid guide snapshot");
for (const guide of content.guides) {
 const old = existing.guides.find(g => g.slug === guide.slug);
 if (!old || guide.iso2 !== old.iso2 || !guide.title || !Array.isArray(guide.sections) || !guide.officialSourceUrl?.startsWith("https://") || Date.parse(guide.updatedISO) < Date.parse(old.updatedISO)) throw new Error("Review changed guide identity/date: " + guide.slug);
}
const next = JSON.stringify(content, null, 2) + "\n";
if (fs.readFileSync(target, "utf8") !== next) fs.writeFileSync(target, next);
console.log(`Offline guide snapshot: ${content.guides.length} countries, ${content.updatedISO}`);
