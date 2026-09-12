const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const file = path.join(root, 'lib/guides/translateCountryGuide.ts');
const loaded = new Module(file, module);
loaded.filename = file;
loaded.paths = Module._nodeModulePaths(path.dirname(file));
loaded._compile(ts.transpileModule(fs.readFileSync(file, 'utf8').replaceAll('"@/data/', '"../../data/'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
}).outputText, file);
const { translateCountryGuide } = loaded.exports;
const source = require('../data/countryGuideTranslationSource.json');
const current = require('../data/candidateCountryGuides.json');
assert.deepEqual(source, current, 'Review translations when the offline country source changes.');
for (const guide of source.guides) {
  const before = JSON.stringify(guide);
  for (const locale of ['en', 'fr', 'de', 'es', 'pt', 'it', 'nl', 'pl']) {
    const translated = translateCountryGuide(guide, locale);
    assert.equal(translated.contentLanguage, locale);
    assert.equal(translated.slug, guide.slug);
    assert.equal(translated.iso2, guide.iso2);
    assert.equal(translated.updatedISO, guide.updatedISO);
    assert.equal(translated.officialSourceUrl, guide.officialSourceUrl);
    assert.deepEqual(translated.partnerLinks.map(l => l.href), guide.partnerLinks.map(l => l.href));
    assert.equal(translated.sections.length, guide.sections.length);
    if (locale !== 'en') {
      assert.notEqual(translated.title, guide.title);
      assert.notEqual(translated.sections[0].paragraphs[0], guide.sections[0].paragraphs[0]);
    }
  }
  assert.equal(JSON.stringify(guide), before, 'Translation must not mutate the original.');
  const changed = { ...guide, openingHook: 'New official information, same review date.' };
  assert.equal(translateCountryGuide(changed, 'de').contentLanguage, 'en');
  assert.equal(translateCountryGuide(changed, 'de').openingHook, changed.openingHook);
  const reordered = Object.fromEntries(Object.entries(guide).reverse());
  assert.equal(translateCountryGuide(reordered, 'fr').contentLanguage, 'fr');
}
console.log(`Passed ${source.guides.length} countries × 8 languages, identifiers/links, source changes and mutation checks.`);
