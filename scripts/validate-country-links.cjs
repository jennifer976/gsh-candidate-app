const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "lib/guides/countryHubInApp.ts");
const loaded = new Module(sourcePath, module);
loaded.filename = sourcePath;
loaded.paths = module.paths;
loaded._compile(ts.transpileModule(fs.readFileSync(sourcePath, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, sourcePath);
const { resolveJobsCountryHubPath: resolve } = loaded.exports;
const countries = JSON.parse(fs.readFileSync(path.join(root, "data/publicResources.json"), "utf8")).countries;
const resolved = countries.map(country => {
  const link = resolve(`/jobs/country/${country.slug}?from=resources#guide`);
  assert.equal(link.kind, "country", country.slug);
  assert.equal(link.slug, country.slug);
  return link.slug;
});
assert.equal(new Set(resolved).size, countries.length);
assert.deepEqual(resolve("/jobs/country/united-kingdom"), resolve("/jobs/country/UK"));
assert.deepEqual(resolve("/jobs/country/united-states"), resolve("/jobs/country/usa"));
assert.deepEqual(resolve("/jobs/country/unknown-country"), { kind: "discover" });
assert.equal(resolve("/jobs/not-a-country"), null);
console.log(`All ${countries.length} country links open country pages; aliases and fallback checked.`);
