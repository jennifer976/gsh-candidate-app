const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=path.resolve(__dirname,'..'),cache=new Map();
function load(relative){
 let file=path.join(root,relative);if(!fs.existsSync(file))file+='.ts';if(file.endsWith('.json'))return JSON.parse(fs.readFileSync(file,'utf8'));
 if(cache.has(file))return cache.get(file).exports;
 const loaded=new Module(file,module);cache.set(file,loaded);loaded.filename=file;
 loaded.require=id=>id==='@/lib/brand-logo'?{resolveJobBrandLogo:()=>''}:id.startsWith('@/')?load(id.slice(2)):id.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),id))):require(id);
 loaded._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,file);return loaded.exports;
}
const {jobChipLabel,jobCountryLabel,jobMatchLabel,jobAgeLabel}=load('lib/job-presentation.ts');
const {getEmployerSponsorBadge,getJobEmployerLabel}=load('lib/job-display.ts');
const job={_id:'test',title:'Nurse',postedBy:{employerHiringModel:{offersSponsorship:true},sponsorLicense:{status:'Active',number:'example'}}};
const before=JSON.stringify(job);
for(const locale of ['en','fr','de','es','pt','it','nl','pl']){
 const messages=load(`lib/i18n/messages/${locale}.json`);
 assert.equal(jobChipLabel('No Sponsorship Available',locale),messages.jobNoSponsor);
 assert.equal(jobChipLabel('Cross-border Remote Allowed',locale),messages.jobGlobal);
 assert.equal(jobChipLabel('Free lunches',locale),'Free lunches');
 assert.equal(jobCountryLabel('Switzerland',locale),messages.jobSwitzerland);
 assert.equal(jobCountryLabel('Unlisted location',locale),'Unlisted location');
 assert.equal(jobMatchLabel('unknown_future_state',locale),messages.jobsMoreInfo);
 assert.equal(getEmployerSponsorBadge(job,locale).label,messages.jobsSponsorDeclared);
 assert.equal(getEmployerSponsorBadge({...job,mobility:['No Sponsorship Available']},locale),null);
 assert.equal(getEmployerSponsorBadge({...job,benefits:['no sponsorship available']},locale),null);
 assert.equal(getEmployerSponsorBadge({...job,postedBy:{...job.postedBy,employerHiringModel:{offersSponsorship:false}}},locale),null);
 assert.equal(getJobEmployerLabel({},locale),messages.screenEmployer);
 assert.equal(getJobEmployerLabel({companyName:'Employer'},locale),'Employer');
}
assert.equal(JSON.stringify(job),before);
assert.equal(jobAgeLabel('2026-09-11T12:00:00Z','fr',Date.parse('2026-09-10T12:00:00Z')),null);
assert.equal(jobAgeLabel('invalid','de'),null);
assert.equal(jobAgeLabel('2026-09-09T12:00:00Z','fr',Date.parse('2026-09-10T12:00:00Z')),'hier');
console.log('Passed eight-language job labels, negative sponsorship overrides, unknown values, company names and dates.');
