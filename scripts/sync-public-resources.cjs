// Copy the website's country hubs, candidate templates and job-label policy into the app.
// node scripts/sync-public-resources.cjs ../global_sponsor_hub-fe [--check]
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),assert=require('node:assert/strict');
const frontend=path.resolve(process.argv[2]||'../global_sponsor_hub-fe');
const ts=require(require.resolve('typescript',{paths:[frontend]}));
const resolve=Module._resolveFilename, extension=require.extensions['.ts'];
Module._resolveFilename=function(name,...args){return resolve.call(this,name.startsWith('@/')?path.join(frontend,'src',name.slice(2)):name,...args)};
require.extensions['.ts']=(m,file)=>m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);
const LOCALES=['en','fr','de','es','pt','it','nl','pl'];
try{
 const hubs=require(path.join(frontend,'src/data/seoHubs.ts'));
 const compare=require(path.join(frontend,'src/data/compareCountriesData.ts'));
 const living=require(path.join(frontend,'src/data/countryLivingSnapshots.ts'));
 const merged=require(path.join(frontend,'src/data/countryHubGuides.ts'));
 const resources=require(path.join(frontend,'src/data/candidateResources.ts'));
 const swiss=require(path.join(frontend,'src/data/switzerlandGuide.json'));
 const phrases=require(path.join(frontend,'src/data/countryPhrases.json'));
 const countriesPage=fs.readFileSync(path.join(frontend,'src/app/(web)/countries/page.tsx'),'utf8');
 const blurbSource=countriesPage.match(/const DESTINATION_BLURBS[^=]*=\s*(\{[\s\S]*?\n\});/)?.[1];
 assert(blurbSource,'Countries page blurbs not found');
 const blurbs=Function(`return (${blurbSource})`)();
 const countries=hubs.COUNTRY_HUBS.map(hub=>{
  const facts=compare.getCountryCompareBySlug(hub.slug);assert(facts,`Missing compare facts for ${hub.slug}`);
  const snapshot=living.COUNTRY_LIVING_SNAPSHOTS[hub.slug];
  const guide=merged.mergeCountryGuideContent(hub.slug,hub,'en');
  return{
   slug:hub.slug,name:hub.jobsLocationQuery,title:hub.metaTitle.replace(/\s*\|\s*Global Sponsor Hub$/,''),iso2:(snapshot?.iso2??facts.iso2).toLowerCase(),
   blurb:blurbs[hub.slug]??'Search labelled roles for this destination.',
   mainRoute:facts.mainRoute,pathType:facts.pathType,workLanguage:facts.workLanguage,currencyCode:facts.currencyCode,
   hiringSectors:facts.hiringSectors??[],familyNote:facts.familyNote,bestIf:facts.bestIf,watchOut:facts.watchOut,
   visaGuideSlug:merged.JOB_COUNTRY_SLUG_TO_VISA_GUIDE[hub.slug]??null,
   faqs:hub.faqs,officialLinks:guide.officialLinks??[],lastReviewed:guide.lastReviewed??null,
   phrases:(()=>{const iso=(snapshot?.iso2??facts.iso2).toUpperCase();assert(phrases[iso],`Missing reviewed phrases for ${iso}`);return phrases[iso];})(),
  };
 }).sort((a,b)=>a.name.localeCompare(b.name));
 const messages=Object.fromEntries(LOCALES.map(locale=>{
  const all=JSON.parse(fs.readFileSync(path.join(frontend,'messages',`${locale}.json`),'utf8'));
  assert(all.trustLabelJobs,`Missing trustLabelJobs copy for ${locale}`);return[locale,all.trustLabelJobs];
 }));
 const output={
  countries,
  switzerland:Object.fromEntries(LOCALES.map(locale=>[locale,swiss[locale]??swiss.en])),
  templates:resources.CANDIDATE_RESOURCES.map(resource=>{
   const sections=resources.getCandidateResourceEditorialSections(resource);
   for(const section of sections)for(const block of section.blocks)assert(['prose','callout','checklist','bullets','steps','table'].includes(block.type),`Template ${resource.slug} uses unsupported block ${block.type}`);
   return{...resource,sections};
  }),
  howWeLabelJobs:messages,
 };
 const content=JSON.stringify(output,null,2)+'\n',target=path.resolve(__dirname,'../data/publicResources.json');
 if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),content,'App public resources differ from the website. Run the sync command.');else fs.writeFileSync(target,content);
 console.log(`${countries.length} countries, ${output.templates.length} templates and job-label policy synced.`);
}finally{Module._resolveFilename=resolve;if(extension)require.extensions['.ts']=extension;else delete require.extensions['.ts'];}
