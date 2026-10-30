/**
 * Pack 27: SITE_FLAGS must include all 19 guide country codes,
 * and each value must start with "<svg".
 */
import { SITE_FLAGS } from "../lib/brand/siteFlags.ts";

const REQUIRED = [
  "au",
  "ca",
  "dk",
  "fi",
  "fr",
  "de",
  "is",
  "ie",
  "nl",
  "nz",
  "no",
  "pt",
  "sg",
  "es",
  "se",
  "ch",
  "ae",
  "gb",
  "us",
];

const errors = [];

for (const code of REQUIRED) {
  const svg = SITE_FLAGS[code];
  if (typeof svg !== "string") {
    errors.push(`missing SITE_FLAGS["${code}"]`);
    continue;
  }
  if (!svg.startsWith("<svg")) {
    errors.push(`SITE_FLAGS["${code}"] does not start with "<svg"`);
  }
}

const extra = Object.keys(SITE_FLAGS).filter((k) => !REQUIRED.includes(k));
if (Object.keys(SITE_FLAGS).length !== REQUIRED.length) {
  errors.push(
    `expected ${REQUIRED.length} flags, got ${Object.keys(SITE_FLAGS).length}` +
      (extra.length ? ` (extra: ${extra.join(", ")})` : ""),
  );
}

if (errors.length) {
  console.error("site-flags.test.mjs FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`site-flags.test.mjs OK — ${REQUIRED.length} flags`);
