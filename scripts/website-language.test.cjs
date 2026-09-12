const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const file=path.resolve(__dirname,'../lib/website-language.ts'),loaded=new Module(file,module);loaded.filename=file;
loaded._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,file);
const {websiteUrlWithLanguage}=loaded.exports;
for(const locale of ['en','fr','de','es','pt','it','nl','pl']){
 const value=new URL(websiteUrlWithLanguage('https://www.globalsponsorhub.com/tools?amount=50#result','https://www.globalsponsorhub.com',locale));
 assert.equal(value.searchParams.get('siteLanguage'),locale);assert.equal(value.searchParams.get('amount'),'50');assert.equal(value.hash,'#result');
}
for(const url of ['https://wise.com/?affiliate=keep%20exact','https://www.globalsponsorhub.com.evil.test/tools','https://user:pass@www.globalsponsorhub.com/tools','https://www.globalsponsorhub.com/api/data','mailto:example@example.test','not a url']){
 assert.equal(websiteUrlWithLanguage(url,'https://www.globalsponsorhub.com','fr'),url);
}
assert.equal(new URL(websiteUrlWithLanguage('https://www.globalsponsorhub.com/tools?siteLanguage=en','https://www.globalsponsorhub.com','de')).searchParams.getAll('siteLanguage').length,1);
console.log('Passed eight locales, retained query/fragment, third-party isolation, invalid inputs and locale replacement.');

const {websiteLanguageMessage}=loaded.exports;
for(const locale of ['en','fr','de','es','pt','it','nl','pl'])assert.equal(websiteLanguageMessage(JSON.stringify({type:'site-language-changed',locale}),'https://www.globalsponsorhub.com/candidate/tools','https://www.globalsponsorhub.com'),locale);
for(const [raw,url] of [[JSON.stringify({type:'site-language-changed',locale:'fr'}),'https://wise.com'],[JSON.stringify({type:'site-language-changed',locale:'fr'}),'https://www.globalsponsorhub.com.evil.test'],['bad json','https://www.globalsponsorhub.com'],[JSON.stringify({type:'other',locale:'fr'}),'https://www.globalsponsorhub.com'],[JSON.stringify({type:'site-language-changed',locale:'unknown'}),'https://www.globalsponsorhub.com']])assert.equal(websiteLanguageMessage(raw,url,'https://www.globalsponsorhub.com'),null);
console.log('Passed return-language messages and third-party/malformed-message isolation.');
