// Run before a coordinated frontend/mobile content release.
// node scripts/sync-localized-guides.cjs ../frontend [--check]
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const source = path.resolve(process.argv[2] || '../frontend', 'src/data/localizedGuides.json');
const target = path.resolve(__dirname, '../data/localizedGuides.json');
const bytes = fs.readFileSync(source), catalog = JSON.parse(bytes);
for (const [route, translations] of Object.entries(catalog)) {
  assert(route.startsWith('/') && !route.startsWith('//'), 'Invalid article path');
  for (const locale of ['en','fr','de','es','pt','it','nl','pl']) {
    const article = translations[locale];
    assert(article && article.path === route, `${route}: missing ${locale}`);
    for (const key of ['h1','intro','metaTitle','metaDescription','browseHref','browseLabel']) assert(article[key]?.trim(), `${route}/${locale}: missing ${key}`);
    assert(article.sections.length > 0 && article.sections.every(s => s.h2?.trim() && s.body?.trim()), `${route}/${locale}: incomplete sections`);
    assert(article.sections.length === translations.en.sections.length, `${route}/${locale}: section count differs`);
    assert(article.faqs.length === translations.en.faqs.length && article.faqs.every(f => f.question?.trim() && f.answer?.trim()), `${route}/${locale}: incomplete FAQs`);
  }
}
if (process.argv.includes('--check')) assert(fs.readFileSync(target).equals(bytes), 'App articles differ from frontend. Run the sync command.');
else fs.writeFileSync(target, bytes);
console.log(`${Object.keys(catalog).length} complete multilingual article(s): app and frontend match.`);
