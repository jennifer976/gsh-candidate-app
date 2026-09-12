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
const guides = JSON.parse(fs.readFileSync(path.join(root, "data/candidateCountryGuides.json"), "utf8")).guides;
const resolved = ["uk", "ireland", "germany", "canada", "australia", "usa", "uae", "singapore", "netherlands", "new-zealand"].map(country => {
  const link = resolve(`/jobs/country/${country}?from=resources#guide`);
  assert.equal(link.kind, "appGuide", country);
  assert(guides.some(guide => guide.slug === link.slug), `${country}: guide must exist in the shipped app data`);
  return link.slug;
});
assert.equal(new Set(resolved).size, 10);
assert.deepEqual(resolve("/jobs/country/united-kingdom"), resolve("/jobs/country/UK"));
assert.deepEqual(resolve("/jobs/country/united-states"), resolve("/jobs/country/usa"));
assert.deepEqual(resolve("/jobs/country/unknown-country"), { kind: "discover" });
assert.equal(resolve("/jobs/not-a-country"), null);
console.log("All 10 country links open existing guides; aliases and fallback checked.");
