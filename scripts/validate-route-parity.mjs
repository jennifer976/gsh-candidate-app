import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = join(root, "data", "public-route-parity.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const errors = [];

if (!manifest.source?.endsWith("/sitemap.xml")) errors.push("manifest source must be the public sitemap");
if (!Array.isArray(manifest.routes) || manifest.routes.length === 0) errors.push("route inventory is empty");

for (const [index, row] of (manifest.routes ?? []).entries()) {
  try {
    new RegExp(row.pattern);
  } catch {
    errors.push(`route ${index} has invalid pattern: ${row.pattern}`);
  }
  if (!["native", "native-query", "fallback"].includes(row.mode)) errors.push(`route ${index} has invalid mode`);
  if (row.mode.startsWith("native") && !row.target) errors.push(`route ${index} has no native target`);
  if (row.mode === "fallback" && row.target) errors.push(`fallback route ${index} must preserve its exact URL`);
  if (row.mode === "native" && row.target) {
    const route = row.target.replace(/^\/\(tabs\)/, "/(tabs)");
    const parts = route.slice(1).split("/");
    const candidate = join(root, "app", ...parts);
    const parent = join(root, "app", ...parts.slice(0, -1));
    const exists =
      existsSync(`${candidate}.tsx`) ||
      existsSync(join(candidate, "index.tsx")) ||
      existsSync(join(parent, "[id].tsx")) ||
      existsSync(join(parent, "[slug].tsx"));
    if (!exists) errors.push(`native target has no Expo route: ${row.target}`);
  }
}

const requiredPatterns = ["/resources", "/grow-your-network", "/companies", "/partners/directory"];
for (const required of requiredPatterns) {
  if (!manifest.routes.some((row) => row.pattern.includes(required.replaceAll("/", "\\/")) || row.pattern.includes(required))) {
    errors.push(`missing required public route coverage: ${required}`);
  }
}

const pushSource = readFileSync(join(root, "lib", "pushNavigate.ts"), "utf8");
if (pushSource.includes('router.push("/tools-resources")')) errors.push("push navigation still contains the unsafe catch-all redirect");
if (!pushSource.includes("resolvePublicRoute")) errors.push("push navigation does not use the parity resolver");

const firstMatch = (path) => manifest.routes.find((row) => new RegExp(row.pattern, "i").test(path));
const samples = [
  ["/resources", "native", "/resources"],
  ["/resources/job-offer-scam-checklist", "fallback", undefined],
  ["/grow-your-network", "fallback", undefined],
  ["/companies/acme-ltd", "native", "/company/$1"],
  ["/partners/directory/507f1f77bcf86cd799439011", "native", "/partner/$1"],
  ["/blog/feed.xml", "fallback", undefined],
];
for (const [path, mode, target] of samples) {
  const row = firstMatch(path);
  if (!row || row.mode !== mode || (target && row.target !== target)) {
    errors.push(`unexpected parity mapping for ${path}`);
  }
}

// When the website is checked out beside the app, require every maintained
// static sitemap path to have an explicit native or fallback policy.
const webSitemap = resolve(root, "..", "global_sponsor_hub-fe", "src", "app", "sitemap.ts");
if (existsSync(webSitemap)) {
  const sitemapSource = readFileSync(webSitemap, "utf8");
  const staticBlock = sitemapSource.match(/const STATIC_PATHS = \[([\s\S]*?)\] as const;/)?.[1] ?? "";
  const staticPaths = [...staticBlock.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  for (const path of staticPaths) {
    if (!firstMatch(path)) errors.push(`website sitemap path has no parity policy: ${path}`);
  }
}

if (errors.length) {
  console.error(`Route parity validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const native = manifest.routes.filter((row) => row.mode.startsWith("native")).length;
const fallback = manifest.routes.filter((row) => row.mode === "fallback").length;
console.log(`Route parity valid: ${native} native mappings, ${fallback} exact first-party fallback groups.`);
